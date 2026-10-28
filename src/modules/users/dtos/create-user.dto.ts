import { z } from "zod";

function isValidCpf(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    for (let digitIndex = 9; digitIndex < 11; digitIndex++) {
        let sum = 0;

        for (let index = 0; index < digitIndex; index++) {
            sum += Number(cpf[index]) * (digitIndex + 1 - index);
        }

        const remainder = sum % 11;
        const expectedDigit = remainder < 2 ? 0 : 11 - remainder;

        if (Number(cpf[digitIndex]) !== expectedDigit) return false;
    }

    return true;
}

const cpfSchema = z
    .string()
    .regex(/^[\d.\-\s]+$/, "CPF contém caracteres inválidos")
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 11, "CPF deve conter 11 dígitos")
    .refine(isValidCpf, "CPF inválido");

const optionalEmailSchema = z
    .string()
    .trim()
    .pipe(z.email("E-mail institucional inválido"))
    .transform((value) => value.toLowerCase())
    .optional();

export const createUserSchema = z.strictObject({
    nomeCompleto: z.string().trim().min(2).max(120),
    dataNascimento: z.iso.date().transform((value) => new Date(`${value}T00:00:00.000Z`)),
    cpf: cpfSchema,
    email: z.string().trim().pipe(z.email()).transform((value) => value.toLowerCase()),
    password: z.string().min(12, "A senha deve conter pelo menos 12 caracteres").max(72, "A senha deve conter no máximo 72 caracteres"),
    endereco: z.string().trim().min(1).max(255),
    genero: z.string().trim().min(1).max(40),
    telefone: z.string().trim().min(8).max(20),
    emailInstitucional: optionalEmailSchema,
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
