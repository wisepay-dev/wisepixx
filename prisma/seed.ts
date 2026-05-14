import { PrismaClient, SellerLevel, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { slugify } from "../lib/sanitize";

const prisma = new PrismaClient();

const DEFAULT_FEES: Record<SellerLevel, { saleFeePercent: number; withdrawalFeePercent: number }> = {
  BRONZE: { saleFeePercent: 9, withdrawalFeePercent: 5.5 },
  SILVER: { saleFeePercent: 8, withdrawalFeePercent: 5.2 },
  GOLD: { saleFeePercent: 7, withdrawalFeePercent: 5 },
  DIAMOND: { saleFeePercent: 6, withdrawalFeePercent: 4.8 },
  LEGEND: { saleFeePercent: 5.5, withdrawalFeePercent: 4.5 }
};

const categories = [
  ["Bots Discord", "bots-discord", "Bots, automações e setups para servidores."],
  ["Design", "design", "Identidade visual, banners, thumbnails e social media."],
  ["Social Media", "social-media", "Pacotes de posts, edição e gestão de perfis."],
  ["Gift Cards", "gift-cards", "Gift cards autorizados e créditos digitais."],
  ["Licenças", "licencas", "Licenças digitais com direito de revenda."],
  ["Automações", "automacoes", "Scripts e fluxos para produtividade e vendas."],
  ["Streaming autorizado", "streaming-autorizado", "Acessos autorizados, familiares ou corporativos."],
  ["Serviços digitais", "servicos-digitais", "Consultoria, instalação, configuração e suporte."]
];

const badges = [
  ["Verificado", "verificado", "KYC aprovado e identidade revisada."],
  ["Parceiro WisePix", "parceiro-wisepix", "Responsável por uma Store parceira."],
  ["Gold Seller", "gold-seller", "Vendedor Gold com histórico consistente."],
  ["Diamond Seller", "diamond-seller", "Vendedor Diamond de alto desempenho."],
  ["Fast Delivery", "fast-delivery", "Entrega rápida e bem avaliada."],
  ["Trusted Seller", "trusted-seller", "Baixa disputa e avaliações positivas."],
  ["Top Seller", "top-seller", "Entre os vendedores com maior volume."]
];

const themes = [
  ["Minimal", "minimal", false, { palette: "white-blue", radius: 8, density: "comfortable" }],
  ["Gaming", "gaming", false, { palette: "deep-blue", radius: 8, density: "compact" }],
  ["Premium", "premium", true, { palette: "black-blue-white", radius: 8, density: "comfortable" }],
  ["Discord", "discord", false, { palette: "discord-blue", radius: 8, density: "social" }],
  ["Cyber", "cyber", true, { palette: "dark-blue", radius: 8, density: "compact" }],
  ["Clean Store", "clean-store", false, { palette: "clean-fintech", radius: 8, density: "comfortable" }]
];

const people = [
  { name: "Marina Costa", username: "maricreative", email: "marina@wisepix.dev", level: SellerLevel.GOLD, role: UserRole.SELLER },
  { name: "Rafael Nunes", username: "rafabots", email: "rafael@wisepix.dev", level: SellerLevel.DIAMOND, role: UserRole.PARTNER },
  { name: "Bianca Alves", username: "biaedits", email: "bianca@wisepix.dev", level: SellerLevel.SILVER, role: UserRole.SELLER },
  { name: "Caio Martins", username: "caiokeys", email: "caio@wisepix.dev", level: SellerLevel.LEGEND, role: UserRole.PARTNER },
  { name: "Owner WisePix", username: "owner", email: "owner@wisepix.dev", level: SellerLevel.LEGEND, role: UserRole.OWNER }
];

const productIdeas = [
  {
    seller: "rafabots",
    category: "bots-discord",
    title: "Bot Discord de tickets com painel e logs",
    description: "Bot configurável para tickets, transcript, cargos de suporte, avaliações e logs. Entrega inclui instalação assistida e ajuste de permissões no servidor.",
    priceCents: 14990,
    deliveryType: "MANUAL" as const
  },
  {
    seller: "maricreative",
    category: "design",
    title: "Pacote visual para loja digital",
    description: "Kit com avatar, banner, capa de produto e três posts para lançamento. Ideal para lojas novas que precisam parecer profissionais desde o primeiro dia.",
    priceCents: 8990,
    deliveryType: "MANUAL" as const
  },
  {
    seller: "biaedits",
    category: "social-media",
    title: "Calendário de 15 posts para Instagram",
    description: "Planejamento com legendas, ideias de criativos, chamadas de venda e roteiro de stories para prestadores de serviços digitais.",
    priceCents: 5990,
    deliveryType: "MANUAL" as const
  },
  {
    seller: "caiokeys",
    category: "gift-cards",
    title: "Gift card autorizado para games",
    description: "Crédito digital autorizado com entrega automática após pagamento aprovado. Produto destinado a contas próprias, sem revenda de origem duvidosa.",
    priceCents: 4990,
    deliveryType: "AUTOMATIC" as const
  },
  {
    seller: "rafabots",
    category: "automacoes",
    title: "Automação de boas-vindas para comunidade",
    description: "Fluxo completo para onboarding de membros, cargos por reação, mensagens privadas e relatório de entrada por canal.",
    priceCents: 7990,
    deliveryType: "MANUAL" as const
  }
];

async function main() {
  for (const level of Object.values(SellerLevel)) {
    await prisma.feeConfig.upsert({
      where: { level },
      update: DEFAULT_FEES[level],
      create: { level, ...DEFAULT_FEES[level] }
    });
  }

  for (const [name, slug, description] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description }
    });
  }

  for (const [name, slug, description] of badges) {
    await prisma.badge.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description }
    });
  }

  for (const [name, slug, isPremium, config] of themes) {
    await prisma.storeTheme.upsert({
      where: { slug: String(slug) },
      update: { name: String(name), isPremium: Boolean(isPremium), config },
      create: { name: String(name), slug: String(slug), isPremium: Boolean(isPremium), config }
    });
  }

  const passwordHash = await hash("WisePix@123", 12);
  for (const person of people) {
    await prisma.user.upsert({
      where: { email: person.email },
      update: { sellerLevel: person.level, roles: person.role === UserRole.OWNER ? [UserRole.USER, UserRole.SELLER, UserRole.ADMIN, UserRole.OWNER] : [UserRole.USER, person.role] },
      create: {
        email: person.email,
        username: person.username,
        name: person.name,
        passwordHash,
        sellerLevel: person.level,
        kycStatus: person.role === UserRole.PARTNER ? "APPROVED" : "NONE",
        roles: person.role === UserRole.OWNER ? [UserRole.USER, UserRole.SELLER, UserRole.ADMIN, UserRole.OWNER] : [UserRole.USER, person.role],
        profile: {
          create: {
            displayName: person.name,
            bio: `${person.name.split(" ")[0]} vende produtos digitais com foco em entrega clara, suporte rápido e comunidade.`
          }
        },
        settings: { create: {} },
        sellerWallet: { create: { walletId: `seller_seed_${person.username}` } }
      }
    });
  }

  const premium = await prisma.storeTheme.findUnique({ where: { slug: "premium" } });
  const gaming = await prisma.storeTheme.findUnique({ where: { slug: "gaming" } });
  const rafa = await prisma.user.findUniqueOrThrow({ where: { username: "rafabots" } });
  const caio = await prisma.user.findUniqueOrThrow({ where: { username: "caiokeys" } });

  await prisma.store.upsert({
    where: { subdomain: "elitekeys" },
    update: {},
    create: {
      ownerId: caio.id,
      name: "EliteKeys",
      slug: "elitekeys",
      subdomain: "elitekeys",
      description: "Store parceira focada em gift cards autorizados, licenças e produtos digitais de entrega rápida.",
      themeId: premium?.id,
      verified: true,
      status: "ACTIVE",
      saleFeePercent: 6,
      withdrawalFeePercent: 4.8,
      discordInvite: "https://discord.gg/configure"
    }
  });

  await prisma.store.upsert({
    where: { subdomain: "darkstore" },
    update: {},
    create: {
      ownerId: rafa.id,
      name: "DarkStore",
      slug: "darkstore",
      subdomain: "darkstore",
      description: "Automação, bots e setups para comunidades Discord que querem vender melhor.",
      themeId: gaming?.id,
      verified: true,
      status: "ACTIVE",
      saleFeePercent: 7,
      withdrawalFeePercent: 5,
      discordInvite: "https://discord.gg/configure"
    }
  });

  for (const idea of productIdeas) {
    const seller = await prisma.user.findUniqueOrThrow({ where: { username: idea.seller } });
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: idea.category } });
    await prisma.listing.upsert({
      where: { slug: slugify(idea.title) },
      update: {},
      create: {
        sellerId: seller.id,
        categoryId: category.id,
        title: idea.title,
        slug: slugify(idea.title),
        description: idea.description,
        priceCents: idea.priceCents,
        negotiable: idea.deliveryType === "MANUAL",
        deliveryType: idea.deliveryType,
        status: "ACTIVE",
        publishedAt: new Date(),
        featured: idea.seller === "rafabots"
      }
    });
  }

  const feedTexts = [
    "Hoje bati R$5.000 em vendas somando bots e serviços de setup. O que mudou foi tratar produto digital como operação de verdade.",
    "Nova loja no ar: catálogo organizado, entrega clara e Discord conectado com a comunidade.",
    "Primeira venda concluída na WisePix. O comprador pagou por Pix e já alinhamos a entrega pelo chat.",
    "Olha o que a WisePix me proporcionou: parei de vender só no direct e agora tenho vitrine, reviews e histórico."
  ];

  const users = await prisma.user.findMany({ where: { username: { in: ["rafabots", "maricreative", "biaedits", "caiokeys"] } } });
  for (let index = 0; index < feedTexts.length; index += 1) {
    const author = users[index % users.length];
    await prisma.feedPost.create({
      data: {
        authorId: author.id,
        text: feedTexts[index],
        automatic: index !== 3,
        achievement: index === 0 ? "revenue_5k" : undefined
      }
    });
  }

  await prisma.discordRoleConfig.createMany({
    data: [
      { key: "verified", label: "Cargo Verificado", roleId: "TODO_CONFIGURE_IN_OWNER_PANEL" },
      { key: "partner", label: "Cargo Parceiro", roleId: "TODO_CONFIGURE_IN_OWNER_PANEL" },
      { key: "level_bronze", label: "Bronze", roleId: "TODO_CONFIGURE_IN_OWNER_PANEL" },
      { key: "level_silver", label: "Silver", roleId: "TODO_CONFIGURE_IN_OWNER_PANEL" },
      { key: "level_gold", label: "Gold", roleId: "TODO_CONFIGURE_IN_OWNER_PANEL" },
      { key: "level_diamond", label: "Diamond", roleId: "TODO_CONFIGURE_IN_OWNER_PANEL" },
      { key: "level_legend", label: "Legend", roleId: "TODO_CONFIGURE_IN_OWNER_PANEL" }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
