import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Verificação do Banco de Dados ===\n");

  // Verificar estrutura: tabelas existem?
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  const tableNames = tables.map((t) => t.tablename);
  console.log("Tabelas encontradas:", tableNames);

  if (!tableNames.includes("Author")) throw new Error("FALHA: Tabela 'Author' não encontrada!");
  if (!tableNames.includes("Post")) throw new Error("FALHA: Tabela 'Post' não encontrada!");
  console.log("✓ Tabela Author: OK");
  console.log("✓ Tabela Post: OK");

  // Verificar colunas da tabela Author
  const authorCols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Author' AND table_schema = 'public'
    ORDER BY column_name
  `;
  const authorColNames = authorCols.map((c) => c.column_name);
  console.log("\nColunas de Author:", authorColNames);

  for (const col of ["id", "name", "email", "createdAt"]) {
    if (!authorColNames.includes(col)) throw new Error(`FALHA: Coluna '${col}' ausente em Author!`);
  }
  console.log("✓ Estrutura da tabela Author: OK");

  // Verificar colunas da tabela Post
  const postCols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Post' AND table_schema = 'public'
    ORDER BY column_name
  `;
  const postColNames = postCols.map((c) => c.column_name);
  console.log("Colunas de Post:", postColNames);

  for (const col of ["id", "title", "content", "published", "authorId", "createdAt"]) {
    if (!postColNames.includes(col)) throw new Error(`FALHA: Coluna '${col}' ausente em Post!`);
  }
  console.log("✓ Estrutura da tabela Post: OK");

  // Verificar dados inseridos pelo seed
  console.log("\n=== Dados do Banco ===\n");

  const authorCount = await prisma.author.count();
  const postCount = await prisma.post.count();
  const publishedCount = await prisma.post.count({ where: { published: true } });

  console.log(`Autores: ${authorCount}`);
  console.log(`Posts: ${postCount}`);
  console.log(`Posts publicados: ${publishedCount}`);

  if (authorCount < 2) throw new Error(`FALHA: esperado >= 2 autores, encontrado ${authorCount}`);
  if (postCount < 3) throw new Error(`FALHA: esperado >= 3 posts, encontrado ${postCount}`);

  console.log("✓ Contagem de autores: OK");
  console.log("✓ Contagem de posts: OK");

  // Verificar dado específico
  const alice = await prisma.author.findUnique({
    where: { email: "alice@exemplo.com" },
    include: { posts: true },
  });
  if (!alice) throw new Error("FALHA: autor 'alice@exemplo.com' não encontrado!");

  console.log(`\n✓ Autor encontrado: ${alice.name} (${alice.posts.length} posts)`);

  const bob = await prisma.author.findUnique({ where: { email: "bob@exemplo.com" } });
  if (!bob) throw new Error("FALHA: autor 'bob@exemplo.com' não encontrado!");
  console.log(`✓ Autor encontrado: ${bob.name}`);

  console.log("\n=== Resultado ===");
  console.log("✓ Verificação concluída com sucesso!");
}

main()
  .catch((e) => {
    console.error("\n✗", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
