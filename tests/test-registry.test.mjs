import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// El script "test" enumera los archivos a mano: un test que no esté en la lista no se ejecuta
// ni en local ni en CI. Este test falla si alguno queda fuera (o si la lista apunta a uno borrado).
const walk = (dir) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

test("every *.test.mjs file is registered in the npm test script", () => {
  const script = JSON.parse(readFileSync("package.json", "utf8")).scripts.test;
  const registered = new Set(script.match(/tests\/\S+\.test\.mjs/g));
  const onDisk = walk("tests").filter((path) => path.endsWith(".test.mjs"));
  assert.deepEqual(onDisk.filter((path) => !registered.has(path)), [], "tests sin registrar en package.json");
  assert.deepEqual([...registered].filter((path) => !onDisk.includes(path)), [], "package.json apunta a tests que no existen");
});
