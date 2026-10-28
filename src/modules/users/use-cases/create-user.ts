import { User } from "../entity/user.entity";
import { UserAlreadyExistsError } from "../entity/user-errors";
import type { UserRepository } from "../repositories/user.repository";
import type { Cargo } from "@/generated/prisma/enums";

export interface CreateUserInput {
    nomeCompleto: string;
    dataNascimento: Date;
    cpf: string;
    email: string;
    password: string;
    endereco: string;
    genero: string;
    telefone: string;
    emailInstitucional?: string;
}

export type AdminInput = CreateUserInput;

export interface PasswordHasher {
    hash(plain: string): Promise<string>;
}

export class InitialAdminConflictError extends Error {
    constructor() {
        super("O e-mail do administrador inicial já pertence a um usuário que não é administrador");
        this.name = "InitialAdminConflictError";
    }
}

export class CreateUserUseCase {
    private readonly userRepository: UserRepository;
    private readonly passwordHasher: PasswordHasher;
    private readonly userCargo: Cargo;

    constructor(userRepository: UserRepository, passwordHasher: PasswordHasher, userCargo: Cargo = "ALUNO") {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.userCargo = userCargo;
    }

    async ensureInitialAdmin(input: AdminInput): Promise<void> {
        const existing = await this.userRepository.findByEmail(input.email);

        if (existing) {
            if (existing.cargo === "ADMINISTRADOR") return;
            throw new InitialAdminConflictError();
        }

        try {
            await this.execute(input);
        } catch (error) {
            if (!(error instanceof UserAlreadyExistsError)) throw error;

            const existingAfterConflict = await this.userRepository.findByEmail(input.email);
            if (existingAfterConflict?.cargo === "ADMINISTRADOR") return;
            if (existingAfterConflict) throw new InitialAdminConflictError();

            throw error;
        }
    }

    async execute(input: CreateUserInput): Promise<User> {
        const [existingEmail, existingCpf] = await Promise.all([
            this.userRepository.findByEmail(input.email),
            this.userRepository.findByCpf(input.cpf),
        ]);

        if (existingEmail || existingCpf) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await this.passwordHasher.hash(input.password);
        const now = new Date();
        const user = new User({
            id: crypto.randomUUID(),
            nomeCompleto: input.nomeCompleto,
            dataNascimento: input.dataNascimento,
            cpf: input.cpf,
            email: input.email,
            passwordHash,
            endereco: input.endereco,
            genero: input.genero,
            telefone: input.telefone,
            emailInstitucional: input.emailInstitucional ?? null,
            status: "ATIVO",
            cargo: this.userCargo,
            createdAt: now,
            updatedAt: now,
        });

        return this.userRepository.save(user);
    }
}
