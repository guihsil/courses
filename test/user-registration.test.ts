import assert from "node:assert/strict";
import test from "node:test";
import { User } from "../src/modules/users/entity/user.entity";
import { UserAlreadyExistsError } from "../src/modules/users/entity/user-errors";
import { CreateUserController } from "../src/modules/users/controllers/create-user.controller";
import { createUserSchema } from "../src/modules/users/dtos/create-user.dto";
import type { UserRepository } from "../src/modules/users/repositories/user.repository";
import { usersRoutes } from "../src/modules/users/routes/user.routes";
import { CreateUserUseCase, InitialAdminConflictError } from "../src/modules/users/use-cases/create-user";
import { buildUserModule } from "../src/modules/users/user.module";
import { createApp } from "../src/app";

const validInput = {
    nomeCompleto: "Ana Exemplo",
    dataNascimento: "2000-02-29",
    cpf: "529.982.247-25",
    email: "ana@example.com",
    password: "A-strong-password-123",
    endereco: "Rua das Flores, 10",
    genero: "Feminino",
    telefone: "+55 (11) 99999-9999",
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

class MemoryUserRepository implements UserRepository {
    private readonly users: User[] = [];

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find((user) => user.email === email) ?? null;
    }

    async findByCpf(cpf: string): Promise<User | null> {
        return this.users.find((user) => user.cpf === cpf) ?? null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find((user) => user.id === id) ?? null;
    }

    async save(user: User): Promise<User> {
        if (await this.findByEmail(user.email) || await this.findByCpf(user.cpf)) {
            throw new UserAlreadyExistsError();
        }

        this.users.push(user);
        return user;
    }
}

test("user registration validates CPF and rejects client-controlled fields", () => {
    const valid = createUserSchema.safeParse(validInput);
    assert.equal(valid.success, true);

    const withInstitutionalEmail = createUserSchema.safeParse({
        ...validInput,
        emailInstitucional: " Ana@Instituicao.edu ",
    });
    assert.equal(withInstitutionalEmail.success, true);
    if (withInstitutionalEmail.success) {
        assert.equal(withInstitutionalEmail.data.emailInstitucional, "ana@instituicao.edu");
    }

    const invalidCpf = createUserSchema.safeParse({
        ...validInput,
        cpf: "529.982.247-24",
    });
    assert.equal(invalidCpf.success, false);

    const cpfWithLetters = createUserSchema.safeParse({
        ...validInput,
        cpf: "cpf 529.982.247-25",
    });
    assert.equal(cpfWithLetters.success, false);

    const invalidDate = createUserSchema.safeParse({
        ...validInput,
        dataNascimento: "2001-02-29",
    });
    assert.equal(invalidDate.success, false);

    const weakPassword = createUserSchema.safeParse({
        ...validInput,
        password: "short",
    });
    assert.equal(weakPassword.success, false);

    const tooLongPassword = createUserSchema.safeParse({
        ...validInput,
        password: "a".repeat(73),
    });
    assert.equal(tooLongPassword.success, false);

    const attemptedRoleOverride = createUserSchema.safeParse({
        ...validInput,
        cargo: "ADMINISTRADOR",
    });
    assert.equal(attemptedRoleOverride.success, false);
});

test("registration endpoint persists a student and returns only safe fields", async () => {
    const repository = new MemoryUserRepository();
    const useCase = new CreateUserUseCase(repository, {
        hash: async (password) => `test-hash:${password}`,
    });
    const app = createApp(usersRoutes(new CreateUserController(useCase)));
    const server = app.listen(0);

    await new Promise<void>((resolve) => server.once("listening", resolve));

    try {
        const address = server.address();
        if (!address || typeof address === "string") {
            throw new Error("The HTTP server did not bind to a TCP address.");
        }

        const url = `http://127.0.0.1:${address.port}/users`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                ...validInput,
                email: " Ana@Example.com ",
            }),
        });

        assert.equal(response.status, 201);
        const body: unknown = await response.json();
        assert.ok(isRecord(body));
        assert.deepEqual(Object.keys(body).sort(), [
            "email",
            "id",
            "nomeCompleto",
        ]);
        assert.equal(body.email, "ana@example.com");

        const savedUser = await repository.findByEmail("ana@example.com");
        assert.ok(savedUser);
        assert.equal(savedUser.id, body.id);
        assert.equal(savedUser.cargo, "ALUNO");
        assert.equal(savedUser.status, "ATIVO");
        assert.equal(savedUser.cpf, "52998224725");
        assert.equal(savedUser.emailInstitucional, null);
        assert.equal(savedUser.passwordHash, `test-hash:${validInput.password}`);

        const duplicateEmail = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(validInput),
        });
        assert.equal(duplicateEmail.status, 409);

        const duplicateCpf = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                ...validInput,
                email: "another@example.com",
            }),
        });
        assert.equal(duplicateCpf.status, 409);

        const invalidRequest = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                ...validInput,
                cpf: "111.111.111-11",
            }),
        });
        assert.equal(invalidRequest.status, 400);

        const malformedJson = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: '{"nomeCompleto":',
        });
        assert.equal(malformedJson.status, 400);
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
});

test("initial admin seed is idempotent and never promotes an existing student", async () => {
    const repository = new MemoryUserRepository();
    const hasher = { hash: async (password: string) => `test-hash:${password}` };
    const { users } = buildUserModule(repository, hasher);
    const parsedInput = createUserSchema.parse(validInput);

    await users.initialAdmin(parsedInput);
    const admin = await repository.findByEmail(parsedInput.email);

    assert.ok(admin);
    assert.equal(admin.cargo, "ADMINISTRADOR");
    await users.initialAdmin(parsedInput);
    assert.equal((await repository.findByEmail(parsedInput.email))?.id, admin.id);

    const studentInput = createUserSchema.parse({
        ...validInput,
        email: "student@example.com",
        cpf: "111.444.777-35",
    });
    const studentUseCase = new CreateUserUseCase(repository, hasher);
    await studentUseCase.execute(studentInput);

    await assert.rejects(
        users.initialAdmin(studentInput),
        InitialAdminConflictError,
    );
    assert.equal((await repository.findByEmail(studentInput.email))?.cargo, "ALUNO");
});
