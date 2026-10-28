import { randomBytes, scrypt } from "node:crypto";

const keyLength = 64;
const cost = 32_768;
const blockSize = 8;
const parallelization = 1;
const maxMemory = 64 * 1024 * 1024;

export class ScryptPasswordHasher {
    async hash(plain: string): Promise<string> {
        const salt = randomBytes(16);
        const derivedKey = await new Promise<Buffer>((resolve, reject) => {
            scrypt(plain, salt, keyLength, {
                N: cost,
                r: blockSize,
                p: parallelization,
                maxmem: maxMemory,
            }, (error, key) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(key);
            });
        });

        return [
            "scrypt",
            cost,
            blockSize,
            parallelization,
            salt.toString("base64url"),
            derivedKey.toString("base64url"),
        ].join("$");
    }
}
