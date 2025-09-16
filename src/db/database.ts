import { PrismaClient } from "@prisma/client";

const CATEGORIAS_PADRAO = [
  "Ferramentas",
  "Calçado",
  "Decoração",
  "Eletrodomésticos",
  "Roupas",
  "Eletrônicos",
  "Casa e Decoração",
  "Beleza e Saúde",
  "Esportes e Lazer",
  "Brinquedos e Games",
  "Automotivo",
  "Livros e Papelaria",
  "Pets",
];

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
globalForPrisma.prisma = prisma;

async function inicializarCategoriasPadrao() {
  const totalCategorias = await prisma.categoria.count();

  if (totalCategorias === 0) {
    const categoriasParaCriar = CATEGORIAS_PADRAO.map((nome) => ({ nome }));

    await prisma.categoria.createMany({
      data: categoriasParaCriar,
      skipDuplicates: true,
    });
  }
}

export async function conectarBanco() {
  await prisma.$connect();
  await inicializarCategoriasPadrao();
}

export async function desconectarBanco() {
  await prisma.$disconnect();
}

export async function limparBanco() {
  await prisma.mensagem.deleteMany();
  await prisma.proposta.deleteMany();
  await prisma.superLike.deleteMany();
  await prisma.dislike.deleteMany();
  await prisma.like.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.categoriasDeInteresse.deleteMany();
  await prisma.user.deleteMany();
  await prisma.categoria.deleteMany();

  await inicializarCategoriasPadrao();
}

process.on("beforeExit", () => {
  desconectarBanco().catch(console.error);
});

process.on("SIGINT", async () => {
  await desconectarBanco();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await desconectarBanco();
  process.exit(0);
});
