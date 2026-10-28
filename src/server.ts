import "dotenv/config";
import { createApp } from "./app";
import { PrismaUserRepository } from "./modules/users/repositories/prisma-user.repository";
import { ScryptPasswordHasher } from "./modules/users/security/scrypt-password-hasher";
import { buildUserModule } from "./modules/users/user.module";

const port = Number(process.env["PORT"] ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
}

const usersModule = buildUserModule(new PrismaUserRepository(), new ScryptPasswordHasher());
const app = createApp(usersModule.router);

app.listen(port, () => {
    console.log(`Courses API listening on port ${port}`);
});