import assert from 'node:assert/strict';
import test from 'node:test';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

test('Prisma Client initializes with the PostgreSQL driver adapter', async () => {
  const adapter = new PrismaPg({
    connectionString: 'postgresql://test:test@127.0.0.1:5432/test',
  });
  const client = new PrismaClient({ adapter });

  assert.equal(typeof client.user.findUnique, 'function');
  await client.$disconnect();
});
