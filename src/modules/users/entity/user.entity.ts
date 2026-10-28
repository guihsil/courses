import type { Cargo, Status } from "@/generated/prisma/enums";

export interface UserData {
    id: string;
    nomeCompleto: string;
    dataNascimento: Date;
    cpf: string;
    email: string;
    passwordHash: string;
    endereco: string;
    genero: string;
    telefone: string;
    emailInstitucional: string | null;
    status: Status;
    cargo: Cargo;
    createdAt: Date;
    updatedAt: Date;
}

export class User {
    public readonly id: string;
    public readonly nomeCompleto: string;
    public readonly dataNascimento: Date;
    public readonly cpf: string;
    public readonly email: string;
    public readonly passwordHash: string;
    public readonly endereco: string;
    public readonly genero: string;
    public readonly telefone: string;
    public readonly emailInstitucional: string | null;
    public readonly status: Status;
    public readonly cargo: Cargo;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(data: UserData) {
        this.id = data.id;
        this.nomeCompleto = data.nomeCompleto;
        this.dataNascimento = data.dataNascimento;
        this.cpf = data.cpf;
        this.email = data.email;
        this.passwordHash = data.passwordHash;
        this.endereco = data.endereco;
        this.genero = data.genero;
        this.telefone = data.telefone;
        this.emailInstitucional = data.emailInstitucional;
        this.status = data.status;
        this.cargo = data.cargo;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
