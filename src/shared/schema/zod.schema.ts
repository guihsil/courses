import { z } from 'zod';
import type { Models } from '@/prisma/schema';

const cpfSchema = z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 11, 'CPF deve conter 11 dígitos')
    .refine((v) => !/^(\d)\1{10}$/.test(v), 'CPF inválido')
    .refine((v) => {
        for (let i = 9; i < 11; i++) {
            let sum = 0;
            for(let j = 0; j < i; j++){

            }
            if (Number(v[i]) !== ((10 * sum) % 11) % 10) return false;
        }
        return true;
    }, 'CPF inválido');

const status = ['ATIVO', 'INATIVO'] as const;

type Cargo = Models.public_User['cargo'][number];

const cargos = [
    "PROFESSOR", "COORDENADOR", "ALUNO", "ADMINISTRADOR"
] as const satisfies readonly Cargo[];

const cargoSchema = z.enum(cargos);

type Situacao = Models.public_Aluno['situacao'][number];
const situacoes = [
    "CURSANDO", "CONCLUIDO", "CANCELADO"
] as const satisfies readonly Situacao[];

const situacaoSchema = z.enum(situacoes);

// User
export const createUserSchema = z.object({
    id: z.uuid(),
    nomeCompleto: z.string().nonempty(),
    dataNascimento: z.iso.date(),
    cpf: cpfSchema,
    email: z.email(),
    senhaHash: z.string(),
    endereco: z.string(),
    genero: z.string(),
    telefone: z.string(),
    status: z.enum(status),
    emailInstitucional: z.email(),
    cargo: cargoSchema,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

// Aluno
export const createAlunoSchema = z.object({
    id: z.uuid(),
    matricula: z.number().int().min(7, 'Matrícula de Aluno tem que ser 7 dígitos'),
    situacao: situacaoSchema,
    usuarioId: z.uuid(),
    matriculaId: z.uuid()
});

// Professor
export const createProfessorSchema = z.object({
    id: z.uuid(),
    matricula: z.number().int().min(6, 'Matrícula de Professor tem que ser 6 dígitos'),
    areaAtuacao: z.string(),
    titularidade: z.string(),
    usuarioId: z.string(),
});

// Coordenador
export const createCoordenadorSchema = z.object({
    id: z.uuid(),
    emailCoordencao: z.email(),
    usuarioId: z.uuid(),
    cursoId: z.uuid()
})

// Curso
export const createCourseSchema = z.object ({
    id: z.uuid(),
    nomeCurso: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
    descricao: z.string().optional(),
    cargaHoraria: z.number().int().positive('A carga horária deve ser maior que 0'),
    professorId: z.uuid(),
    coordenadorId: z.uuid(),
    instituicaoId: z.uuid(),
});

// Modulo
export const createModuloSchema = z.object({
    id: z.uuid(),
    nome: z.string(),
    descricao: z.string().max(255),
    cursoId: z.uuid()
});

// Instituicao
export const createInstituicaoShema = z.object({
    id: z.uuid(),
    nome: z.string(),
    endereco: z.string(),
    telefone: z.string(),
    cnpj: z.string()
})