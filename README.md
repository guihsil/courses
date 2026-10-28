# Courses API

## Requisitos

- Node.js 20.19 ou superior.
- PostgreSQL.

## Configuração local

1. Instale Docker Desktop (ou Docker Engine com Compose) e as dependências com `npm install`.
2. Configure `DATABASE_URL` no `.env` para `postgresql://courses:courses_dev_password@localhost:5432/courses?schema=public`.
3. Inicie o PostgreSQL local com `docker compose up -d`.
4. Gere o Prisma Client com `npm run prisma:generate`.
5. Aplique a baseline ao banco local com `npm run db:migrate:deploy`.
6. Execute `npm run typecheck` e `npm test` para validar a instalação.

O Compose publica o PostgreSQL na porta `5432`, mantém os dados no volume `postgres_data` e verifica a disponibilidade do banco com um healthcheck. Para parar o serviço sem remover os dados, execute `docker compose down`. A senha padrão do Compose é somente para desenvolvimento local; use uma senha própria se o serviço puder ser acessado por outros dispositivos.

`docker compose down -v` apaga o volume e todos os dados locais do banco. Use esse comando somente se realmente quiser reiniciar o banco do zero.

O Prisma Client é gerado em `src/generated/prisma` e não é versionado. A geração deve ocorrer depois da instalação das dependências e após alterações no schema.

## Cadastro de usuários

O servidor é iniciado por `npm run dev` ou `npm start`. O endpoint `POST /users` aceita cadastro público somente de aluno; papel, status, identificador e timestamps são definidos pelo servidor. O CPF é obrigatório e validado (incluindo os dígitos verificadores), e-mail e CPF devem ser únicos, a senha deve conter de 12 a 72 caracteres e `emailInstitucional` é opcional.

A resposta contém somente `id`, `nomeCompleto` e `email`. Senhas são armazenadas com scrypt e sal aleatório. Configure `PORT` para alterar a porta (padrão `3000`).

## Prisma 7 e migrações

O projeto usa Prisma ORM 7.10.1. A configuração do CLI fica em `prisma.config.ts`, o schema em `src/prisma/schema.prisma` e as migrações padrão do Prisma em `prisma/migrations`.

As configurações seguem o [guia oficial de atualização para Prisma 7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) e a [documentação do gerador Prisma Client](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators).

- `npm run format` formata o schema.
- `npm run prisma:generate` valida o schema e gera o client.
- `npm run db:migrate:deploy` aplica as migrações versionadas em um banco vazio ou de implantação.
- `npm run db:migrate -- --name nome_da_migracao` cria e aplica uma nova migração após alterações no schema, em um banco de desenvolvimento.
- `npm run db:migrate:status` mostra o estado das migrações.

A migração `20261028000000_init` representa a estrutura atual para inicializar um banco vazio. O diretório `migrations/` na raiz contém migrações do formato anterior, específico do Prisma 8, e foi preservado; ele não é usado pelo Prisma 7.

**Não execute `migrate dev`, `migrate reset` ou `db push` contra um banco existente sem antes fazer backup e revisar o estado.** A história antiga não é automaticamente compatível com Prisma Migrate. Antes de adotar Prisma 7 em uma base existente, compare o schema real com a migração baseline e defina um procedimento de baseline controlado; somente marque uma migração como aplicada depois de confirmar que o banco já corresponde exatamente à estrutura esperada.

Não há seed de dados configurado neste momento.