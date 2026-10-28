import { z } from 'zod';
import type { Situacao } from '@/generated/prisma/enums';

const situacoes = [
    "CURSANDO", "CONCLUIDO", "CANCELADO"
] as const satisfies readonly Situacao[];

const situacaoSchema = z.enum(situacoes);

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