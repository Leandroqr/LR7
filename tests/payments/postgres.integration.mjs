import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migrationsDirectory = join(repositoryRoot, "supabase/migrations");
const containerName = `lr7-wompi-test-${process.pid}`;
const dockerBinary = ["/usr/local/bin/docker", "/opt/homebrew/bin/docker", "/usr/bin/docker"]
  .find((candidate) => existsSync(candidate));
if (!dockerBinary) throw new Error("Docker CLI was not found in a standard system directory.");

function dockerSync(args, options = {}) {
  return spawnSync(dockerBinary, args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024, ...options });
}

function runPsql(sql) {
  return new Promise((resolveOutput, reject) => {
    const child = spawn(dockerBinary, ["exec", "-i", containerName, "psql", "-U", "postgres", "-d", "lr7_test", "-v", "ON_ERROR_STOP=1"], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolveOutput(`${stdout}${stderr}`) : reject(new Error(stderr || stdout || `psql exited ${code}`)));
    child.stdin.end(sql);
  });
}

function waitForPostgres(attempt = 0) {
  const logs = dockerSync(["logs", containerName]);
  const initComplete = `${logs.stdout ?? ""}${logs.stderr ?? ""}`.includes("PostgreSQL init process complete; ready for start up.");
  if (initComplete) {
    const result = dockerSync(["exec", containerName, "psql", "-U", "postgres", "-d", "lr7_test", "-Atc", "select 1"]);
    if (result.status === 0 && result.stdout.trim() === "1") return Promise.resolve();
  }
  if (attempt >= 40) return Promise.reject(new Error("The isolated PostgreSQL test container did not become ready."));
  return new Promise((resolveDelay) => setTimeout(resolveDelay, 500)).then(() => waitForPostgres(attempt + 1));
}

function applyMigrations() {
  const files = readdirSync(migrationsDirectory).filter((name) => name.endsWith(".sql")).sort();
  for (const file of files) {
    const migration = readFileSync(join(migrationsDirectory, file), "utf8");
    const result = dockerSync(["exec", "-i", containerName, "psql", "-U", "postgres", "-d", "lr7_test", "-v", "ON_ERROR_STOP=1"], { input: migration });
    if (result.status !== 0) throw new Error(`${file} failed in isolated PostgreSQL: ${result.stderr}`);
  }
}

async function main() {
  const start = dockerSync(["run", "--rm", "--detach", "--name", containerName, "-e", "POSTGRES_HOST_AUTH_METHOD=trust", "-e", "POSTGRES_DB=lr7_test", "postgres:16-alpine"]);
  if (start.status !== 0) throw new Error(`Docker is required for pnpm test:db: ${start.stderr}`);

  try {
    await waitForPostgres();
    await runPsql(`
      DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      CREATE SCHEMA auth;
      CREATE TABLE auth.users (id uuid PRIMARY KEY, raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      CREATE SCHEMA storage;
      CREATE TABLE storage.buckets (id text PRIMARY KEY, name text NOT NULL, public boolean NOT NULL DEFAULT false, file_size_limit bigint, allowed_mime_types text[]);
      CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text NOT NULL, name text NOT NULL);
    `);
    applyMigrations();
    await runPsql(`
      CREATE FUNCTION public.start_wompi_checkout(
        p_idempotency_key text, p_access_token_hash text, p_attempt_idempotency_key text, p_user_id uuid,
        p_customer_email text, p_customer_name text, p_customer_phone text, p_shipping_information jsonb,
        p_items jsonb, p_coupon_code text, p_environment text
      ) RETURNS jsonb LANGUAGE sql AS $$
        SELECT public.start_wompi_checkout(
          p_idempotency_key,
          encode(digest(jsonb_build_object('items',p_items,'coupon',p_coupon_code,'email',p_customer_email,'name',p_customer_name,'phone',p_customer_phone,'shipping',p_shipping_information)::text,'sha256'),'hex'),
          p_access_token_hash,p_attempt_idempotency_key,p_user_id,p_customer_email,p_customer_name,p_customer_phone,
          p_shipping_information,p_items,p_coupon_code,p_environment
        )
      $$;
    `);

    const cycleOutput = await runPsql(`
      UPDATE public.site_settings SET value = value || '{"shipping_cop":10000,"free_shipping_threshold_cop":200000}'::jsonb WHERE setting_key='commerce';
      INSERT INTO public.coupons(code, discount_type, discount_value, usage_limit, active) VALUES ('TEST10','percent',10,1,true);
      DO $$
      DECLARE created jsonb; retried jsonb; applied jsonb; order_id uuid; ref text; stock_value integer; coupon_uses integer; rejected boolean := false; payload_conflict boolean := false; parallel_rejected boolean := false; line_overflow_rejected boolean := false;
      BEGIN
        created := public.start_wompi_checkout('11111111-1111-4111-8111-111111111111',repeat('a',64),'22222222-2222-4222-8222-222222222222',null,'buyer@example.test','Test Buyer','3000000000','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-S","quantity":1,"price":1,"personalization":{"enabled":true,"name":"LEO","number":"10"}}]'::jsonb,'TEST10','sandbox');
        IF created->>'subtotal' <> '104000' OR created->>'shipping' <> '10000' OR created->>'discount' <> '10400' OR created->>'total' <> '103600' THEN RAISE EXCEPTION 'server total mismatch: %', created; END IF;
        order_id := (created->>'order_id')::uuid; ref := created->>'reference';
          BEGIN
            PERFORM public.start_wompi_checkout('11111111-1111-4111-8111-111111111111',repeat('a',64),'22222222-2222-4222-8222-222222222223',null,'buyer@example.test','Test Buyer','3000000000','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-S","quantity":1,"price":1,"personalization":{"enabled":true,"name":"LEO","number":"10"}}]'::jsonb,'TEST10','sandbox');
          EXCEPTION WHEN SQLSTATE 'P0001' THEN IF SQLERRM='checkout_attempt_pending' THEN parallel_rejected:=true; ELSE RAISE; END IF; END;
          IF NOT parallel_rejected THEN RAISE EXCEPTION 'parallel payment attempt reopened pending widget'; END IF;
        BEGIN
          PERFORM public.start_wompi_checkout('11111111-1111-4111-8111-111111111111',repeat('a',64),'22222222-2222-4222-8222-222222222222',null,'buyer@example.test','Test Buyer','3000000000','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"unknown-S","quantity":5}]'::jsonb,null,'sandbox');
        EXCEPTION WHEN SQLSTATE 'P0001' THEN IF SQLERRM='checkout_idempotency_conflict' THEN payload_conflict:=true; ELSE RAISE; END IF; END;
        IF NOT payload_conflict THEN RAISE EXCEPTION 'idempotency key accepted a changed checkout payload'; END IF;
        payload_conflict := false;
        BEGIN
          PERFORM public.start_wompi_checkout('11111111-1111-4111-8111-111111111111',repeat('a',64),'22222222-2222-4222-8222-222222222222',null,'changed@example.test','Test Buyer','3000000000','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-S","quantity":1,"price":1,"personalization":{"enabled":true,"name":"LEO","number":"10"}}]'::jsonb,'TEST10','sandbox');
        EXCEPTION WHEN SQLSTATE 'P0001' THEN IF SQLERRM='checkout_idempotency_conflict' THEN payload_conflict:=true; ELSE RAISE; END IF; END;
        IF NOT payload_conflict THEN RAISE EXCEPTION 'idempotency key accepted changed customer data'; END IF;
        retried := public.start_wompi_checkout('11111111-1111-4111-8111-111111111111',repeat('a',64),'22222222-2222-4222-8222-222222222222',null,'buyer@example.test','Test Buyer','3000000000','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-S","quantity":1,"price":1,"personalization":{"enabled":true,"name":"LEO","number":"10"}}]'::jsonb,'TEST10','sandbox');
        IF retried->>'order_id' <> order_id::text OR retried->>'reference' <> ref THEN RAISE EXCEPTION 'idempotent retry duplicated order/payment'; END IF;
        SELECT i.stock INTO stock_value FROM public.inventory i JOIN public.product_variants v ON v.id=i.variant_id WHERE v.sku='seleccion-colombia-S';
        SELECT usage_count INTO coupon_uses FROM public.coupons WHERE code='TEST10';
        IF stock_value <> 11 OR coupon_uses <> 1 THEN RAISE EXCEPTION 'reservation was not idempotent'; END IF;
        applied := public.apply_wompi_transaction(repeat('b',64),'webhook',ref,'txn-test-1','APPROVED',10360000,'COP','sandbox',1000);
        IF applied->>'result' <> 'processed' THEN RAISE EXCEPTION 'approval failed: %', applied; END IF;
        applied := public.apply_wompi_transaction(repeat('c',64),'webhook',ref,'txn-test-1','APPROVED',10360000,'COP','sandbox',1001);
        IF applied->>'result' <> 'stale' THEN RAISE EXCEPTION 'new-timestamp duplicate approval was not a no-op: %', applied; END IF;
        SELECT i.stock INTO stock_value FROM public.inventory i JOIN public.product_variants v ON v.id=i.variant_id WHERE v.sku='seleccion-colombia-S';
        IF stock_value <> 11 THEN RAISE EXCEPTION 'duplicate approval deducted inventory twice'; END IF;
        applied := public.apply_wompi_transaction(repeat('d',64),'webhook',ref,'txn-test-1','VOIDED',10360000,'COP','sandbox',1002);
        IF applied->>'result' <> 'processed' THEN RAISE EXCEPTION 'void failed: %', applied; END IF;
        applied := public.apply_wompi_transaction(repeat('e',64),'webhook',ref,'txn-test-1','VOIDED',10360000,'COP','sandbox',1003);
        IF applied->>'result' <> 'stale' THEN RAISE EXCEPTION 'duplicate void was not a no-op'; END IF;
        SELECT i.stock INTO stock_value FROM public.inventory i JOIN public.product_variants v ON v.id=i.variant_id WHERE v.sku='seleccion-colombia-S';
        SELECT usage_count INTO coupon_uses FROM public.coupons WHERE code='TEST10';
        IF stock_value <> 12 OR coupon_uses <> 0 OR (SELECT status FROM public.orders WHERE id=order_id) <> 'cancelled' THEN RAISE EXCEPTION 'void did not release committed stock/coupon once'; END IF;
        BEGIN
          PERFORM public.start_wompi_checkout('33333333-3333-4333-8333-333333333333',repeat('f',64),'44444444-4444-4444-8444-444444444444',null,'buyer@example.test','Test Buyer','3000000000','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-S","quantity":13}]'::jsonb,null,'sandbox');
        EXCEPTION WHEN SQLSTATE '22023' THEN IF SQLERRM='checkout_quantity_invalid' THEN rejected:=true; ELSE RAISE; END IF; END;
        IF NOT rejected THEN RAISE EXCEPTION 'invalid quantity was accepted'; END IF;
        UPDATE public.products SET price=2147483647, compare_at_price=NULL WHERE slug='seleccion-colombia';
        BEGIN
          PERFORM public.start_wompi_checkout('31313131-3131-4313-8313-313131313131',repeat('f',64),'41414141-4141-4414-8414-414141414141',null,'overflow@example.test','Overflow Test','3000000003','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-S","quantity":2}]'::jsonb,null,'sandbox');
        EXCEPTION WHEN SQLSTATE '22023' THEN IF SQLERRM='checkout_line_total_invalid' THEN line_overflow_rejected:=true; ELSE RAISE; END IF; END;
        UPDATE public.products SET price=89000, compare_at_price=109000 WHERE slug='seleccion-colombia';
        IF NOT line_overflow_rejected THEN RAISE EXCEPTION 'line amount overflow was accepted'; END IF;
        RAISE NOTICE 'checkout totals, price tampering, idempotency, terminal duplicates, void, coupon, and quantity validation passed';
      END $$;
    `);
    assert.match(cycleOutput, /checkout totals, price tampering, idempotency, terminal duplicates, void, coupon, and quantity validation passed/);

    const lateApprovalOutput = await runPsql(`
      INSERT INTO public.coupons(code, discount_type, discount_value, usage_limit, active) VALUES ('LATE10','percent',10,1,true);
      DO $$
      DECLARE first_order jsonb; second_order jsonb; applied jsonb; order_id uuid; first_reference text; coupon_uses integer; held boolean;
      BEGIN
        first_order := public.start_wompi_checkout('77777777-7777-4777-8777-777777777771',repeat('7',64),'88888888-8888-4888-8888-888888888881',null,'late1@example.test','Late One','3000000001','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-S","quantity":1}]'::jsonb,'LATE10','sandbox');
        order_id := (first_order->>'order_id')::uuid;
        first_reference := first_order->>'reference';
        UPDATE public.orders SET reservation_expires_at=now()-interval '1 minute' WHERE id=order_id;
        IF public.expire_wompi_checkout_reservations(10) <> 1 THEN RAISE EXCEPTION 'reservation did not expire'; END IF;
        second_order := public.start_wompi_checkout('77777777-7777-4777-8777-777777777772',repeat('8',64),'88888888-8888-4888-8888-888888888882',null,'late2@example.test','Late Two','3000000002','{"address_line_1":"Calle 2 # 3-4","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-M","quantity":1}]'::jsonb,'LATE10','sandbox');
        applied := public.apply_wompi_transaction(repeat('9',64),'webhook',first_reference,'txn-late-approval','APPROVED',(first_order->>'total')::bigint*100,'COP','sandbox',2000);
        SELECT usage_count INTO coupon_uses FROM public.coupons WHERE code='LATE10';
        SELECT fulfillment_hold INTO held FROM public.orders WHERE id=order_id;
        IF applied->>'result' <> 'processed' OR (SELECT status FROM public.orders WHERE id=order_id) <> 'paid' OR not held OR coupon_uses <> 1 THEN
          RAISE EXCEPTION 'late approval must remain paid and held without consuming unavailable coupon: %, uses %',applied,coupon_uses;
        END IF;
        RAISE NOTICE 'late approval after reservation expiry enters fulfillment hold when coupon has been consumed';
      END $$;
    `);
    assert.match(lateApprovalOutput, /late approval after reservation expiry enters fulfillment hold/);

    const multiAttemptOutput = await runPsql(`
      DO $$
      DECLARE first_order jsonb; second_order jsonb; applied jsonb; multi_order_id uuid; first_reference text; second_reference text; stock_value integer; held boolean;
      BEGIN
        first_order := public.start_wompi_checkout('12121212-1212-4121-8121-121212121211',repeat('4',64),'23232323-2323-4232-8232-232323232321',null,'attempt1@example.test','Attempt One','3000000001','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"clasico-europeo-XL","quantity":1}]'::jsonb,null,'sandbox');
        multi_order_id := (first_order->>'order_id')::uuid; first_reference := first_order->>'reference';
        applied := public.apply_wompi_transaction(repeat('1',64),'webhook',first_reference,'txn-attempt-one','DECLINED',(first_order->>'total')::bigint*100,'COP','sandbox',4000);
        IF applied->>'result' <> 'processed' THEN RAISE EXCEPTION 'first rejection failed'; END IF;
        second_order := public.start_wompi_checkout('12121212-1212-4121-8121-121212121211',repeat('4',64),'34343434-3434-4343-8343-343434343432',null,'attempt1@example.test','Attempt One','3000000001','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"clasico-europeo-XL","quantity":1}]'::jsonb,null,'sandbox');
        second_reference := second_order->>'reference';
        applied := public.apply_wompi_transaction(repeat('2',64),'webhook',first_reference,'txn-attempt-one','APPROVED',(first_order->>'total')::bigint*100,'COP','sandbox',4001);
        IF applied->>'result' <> 'processed' THEN RAISE EXCEPTION 'late first approval failed'; END IF;
        applied := public.apply_wompi_transaction(repeat('3',64),'webhook',second_reference,'txn-attempt-two','APPROVED',(second_order->>'total')::bigint*100,'COP','sandbox',4002);
        IF applied->>'result' <> 'processed' THEN RAISE EXCEPTION 'second approval failed'; END IF;
        SELECT i.stock INTO stock_value FROM public.inventory i JOIN public.product_variants v ON v.id=i.variant_id WHERE v.sku='clasico-europeo-XL';
        SELECT fulfillment_hold INTO held FROM public.orders WHERE id=multi_order_id;
        IF stock_value <> 2 OR not held OR (SELECT count(*) FROM public.payments WHERE public.payments.order_id=multi_order_id AND status='approved') <> 2 THEN
          RAISE EXCEPTION 'multiple approvals check failed: stock %, hold %, approvals %', stock_value, held,
            (SELECT count(*) FROM public.payments WHERE public.payments.order_id=multi_order_id AND status='approved');
        END IF;
        RAISE NOTICE 'late approval across retries reserves stock once and places order on hold';
      END $$;
    `);
    assert.match(multiAttemptOutput, /late approval across retries reserves stock once and places order on hold/);

    const mismatchOutput = await runPsql(`
      DO $$
      DECLARE checkout jsonb; result jsonb; order_id uuid;
      BEGIN
        checkout := public.start_wompi_checkout('56565656-5656-4565-8565-565656565651',repeat('5',64),'67676767-6767-4676-8676-676767676761',null,'mismatch@example.test','Mismatch Test','3000000001','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"nacional-2024-M","quantity":1}]'::jsonb,null,'sandbox');
        order_id := (checkout->>'order_id')::uuid;
        result := public.apply_wompi_transaction(repeat('6',64),'webhook',checkout->>'reference','txn-mismatch','APPROVED',(checkout->>'total')::bigint*100+100,'COP','sandbox',5000);
        IF result->>'result' <> 'amount_or_currency_mismatch'
          OR (SELECT status FROM public.orders WHERE id=order_id)='paid'
          OR NOT (SELECT fulfillment_hold FROM public.orders WHERE id=order_id) THEN
          RAISE EXCEPTION 'financial mismatch must remain unpaid and enter hold';
        END IF;
        RAISE NOTICE 'signed amount mismatch remains unpaid and triggers admin hold';
      END $$;
    `);
    assert.match(mismatchOutput, /signed amount mismatch remains unpaid and triggers admin hold/);

    await runPsql(`
      INSERT INTO auth.users(id,raw_user_meta_data) VALUES
        ('99999999-9999-4999-8999-999999999991','{"full_name":"Admin Test"}'::jsonb),
        ('99999999-9999-4999-8999-999999999992','{"full_name":"Customer Test"}'::jsonb);
      UPDATE public.profiles SET role='ADMIN' WHERE id='99999999-9999-4999-8999-999999999991';
      DO $$
      DECLARE checkout jsonb; admin_order_id uuid; applied jsonb;
      BEGIN
        checkout := public.start_wompi_checkout('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',repeat('3',64),'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1','99999999-9999-4999-8999-999999999991','admin-order@example.test','Admin Order','3000000001','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-M","quantity":1}]'::jsonb,null,'sandbox');
        admin_order_id := (checkout->>'order_id')::uuid;
        applied := public.apply_wompi_transaction(repeat('a',64),'webhook',checkout->>'reference','txn-admin-test','APPROVED',(checkout->>'total')::bigint*100,'COP','sandbox',3000);
        IF applied->>'result' <> 'processed' THEN RAISE EXCEPTION 'admin order payment did not approve'; END IF;

        PERFORM set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999992',true);
        BEGIN
          PERFORM public.set_order_fulfillment_status(admin_order_id,'processing');
          RAISE EXCEPTION 'customer unexpectedly advanced order';
        EXCEPTION WHEN insufficient_privilege THEN NULL;
        END;

        PERFORM set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999991',true);
        PERFORM public.set_order_fulfillment_status(admin_order_id,'processing');
        PERFORM public.set_order_fulfillment_status(admin_order_id,'shipped');
        PERFORM public.set_order_fulfillment_status(admin_order_id,'delivered');
        IF (SELECT status FROM public.orders WHERE id=admin_order_id) <> 'paid'
          OR (SELECT fulfillment_status FROM public.orders WHERE id=admin_order_id) <> 'delivered'
          OR (SELECT status FROM public.payments WHERE order_id=admin_order_id) <> 'approved' THEN
          RAISE EXCEPTION 'fulfillment transition changed financial status';
        END IF;
        BEGIN
          PERFORM public.set_order_fulfillment_status(admin_order_id,'paid');
          RAISE EXCEPTION 'admin unexpectedly wrote financial paid status';
        EXCEPTION WHEN invalid_parameter_value THEN NULL;
        END;
        RAISE NOTICE 'customer denied; admin advances fulfillment only; payment remains approved';
      END $$;
    `);

    await runPsql("UPDATE public.inventory i SET stock=4 FROM public.product_variants v WHERE v.id=i.variant_id AND v.sku='seleccion-colombia-S';");
    const makeConcurrentCheckout = (idempotencyKey, attemptKey, email, accessHash) => `
      DO $$ DECLARE result jsonb; BEGIN
        result := public.start_wompi_checkout('${idempotencyKey}','${accessHash}','${attemptKey}',null,'${email}','Concurrent Test','3000000000','{"address_line_1":"Calle 1 # 2-3","city":"Bogota","department":"Cundinamarca","country":"CO"}'::jsonb,'[{"sku":"seleccion-colombia-S","quantity":3}]'::jsonb,null,'sandbox');
        RAISE NOTICE 'RESERVED:%',result->>'order_id';
      EXCEPTION WHEN SQLSTATE 'P0001' THEN IF SQLERRM='checkout_stock_unavailable' THEN RAISE NOTICE 'REJECTED_STOCK'; ELSE RAISE; END IF; END $$;
    `;
    const [concurrentA, concurrentB] = await Promise.all([
      runPsql(makeConcurrentCheckout("55555555-5555-4555-8555-555555555551", "66666666-6666-4666-8666-666666666661", "c1@example.test", "1".repeat(64))),
      runPsql(makeConcurrentCheckout("55555555-5555-4555-8555-555555555552", "66666666-6666-4666-8666-666666666662", "c2@example.test", "2".repeat(64))),
    ]);
    const combined = `${concurrentA}\n${concurrentB}`;
    assert.equal((combined.match(/RESERVED:/g) ?? []).length, 1);
    assert.equal((combined.match(/REJECTED_STOCK/g) ?? []).length, 1);
    const remaining = await runPsql("SELECT i.stock::text || ':' || count(r.order_id)::text FROM public.inventory i JOIN public.product_variants v ON v.id=i.variant_id LEFT JOIN public.inventory_reservations r ON r.variant_id=v.id AND r.state='reserved' WHERE v.sku='seleccion-colombia-S' GROUP BY i.stock;");
    assert.match(remaining, /1:1/);

    const permissions = await runPsql(`
      SELECT has_function_privilege('anon','public.start_wompi_checkout(text,text,text,text,uuid,text,text,text,jsonb,jsonb,text,text)','EXECUTE') AS anon_checkout,
        has_function_privilege('authenticated','public.start_wompi_checkout(text,text,text,text,uuid,text,text,text,jsonb,jsonb,text,text)','EXECUTE') AS user_checkout,
        has_function_privilege('service_role','public.start_wompi_checkout(text,text,text,text,uuid,text,text,text,jsonb,jsonb,text,text)','EXECUTE') AS service_checkout;
    `);
    assert.match(permissions, /f\s+\|\s+f\s+\|\s+t/);
    process.stdout.write("PostgreSQL integration passed: migrations, server totals, payload/owner idempotency, late approval, multiple attempts, terminal no-op, reservation release, admin fulfillment permissions, concurrent stock and RPC grants.\n");
  } finally {
    dockerSync(["rm", "--force", "--volumes", containerName]);
  }
}

await main();
