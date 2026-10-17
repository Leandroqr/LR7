begin;

alter table public.orders
  add column if not exists checkout_idempotency_key text,
  add column if not exists checkout_payload_hash text,
  add column if not exists public_access_token_hash text,
  add column if not exists reservation_expires_at timestamptz,
  add column if not exists fulfillment_status text not null default 'unfulfilled',
  add column if not exists fulfillment_hold boolean not null default false,
  add column if not exists fulfillment_hold_reason text,
  add column if not exists coupon_usage_reserved boolean not null default false,
  add column if not exists coupon_redeemed_at timestamptz;

alter table public.orders
  add constraint orders_fulfillment_status_check
  check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'));

update public.orders
set fulfillment_status = status
where status in ('processing', 'shipped', 'delivered', 'cancelled');

alter table public.payments
  add column if not exists reference text,
  add column if not exists environment text,
  add column if not exists attempt_idempotency_key text,
  add column if not exists last_event_timestamp bigint;

alter table public.payments
  add constraint payments_environment_check
  check (environment is null or environment in ('sandbox', 'production'));

create unique index if not exists orders_checkout_idempotency_key_idx
  on public.orders(checkout_idempotency_key) where checkout_idempotency_key is not null;
create index if not exists orders_checkout_payload_hash_idx
  on public.orders(checkout_payload_hash) where checkout_payload_hash is not null;
create unique index if not exists orders_public_access_token_hash_idx
  on public.orders(public_access_token_hash) where public_access_token_hash is not null;
create unique index if not exists payments_wompi_reference_idx
  on public.payments(reference) where provider = 'wompi' and reference is not null;
create unique index if not exists payments_wompi_attempt_key_idx
  on public.payments(attempt_idempotency_key) where provider = 'wompi' and attempt_idempotency_key is not null;

create table if not exists public.inventory_reservations (
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  state text not null check (state in ('reserved', 'committed', 'released')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (order_id, variant_id)
);

create index if not exists inventory_reservations_expiry_idx
  on public.inventory_reservations(expires_at) where state = 'reserved';

create table if not exists public.wompi_event_receipts (
  event_key text primary key,
  source text not null check (source in ('webhook', 'reconciliation')),
  payment_reference text,
  transaction_id text,
  wompi_status text,
  event_timestamp bigint,
  result text not null default 'received',
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.inventory_reservations enable row level security;
alter table public.wompi_event_receipts enable row level security;
create policy "inventory_reservations_admin_read" on public.inventory_reservations
  for select to authenticated using (public.is_admin());
create policy "wompi_event_receipts_admin_read" on public.wompi_event_receipts
  for select to authenticated using (public.is_admin());

create or replace function public.reserve_order_inventory(target_order_id uuid, reservation_expiry timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  inventory_line record;
  updated_variant_id uuid;
begin
  if exists (
    select 1 from public.inventory_reservations
    where order_id = target_order_id and state in ('reserved', 'committed')
  ) then
    return;
  end if;

  for inventory_line in
    select variant_id, sum(quantity)::integer as quantity
    from public.order_items
    where order_id = target_order_id and variant_id is not null
    group by variant_id
    order by variant_id
  loop
    update public.inventory
    set stock = stock - inventory_line.quantity
    where variant_id = inventory_line.variant_id and stock >= inventory_line.quantity
    returning variant_id into updated_variant_id;

    if updated_variant_id is null then
      raise exception 'checkout_stock_unavailable' using errcode = 'P0001';
    end if;

    insert into public.inventory_reservations(order_id, variant_id, quantity, state, expires_at)
    values (target_order_id, inventory_line.variant_id, inventory_line.quantity, 'reserved', reservation_expiry)
    on conflict (order_id, variant_id) do update set
      quantity = excluded.quantity,
      state = 'reserved',
      expires_at = excluded.expires_at,
      updated_at = now();

    updated_variant_id := null;
  end loop;
end;
$$;

create or replace function public.release_order_inventory(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reservation record;
  coupon_id_to_release uuid;
begin
  select coupon_id into coupon_id_to_release
  from public.orders
  where id = target_order_id
    and ((coupon_usage_reserved and coupon_redeemed_at is null) or coupon_redeemed_at is not null)
  for update;

  for reservation in
    select variant_id, quantity
    from public.inventory_reservations
    where order_id = target_order_id and state in ('reserved', 'committed')
    order by variant_id
    for update
  loop
    update public.inventory
    set stock = stock + reservation.quantity
    where variant_id = reservation.variant_id;

    update public.inventory_reservations
    set state = 'released', updated_at = now()
    where order_id = target_order_id and variant_id = reservation.variant_id and state in ('reserved', 'committed');
  end loop;

  if coupon_id_to_release is not null then
    update public.coupons
    set usage_count = greatest(0, usage_count - 1)
    where id = coupon_id_to_release;
    update public.orders set coupon_usage_reserved = false, coupon_redeemed_at = null where id = target_order_id;
  end if;
end;
$$;

create or replace function public.start_wompi_checkout(
  p_idempotency_key text,
  p_payload_hash text,
  p_access_token_hash text,
  p_attempt_idempotency_key text,
  p_user_id uuid,
  p_customer_email text,
  p_customer_name text,
  p_customer_phone text,
  p_shipping_information jsonb,
  p_items jsonb,
  p_coupon_code text,
  p_environment text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_order public.orders%rowtype;
  current_payment public.payments%rowtype;
  commerce jsonb;
  coupon public.coupons%rowtype;
  cart_line jsonb;
  personalization jsonb;
  line_product_id uuid;
  line_variant_id uuid;
  line_product_name text;
  line_sku text;
  line_size text;
  line_color text;
  line_base_price integer;
  line_price integer;
  line_quantity integer;
  personalization_price integer := 0;
  subtotal_amount bigint := 0;
  shipping_amount integer := 0;
  discount_amount integer := 0;
  free_shipping_threshold integer;
  coupon_code text;
  line_name text;
  line_number text;
  line_total integer;
  order_id_value uuid;
  order_number_value text;
  reference_value text;
  expiry_value timestamptz;
  coupon_reserved boolean := false;
  active_payment_found boolean := false;
begin
  if p_environment not in ('sandbox', 'production') then
    raise exception 'checkout_environment_invalid' using errcode = '22023';
  end if;
  if p_idempotency_key !~ '^[a-fA-F0-9-]{36}$'
    or p_payload_hash !~ '^[a-f0-9]{64}$'
    or p_attempt_idempotency_key !~ '^[a-fA-F0-9-]{36}$'
    or p_access_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'checkout_idempotency_invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'checkout_cart_invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(p_shipping_information) <> 'object'
    or p_shipping_information->>'country' <> 'CO'
    or coalesce(length(btrim(p_customer_email)), 0) = 0
    or coalesce(length(btrim(p_customer_name)), 0) = 0
    or coalesce(length(btrim(p_customer_phone)), 0) = 0 then
    raise exception 'checkout_customer_data_invalid' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key, 0));
  perform public.expire_wompi_checkout_reservations(100);

  select * into existing_order
  from public.orders
  where checkout_idempotency_key = p_idempotency_key
  for update;

  if found then
    if existing_order.user_id is distinct from p_user_id
      or existing_order.checkout_payload_hash is distinct from p_payload_hash then
      raise exception 'checkout_idempotency_conflict' using errcode = 'P0001';
    end if;
    if existing_order.status in ('paid', 'refunded') then
      return jsonb_build_object('order_id', existing_order.id, 'order_number', existing_order.order_number,
        'status', existing_order.status, 'subtotal', existing_order.subtotal, 'shipping', existing_order.shipping,
        'discount', existing_order.discount, 'total', existing_order.total, 'currency', existing_order.currency);
    end if;
    if existing_order.status = 'cancelled' or existing_order.reservation_expires_at <= now() then
      return jsonb_build_object('order_id', existing_order.id, 'order_number', existing_order.order_number, 'status', 'expired');
    end if;

    select * into current_payment
    from public.payments
    where order_id = existing_order.id and provider = 'wompi'
      and attempt_idempotency_key = p_attempt_idempotency_key
    limit 1;
    if found then
      return jsonb_build_object('order_id', existing_order.id, 'order_number', existing_order.order_number,
        'status', existing_order.status, 'subtotal', existing_order.subtotal, 'shipping', existing_order.shipping,
        'discount', existing_order.discount, 'total', existing_order.total, 'currency', existing_order.currency,
        'reference', current_payment.reference, 'reservation_expires_at', existing_order.reservation_expires_at);
    end if;

    select * into current_payment
    from public.payments
    where order_id = existing_order.id and provider = 'wompi' and status = 'pending'
    order by created_at desc limit 1;
    if found then
      raise exception 'checkout_attempt_pending' using errcode = 'P0001';
    end if;

    select value into commerce from public.site_settings
    where setting_key = 'commerce' and active for share;
    if commerce is null or jsonb_typeof(commerce->'shipping_cop') <> 'number' then
      raise exception 'checkout_shipping_not_configured' using errcode = 'P0001';
    end if;
    if not exists (select 1 from public.inventory_reservations where order_id = existing_order.id and state = 'reserved') then
      expiry_value := now() + interval '30 minutes';
      perform public.reserve_order_inventory(existing_order.id, expiry_value);
    else
      expiry_value := now() + interval '30 minutes';
      update public.inventory_reservations set expires_at = expiry_value, updated_at = now()
      where order_id = existing_order.id and state = 'reserved';
    end if;
    if existing_order.coupon_id is not null and not existing_order.coupon_usage_reserved and existing_order.coupon_redeemed_at is null then
      select * into coupon from public.coupons where id = existing_order.coupon_id for update;
      if not found or not coupon.active or (coupon.usage_limit is not null and coupon.usage_count >= coupon.usage_limit) then
        raise exception 'checkout_coupon_unavailable' using errcode = 'P0001';
      end if;
      update public.coupons set usage_count = usage_count + 1 where id = coupon.id;
      update public.orders set coupon_usage_reserved = true where id = existing_order.id;
    end if;

    update public.orders set status = 'payment_pending', reservation_expires_at = expiry_value where id = existing_order.id;
    reference_value := existing_order.order_number || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 24));
    insert into public.payments(order_id, provider, status, amount, currency, metadata, reference, environment, attempt_idempotency_key)
    values (existing_order.id, 'wompi', 'pending', existing_order.total, existing_order.currency,
      jsonb_build_object('reference', reference_value, 'environment', p_environment, 'wompi_status', 'PENDING'),
      reference_value, p_environment, p_attempt_idempotency_key)
    returning id into current_payment.id;

    update public.inventory_reservations set expires_at = expiry_value, updated_at = now()
    where order_id = existing_order.id and state = 'reserved';

    return jsonb_build_object('order_id', existing_order.id, 'order_number', existing_order.order_number,
      'status', 'payment_pending', 'subtotal', existing_order.subtotal, 'shipping', existing_order.shipping,
      'discount', existing_order.discount, 'total', existing_order.total, 'currency', existing_order.currency,
      'reference', reference_value, 'reservation_expires_at', expiry_value);
  end if;

  select value into commerce from public.site_settings
  where setting_key = 'commerce' and active for share;
  if commerce is null or jsonb_typeof(commerce->'shipping_cop') <> 'number' then
    raise exception 'checkout_shipping_not_configured' using errcode = 'P0001';
  end if;
  shipping_amount := (commerce->>'shipping_cop')::integer;
  if shipping_amount < 0 then raise exception 'checkout_shipping_invalid' using errcode = '22023'; end if;
  if jsonb_typeof(commerce->'personalization_price') = 'number' then
    personalization_price := (commerce->>'personalization_price')::integer;
  end if;
  if personalization_price < 0 then raise exception 'checkout_personalization_price_invalid' using errcode = '22023'; end if;
  if jsonb_typeof(commerce->'free_shipping_threshold_cop') = 'number' then
    free_shipping_threshold := (commerce->>'free_shipping_threshold_cop')::integer;
    if free_shipping_threshold < 0 then raise exception 'checkout_shipping_threshold_invalid' using errcode = '22023'; end if;
  end if;

  insert into public.orders(
    user_id, status, subtotal, shipping, discount, total, currency,
    customer_email, customer_name, customer_phone, shipping_information,
    checkout_idempotency_key, checkout_payload_hash, public_access_token_hash, reservation_expires_at
  ) values (
    p_user_id, 'pending', 0, 0, 0, 0, 'COP', lower(btrim(p_customer_email)),
    btrim(p_customer_name), btrim(p_customer_phone), p_shipping_information,
    p_idempotency_key, p_payload_hash, p_access_token_hash, now() + interval '30 minutes'
  ) returning id, order_number into order_id_value, order_number_value;

  for cart_line in select value from jsonb_array_elements(p_items)
  loop
    line_sku := btrim(coalesce(cart_line->>'sku', ''));
    if line_sku = '' then raise exception 'checkout_variant_required' using errcode = '22023'; end if;
    begin
      line_quantity := (cart_line->>'quantity')::integer;
    exception when others then
      raise exception 'checkout_quantity_invalid' using errcode = '22023';
    end;
    if line_quantity < 1 or line_quantity > 5 then raise exception 'checkout_quantity_invalid' using errcode = '22023'; end if;

    select p.id, v.id, p.name, v.sku::text, v.size, v.color,
      coalesce(v.price_override, p.price), p.personalizable
    into line_product_id, line_variant_id, line_product_name, line_sku, line_size, line_color, line_base_price, active_payment_found
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where v.sku = line_sku and v.active and p.active
    for update of v, p;
    if not found then raise exception 'checkout_variant_unavailable' using errcode = 'P0001'; end if;

    personalization := coalesce(cart_line->'personalization', '{}'::jsonb);
    if jsonb_typeof(personalization) <> 'object' then raise exception 'checkout_personalization_invalid' using errcode = '22023'; end if;
    if coalesce((personalization->>'enabled')::boolean, false) then
      if not active_payment_found then raise exception 'checkout_personalization_not_allowed' using errcode = '22023'; end if;
      line_name := upper(btrim(coalesce(personalization->>'name', '')));
      line_number := btrim(coalesce(personalization->>'number', ''));
      if line_name = '' and line_number = '' then raise exception 'checkout_personalization_empty' using errcode = '22023'; end if;
      if char_length(line_name) > 12 or line_name !~ '^[[:alnum:] .-]*$' then raise exception 'checkout_personalization_name_invalid' using errcode = '22023'; end if;
      if line_number <> '' and line_number !~ '^[0-9]{1,2}$' then raise exception 'checkout_personalization_number_invalid' using errcode = '22023'; end if;
      personalization := jsonb_build_object('name', line_name, 'number', line_number, 'placement', 'back');
      line_price := line_base_price + personalization_price;
    else
      if coalesce(personalization->>'name', '') <> '' or coalesce(personalization->>'number', '') <> '' then
        raise exception 'checkout_personalization_not_enabled' using errcode = '22023';
      end if;
      personalization := '{}'::jsonb;
      line_price := line_base_price;
    end if;

    if line_price < 0 or line_price > 2147483647 / line_quantity then
      raise exception 'checkout_line_total_invalid' using errcode = '22023';
    end if;

    update public.inventory
    set stock = stock - line_quantity
    where variant_id = line_variant_id and stock >= line_quantity;
    if not found then raise exception 'checkout_stock_unavailable' using errcode = 'P0001'; end if;

    line_total := line_price * line_quantity;
    if subtotal_amount + line_total > 2147483647 then
      raise exception 'checkout_total_invalid' using errcode = '22023';
    end if;
    subtotal_amount := subtotal_amount + line_total;
    insert into public.order_items(order_id, product_id, variant_id, product_name, sku, size, color, quantity, unit_price, personalization, line_total)
    values (order_id_value, line_product_id, line_variant_id, line_product_name, line_sku, line_size, line_color,
      line_quantity, line_price, personalization, line_total);
    insert into public.inventory_reservations(order_id, variant_id, quantity, state, expires_at)
    values (order_id_value, line_variant_id, line_quantity, 'reserved', now() + interval '30 minutes')
    on conflict (order_id, variant_id) do update set
      quantity = public.inventory_reservations.quantity + excluded.quantity,
      updated_at = now();
  end loop;

  if free_shipping_threshold is not null and subtotal_amount >= free_shipping_threshold then
    shipping_amount := 0;
  end if;

  coupon_code := nullif(upper(btrim(coalesce(p_coupon_code, ''))), '');
  if coupon_code is not null then
    select * into coupon from public.coupons where code = coupon_code for update;
    if not found or not coupon.active
      or (coupon.starts_at is not null and coupon.starts_at > now())
      or (coupon.ends_at is not null and coupon.ends_at <= now())
      or subtotal_amount < coupon.minimum_order
      or (coupon.usage_limit is not null and coupon.usage_count >= coupon.usage_limit) then
      raise exception 'checkout_coupon_invalid' using errcode = 'P0001';
    end if;
    if coupon.discount_type = 'percent' then
      discount_amount := floor(subtotal_amount * coupon.discount_value / 100.0)::integer;
    else
      discount_amount := coupon.discount_value;
    end if;
    if coupon.maximum_discount is not null then discount_amount := least(discount_amount, coupon.maximum_discount); end if;
    discount_amount := least(discount_amount, subtotal_amount + shipping_amount);
    update public.coupons set usage_count = usage_count + 1 where id = coupon.id;
    coupon_reserved := true;
  end if;

  if subtotal_amount + shipping_amount - discount_amount < 1
    or subtotal_amount + shipping_amount - discount_amount > 2147483647 then
    raise exception 'checkout_total_invalid' using errcode = '22023';
  end if;

  expiry_value := now() + interval '30 minutes';
  update public.orders set
    subtotal = subtotal_amount,
    shipping = shipping_amount,
    discount = discount_amount,
    total = subtotal_amount + shipping_amount - discount_amount,
    coupon_id = coupon.id,
    coupon_usage_reserved = coupon_reserved,
    reservation_expires_at = expiry_value
  where id = order_id_value;
  update public.inventory_reservations set expires_at = expiry_value, updated_at = now() where order_id = order_id_value and state = 'reserved';

  reference_value := order_number_value || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 24));
  insert into public.payments(order_id, provider, status, amount, currency, metadata, reference, environment, attempt_idempotency_key)
  values (order_id_value, 'wompi', 'pending', subtotal_amount + shipping_amount - discount_amount, 'COP',
    jsonb_build_object('reference', reference_value, 'environment', p_environment, 'wompi_status', 'PENDING'),
    reference_value, p_environment, p_attempt_idempotency_key);
  update public.orders set status = 'payment_pending' where id = order_id_value;

  return jsonb_build_object('order_id', order_id_value, 'order_number', order_number_value,
    'status', 'payment_pending', 'subtotal', subtotal_amount, 'shipping', shipping_amount,
    'discount', discount_amount, 'total', subtotal_amount + shipping_amount - discount_amount,
    'currency', 'COP', 'reference', reference_value, 'reservation_expires_at', expiry_value);
end;
$$;

create or replace function public.apply_wompi_transaction(
  p_event_key text,
  p_source text,
  p_reference text,
  p_transaction_id text,
  p_wompi_status text,
  p_amount_in_cents bigint,
  p_currency text,
  p_environment text,
  p_event_timestamp bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  payment_order_id uuid;
  order_row public.orders%rowtype;
  payment_row public.payments%rowtype;
  mapped_payment_status public.payment_status;
  incoming_priority integer;
  current_priority integer;
  reservation_count integer;
  stock_reserved boolean := true;
  coupon_usage_available boolean := true;
  coupon_row public.coupons%rowtype;
  approved_payment_count integer := 0;
  has_other_pending boolean := false;
  has_other_approved boolean := false;
  event_inserted text;
begin
  if p_source not in ('webhook', 'reconciliation') or p_wompi_status not in ('PENDING', 'APPROVED', 'DECLINED', 'ERROR', 'VOIDED') then
    raise exception 'wompi_event_invalid' using errcode = '22023';
  end if;
  if p_event_key !~ '^[a-f0-9]{64}$' or p_reference is null or p_transaction_id is null then
    raise exception 'wompi_event_invalid' using errcode = '22023';
  end if;

  insert into public.wompi_event_receipts(event_key, source, payment_reference, transaction_id, wompi_status, event_timestamp)
  values (p_event_key, p_source, p_reference, p_transaction_id, p_wompi_status, p_event_timestamp)
  on conflict (event_key) do nothing returning event_key into event_inserted;
  if event_inserted is null then return jsonb_build_object('result', 'duplicate'); end if;

  select order_id into payment_order_id from public.payments
  where provider = 'wompi' and reference = p_reference and environment = p_environment;
  if not found then
    update public.wompi_event_receipts set result = 'unknown_reference', processed_at = now() where event_key = p_event_key;
    return jsonb_build_object('result', 'unknown_reference');
  end if;

  select * into order_row from public.orders where id = payment_order_id for update;
  select * into payment_row from public.payments
  where provider = 'wompi' and reference = p_reference and environment = p_environment for update;

  if payment_row.order_id <> order_row.id or payment_row.currency <> p_currency
    or order_row.currency <> p_currency or payment_row.amount * 100 <> p_amount_in_cents then
    update public.wompi_event_receipts set result = 'amount_or_currency_mismatch', processed_at = now() where event_key = p_event_key;
    update public.orders set fulfillment_hold = true,
      fulfillment_hold_reason = 'El monto o moneda informados por Wompi no coinciden con el snapshot del pedido.'
    where id = order_row.id;
    return jsonb_build_object('result', 'amount_or_currency_mismatch');
  end if;
  if payment_row.transaction_id is not null and payment_row.transaction_id <> p_transaction_id then
    update public.wompi_event_receipts set result = 'transaction_conflict', processed_at = now() where event_key = p_event_key;
    update public.orders set fulfillment_hold = true,
      fulfillment_hold_reason = 'Wompi informó un identificador de transacción distinto para la referencia.'
    where id = order_row.id;
    return jsonb_build_object('result', 'transaction_conflict');
  end if;

  incoming_priority := case p_wompi_status when 'PENDING' then 0 when 'DECLINED' then 1 when 'ERROR' then 1 when 'APPROVED' then 2 when 'VOIDED' then 3 else -1 end;
  current_priority := case payment_row.metadata->>'wompi_status'
    when 'PENDING' then 0 when 'DECLINED' then 1 when 'ERROR' then 1 when 'APPROVED' then 2 when 'VOIDED' then 3 else -1 end;
  if incoming_priority <= current_priority then
    update public.wompi_event_receipts set result = 'stale', processed_at = now() where event_key = p_event_key;
    return jsonb_build_object('result', 'stale');
  end if;

  mapped_payment_status := case p_wompi_status
    when 'APPROVED' then 'approved'::public.payment_status
    when 'DECLINED' then 'rejected'::public.payment_status
    when 'ERROR' then 'rejected'::public.payment_status
    when 'VOIDED' then 'cancelled'::public.payment_status
    else 'pending'::public.payment_status
  end;

  if p_wompi_status = 'APPROVED' and order_row.coupon_id is not null
    and not order_row.coupon_usage_reserved and order_row.coupon_redeemed_at is null then
    select * into coupon_row from public.coupons where id = order_row.coupon_id for update;
    if not found or not coupon_row.active
      or (coupon_row.usage_limit is not null and coupon_row.usage_count >= coupon_row.usage_limit) then
      coupon_usage_available := false;
    else
      update public.coupons set usage_count = usage_count + 1 where id = coupon_row.id;
    end if;
  end if;

  if p_wompi_status = 'APPROVED' and not exists (
    select 1 from public.inventory_reservations where order_id = order_row.id and state in ('reserved', 'committed')
  ) then
    begin
      perform public.reserve_order_inventory(order_row.id, now() + interval '30 minutes');
    exception when sqlstate 'P0001' then
      stock_reserved := false;
    end;
  end if;

  update public.payments set
    transaction_id = p_transaction_id,
    status = mapped_payment_status,
    last_event_timestamp = p_event_timestamp,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'reference', p_reference,
      'environment', p_environment,
      'wompi_status', p_wompi_status,
      'event_timestamp', p_event_timestamp,
      'last_event_source', p_source
    )
  where id = payment_row.id;

  if p_wompi_status = 'APPROVED' then
    select count(*)::integer into approved_payment_count
    from public.payments where order_id = order_row.id and provider = 'wompi' and status = 'approved';
  else
    select exists (select 1 from public.payments where order_id = order_row.id and provider = 'wompi' and status = 'pending')
      into has_other_pending;
    select exists (select 1 from public.payments where order_id = order_row.id and provider = 'wompi' and status = 'approved')
      into has_other_approved;
  end if;

  if p_wompi_status = 'APPROVED' then
    update public.inventory_reservations set state = 'committed', updated_at = now()
    where order_id = order_row.id and state = 'reserved';
    update public.orders set status = 'paid', reservation_expires_at = null,
      fulfillment_hold = not stock_reserved or not coupon_usage_available or approved_payment_count > 1,
      fulfillment_hold_reason = case
        when approved_payment_count > 1 then 'Más de un intento Wompi fue aprobado; revisar posible doble cobro antes de preparar.'
        when not stock_reserved and not coupon_usage_available then 'Pago aprobado después de liberar la reserva; revisa stock y cupón antes de preparar.'
        when not stock_reserved then 'Pago aprobado después de liberar la reserva y no hay stock suficiente.'
        when not coupon_usage_available then 'Pago aprobado después de liberar la reserva y el cupón ya no está disponible.'
        else null
      end,
      coupon_usage_reserved = false,
      coupon_redeemed_at = case when coupon_id is not null and coupon_usage_available then now() else coupon_redeemed_at end
    where id = order_row.id and status in ('pending', 'payment_pending', 'cancelled');
    if approved_payment_count > 1 then
      update public.orders set fulfillment_hold = true,
        fulfillment_hold_reason = 'Más de un intento Wompi fue aprobado; revisar posible doble cobro antes de preparar.'
      where id = order_row.id;
    end if;
  elsif p_wompi_status in ('DECLINED', 'ERROR') then
    if has_other_approved then
      update public.orders set status = 'paid', fulfillment_hold = true,
        fulfillment_hold_reason = 'Una aprobación coexistió con un intento rechazado; revisar pagos antes de preparar.'
      where id = order_row.id;
    elsif has_other_pending then
      update public.orders set status = 'payment_pending' where id = order_row.id and status in ('pending', 'payment_pending');
    else
      perform public.release_order_inventory(order_row.id);
      update public.orders set status = 'pending', reservation_expires_at = null where id = order_row.id and status in ('pending', 'payment_pending');
    end if;
  elsif p_wompi_status = 'VOIDED' then
    if has_other_approved then
      update public.orders set status = 'paid', fulfillment_hold = true,
        fulfillment_hold_reason = 'Un intento fue anulado pero otro pago está aprobado; revisar antes de preparar.'
      where id = order_row.id;
    elsif order_row.fulfillment_status in ('processing', 'shipped', 'delivered') then
      update public.orders set fulfillment_hold = true, fulfillment_hold_reason = 'Wompi anuló una transacción después del despacho.' where id = order_row.id;
    else
      perform public.release_order_inventory(order_row.id);
      update public.orders set status = 'cancelled', fulfillment_status = 'cancelled', reservation_expires_at = null where id = order_row.id;
    end if;
  else
    update public.orders set status = 'payment_pending' where id = order_row.id and status = 'pending';
  end if;

  update public.wompi_event_receipts set result = 'processed', processed_at = now() where event_key = p_event_key;
  return jsonb_build_object('result', 'processed', 'payment_status', mapped_payment_status,
    'order_status', (select status from public.orders where id = order_row.id),
    'fulfillment_hold', (select fulfillment_hold from public.orders where id = order_row.id));
end;
$$;

create or replace function public.expire_wompi_checkout_reservations(batch_size integer default 100)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  expired_order record;
  processed_count integer := 0;
begin
  for expired_order in
    select id from public.orders
    where status in ('pending', 'payment_pending')
      and reservation_expires_at is not null and reservation_expires_at <= now()
    order by reservation_expires_at
    limit greatest(1, least(batch_size, 500))
    for update skip locked
  loop
    perform public.release_order_inventory(expired_order.id);
    update public.payments set status = 'cancelled', metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('expired_at', now())
    where order_id = expired_order.id and provider = 'wompi' and status = 'pending';
    update public.orders set status = 'cancelled', fulfillment_status = 'cancelled', reservation_expires_at = null
    where id = expired_order.id and status in ('pending', 'payment_pending');
    processed_count := processed_count + 1;
  end loop;
  return processed_count;
end;
$$;

create or replace function public.expire_wompi_checkout_order(target_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_row public.orders%rowtype;
begin
  select * into order_row from public.orders where id = target_order_id for update;
  if not found or order_row.status not in ('pending', 'payment_pending')
    or order_row.reservation_expires_at is null or order_row.reservation_expires_at > now() then
    return false;
  end if;

  perform public.release_order_inventory(order_row.id);
  update public.payments set status = 'cancelled', metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('expired_at', now())
  where order_id = order_row.id and provider = 'wompi' and status = 'pending';
  update public.orders set status = 'cancelled', fulfillment_status = 'cancelled', reservation_expires_at = null
  where id = order_row.id and status in ('pending', 'payment_pending');
  return true;
end;
$$;

create or replace function public.set_order_fulfillment_status(target_order_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_row public.orders%rowtype;
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  if new_status not in ('processing', 'shipped', 'delivered') then
    raise exception 'invalid fulfillment transition' using errcode = '22023';
  end if;
  select * into order_row from public.orders where id = target_order_id for update;
  if not found then raise exception 'order not found' using errcode = 'P0002'; end if;
  if order_row.status <> 'paid' or order_row.fulfillment_hold then
    raise exception 'order is not ready for fulfillment' using errcode = 'P0001';
  end if;
  if not (
    (order_row.fulfillment_status = 'unfulfilled' and new_status = 'processing')
    or (order_row.fulfillment_status = 'processing' and new_status = 'shipped')
    or (order_row.fulfillment_status = 'shipped' and new_status = 'delivered')
  ) then
    raise exception 'invalid fulfillment transition' using errcode = '22023';
  end if;
  update public.orders set fulfillment_status = new_status where id = target_order_id;
end;
$$;

revoke all on function public.reserve_order_inventory(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.release_order_inventory(uuid) from public, anon, authenticated;
revoke all on function public.start_wompi_checkout(text, text, text, text, uuid, text, text, text, jsonb, jsonb, text, text) from public, anon, authenticated;
revoke all on function public.apply_wompi_transaction(text, text, text, text, text, bigint, text, text, bigint) from public, anon, authenticated;
revoke all on function public.expire_wompi_checkout_reservations(integer) from public, anon, authenticated;
revoke all on function public.expire_wompi_checkout_order(uuid) from public, anon, authenticated;
revoke all on function public.set_order_fulfillment_status(uuid, text) from public, anon;
grant execute on function public.start_wompi_checkout(text, text, text, text, uuid, text, text, text, jsonb, jsonb, text, text) to service_role;
grant execute on function public.apply_wompi_transaction(text, text, text, text, text, bigint, text, text, bigint) to service_role;
grant execute on function public.expire_wompi_checkout_reservations(integer) to service_role;
grant execute on function public.expire_wompi_checkout_order(uuid) to service_role;
grant execute on function public.set_order_fulfillment_status(uuid, text) to authenticated;

commit;
