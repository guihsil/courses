import { prisma } from "@/prisma/prisma";
import { User as UserEntity } from "../entity/user.entity";
import { UserAlreadyExistsError } from "../entity/user-errors";
import type { User as UserRecord } from "@/generated/prisma/client";
import type { UserRepository } from "./user.repository";

function toUserEntity(row: UserRecord): UserEntity {
    return new UserEntity({
        id: row.id,
        nomeCompleto: row.nomeCompleto,
        dataNascimento: row.dataNascimento,
        cpf: row.cpf,
        email: row.email,
        passwordHash: row.senhaHash,
        endereco: row.endereco,
        genero: row.genero,
        telefone: row.telefone,
        emailInstitucional: row.emailInstitucional,
        status: row.status,
        cargo: row.cargo,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    });
}

function isUniqueConstraintError(error: unknown): boolean {
    return typeof error === "object"
        && error !== null
        && "code" in error
        && error.code === "P2002";
}

export class PrismaUserRepository implements UserRepository {
    async findByEmail(email: string): Promise<UserEntity | null> {
        const row = await prisma.user.findUnique({ where: { email } });
        return row ? toUserEntity(row) : null;
    }

    async findByCpf(cpf: string): Promise<UserEntity | null> {
        const row = await prisma.user.findUnique({ where: { cpf } });
        return row ? toUserEntity(row) : null;
    }

    async findById(id: string): Promise<UserEntity | null> {
        const row = await prisma.user.findUnique({ where: { id } });
        return row ? toUserEntity(row) : null;
    }

    async save(user: UserEntity): Promise<UserEntity> {
        try {
            const row = await prisma.user.create({
                data: {
                    id: user.id,
                    nomeCompleto: user.nomeCompleto,
                    dataNascimento: user.dataNascimento,
                    cpf: user.cpf,
                    email: user.email,
                    senhaHash: user.passwordHash,
                    endereco: user.endereco,
                    genero: user.genero,
                    telefone: user.telefone,
                    emailInstitucional: user.emailInstitucional,
                    status: user.status,
                    cargo: user.cargo,
                },
            });

            return toUserEntity(row);
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new UserAlreadyExistsError();
            }

            throw error;
        }
    }
}