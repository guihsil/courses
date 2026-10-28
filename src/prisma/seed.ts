import "dotenv/config";
import { PrismaUserRepository } from "@/modules/users/repositories/prisma-user.repository";
import { buildUserModule } from "@/modules/users";
import { ScryptPasswordHasher } from "@/modules/users/security/scrypt-password-hasher";
import { createUserSchema } from "@/modules/users/dtos/create-user.dto";
import { prisma } from "./prisma";

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Variável obrigatória não configurada: ${name}`);
    return value;
}

async function main(): Promise<void> {
    const { users } = buildUserModule(
        new PrismaUserRepository(),
        new ScryptPasswordHasher()
    );

    const parsedInput = createUserSchema.safeParse({
        nomeCompleto: required("INITIAL_ADMIN_NAME"),
        dataNascimento: required("INITIAL_ADMIN_BIRTH_DATE"),
        cpf: required("INITIAL_ADMIN_CPF"),
        email: required("INITIAL_ADMIN_EMAIL"),
        password: required("INITIAL_ADMIN_PASSWORD"),
        endereco: required("INITIAL_ADMIN_ADDRESS"),
        genero: required("INITIAL_ADMIN_GENDER"),
        telefone: required("INITIAL_ADMIN_PHONE"),
    });

    if (!parsedInput.success) {
        throw new Error(`Dados inválidos para administrador inicial: ${JSON.stringify(parsedInput.error.flatten())}`);
    }

    await users.initialAdmin(parsedInput.data);
}

try {
    await main();
} finally {
    await prisma.$disconnect();
}