import bcrypt from "bcrypt";

async function test() {
  const pass = "password123";
  const hash = await bcrypt.hash(pass, 10);
  const ok = await bcrypt.compare(pass, hash);
  console.log(`Password: ${pass}`);
  console.log(`Hash: ${hash}`);
  console.log(`Comparison result: ${ok}`);
}

test();
