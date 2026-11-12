import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.author.upsert({
    where: { email: "alice@exemplo.com" },
    update: {},
    create: { name: "Alice Silva", email: "alice@exemplo.com" },
  });

  const bob = await prisma.author.upsert({
    where: { email: "bob@exemplo.com" },
    update: {},
    create: { name: "Bob Santos", email: "bob@exemplo.com" },
  });

  await prisma.post.createMany({
    data: [
      {
        title: "Introdução ao Node.js",
        content: "Node.js é um runtime JavaScript para o servidor.",
        published: true,
        authorId: alice.id,
      },
      {
        title: "TypeScript com Express",
        content: "Como criar APIs tipadas com TypeScript e Express.",
        published: true,
        authorId: alice.id,
      },
      {
        title: "Prisma ORM com PostgreSQL",
        content: "Gerenciando banco de dados relacionais com Prisma.",
        published: false,
        authorId: bob.id,
      },
    ],
  });

  console.log(`Seed concluído! Autores criados: ${alice.name}, ${bob.name}`);
  console.log("3 posts inseridos.");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
