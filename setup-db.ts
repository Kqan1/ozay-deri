import { PrismaClient } from './app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
  console.log('pg_trgm extension created successfully.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
