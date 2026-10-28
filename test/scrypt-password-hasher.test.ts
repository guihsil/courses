import assert from "node:assert/strict";
import test from "node:test";
import { ScryptPasswordHasher } from "../src/modules/users/security/scrypt-password-hasher";

test("scrypt stores a salted password hash instead of the plain password", async () => {
    const hasher = new ScryptPasswordHasher();
    const password = "A-strong-password-123";
    const [firstHash, secondHash] = await Promise.all([
        hasher.hash(password),
        hasher.hash(password),
    ]);

    assert.match(firstHash, /^scrypt\$32768\$8\$1\$/);
    assert.notEqual(firstHash, secondHash);
    assert.equal(firstHash.includes(password), false);
    assert.equal(firstHash.split("$").length, 6);
});
