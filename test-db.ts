import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 2
  })
  console.dir(products, { depth: null })
}
main()
