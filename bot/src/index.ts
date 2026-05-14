import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type GuildMember
} from "discord.js";
import { PrismaClient, SellerLevel } from "@prisma/client";
import { z } from "zod";

const env = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  MIUSE_BASE_URL: z.string().default("https://api.miuse.app/v1/api"),
  MIUSE_PLATFORM_TOKEN: z.string().optional()
}).parse(process.env);

const prisma = new PrismaClient();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages] });

const commands = [
  new SlashCommandBuilder().setName("perfil").setDescription("Mostra seu perfil WisePix"),
  new SlashCommandBuilder().setName("saldo").setDescription("Mostra seu saldo WisePix"),
  new SlashCommandBuilder().setName("sacar").setDescription("Abre orientação de saque WisePix"),
  new SlashCommandBuilder().setName("ranking").setDescription("Mostra ranking de vendedores"),
  new SlashCommandBuilder().setName("minhas-vendas").setDescription("Lista suas vendas recentes"),
  new SlashCommandBuilder().setName("meus-pedidos").setDescription("Lista seus pedidos recentes"),
  new SlashCommandBuilder().setName("suporte").setDescription("Mostra canais de suporte WisePix")
].map((command) => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
  await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), { body: commands });
}

async function findUserByDiscord(discordId: string) {
  return prisma.user.findFirst({
    where: { accounts: { some: { provider: "discord", providerAccountId: discordId } } },
    include: { sellerWallet: true, badges: { include: { badge: true } } }
  });
}

async function roleMap() {
  const roles = await prisma.discordRoleConfig.findMany();
  return new Map(roles.map((role) => [role.key, role.roleId]));
}

async function getMiuseBalance(walletId: string) {
  if (!env.MIUSE_PLATFORM_TOKEN) throw new Error("MIUSE_PLATFORM_TOKEN ausente");
  const response = await fetch(`${env.MIUSE_BASE_URL}/wallets/${encodeURIComponent(walletId)}/balance`, {
    headers: { Authorization: `Bearer ${env.MIUSE_PLATFORM_TOKEN}` }
  });
  if (!response.ok) throw new Error(`Miuse balance failed: ${response.status}`);
  return response.json() as Promise<{ available: number; locked: number; pending: number; scheduled: number }>;
}

async function setRole(member: GuildMember, roleId: string | undefined, enabled: boolean) {
  if (!roleId || roleId.startsWith("TODO_")) return;
  if (enabled && !member.roles.cache.has(roleId)) await member.roles.add(roleId);
  if (!enabled && member.roles.cache.has(roleId)) await member.roles.remove(roleId);
}

async function syncRoles(member: GuildMember) {
  const user = await findUserByDiscord(member.id);
  if (!user) return;
  const roles = await roleMap();

  await setRole(member, roles.get("verified"), user.kycStatus === "APPROVED");
  await setRole(member, roles.get("partner"), user.roles.includes("PARTNER"));

  for (const level of Object.values(SellerLevel)) {
    await setRole(member, roles.get(`level_${level.toLowerCase()}`), user.sellerLevel === level);
  }

  for (const { badge } of user.badges) {
    if (badge.discordRoleKey) await setRole(member, roles.get(badge.discordRoleKey), true);
  }
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const user = await findUserByDiscord(interaction.user.id);
  if (!user) {
    await interaction.reply({ content: "Conecte seu Discord na WisePix para usar este comando.", ephemeral: true });
    return;
  }

  if (interaction.commandName === "perfil") {
    await interaction.reply({
      content: `@${user.username ?? "sem_username"} · nível ${user.sellerLevel} · badges ${user.badges.length}`,
      ephemeral: true
    });
  }

  if (interaction.commandName === "saldo") {
    if (!user.sellerWallet) {
      await interaction.reply({ content: "Você ainda não tem wallet Miuse vinculada.", ephemeral: true });
      return;
    }
    const balance = await getMiuseBalance(user.sellerWallet.walletId);
    await interaction.reply({
      content: [
        `Disponível: ${(balance.available / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        `Travado: ${(balance.locked / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        `Pendente: ${(balance.pending / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        `Agendado: ${(balance.scheduled / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
      ].join("\n"),
      ephemeral: true
    });
  }

  if (interaction.commandName === "ranking") {
    const ranking = await prisma.order.groupBy({
      by: ["sellerId"],
      where: { status: { in: ["PAID", "DELIVERED", "COMPLETED"] } },
      _sum: { amountCents: true },
      orderBy: { _sum: { amountCents: "desc" } },
      take: 10
    });
    const users = await prisma.user.findMany({ where: { id: { in: ranking.map((item) => item.sellerId) } } });
    const userMap = new Map(users.map((item) => [item.id, item]));
    await interaction.reply({
      content: ranking.map((item, index) => {
        const seller = userMap.get(item.sellerId);
        return `${index + 1}. @${seller?.username ?? item.sellerId} - ${((item._sum.amountCents ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
      }).join("\n") || "Ranking ainda vazio.",
      ephemeral: true
    });
  }

  if (interaction.commandName === "minhas-vendas") {
    const orders = await prisma.order.findMany({ where: { sellerId: user.id }, include: { listing: true }, orderBy: { createdAt: "desc" }, take: 5 });
    await interaction.reply({
      content: orders.map((order) => `${order.listing.title} · ${order.status}`).join("\n") || "Nenhuma venda recente.",
      ephemeral: true
    });
  }

  if (interaction.commandName === "meus-pedidos") {
    const orders = await prisma.order.findMany({ where: { buyerId: user.id }, include: { listing: true }, orderBy: { createdAt: "desc" }, take: 5 });
    await interaction.reply({
      content: orders.map((order) => `${order.listing.title} · ${order.status}`).join("\n") || "Nenhum pedido recente.",
      ephemeral: true
    });
  }

  if (interaction.commandName === "sacar") {
    await interaction.reply({ content: "Solicite saque pelo painel vendedor. A operação usa Miuse e Idempotency-Key por transação.", ephemeral: true });
  }

  if (interaction.commandName === "suporte") {
    await interaction.reply({ content: "Abra um ticket no painel WisePix ou use o canal de suporte configurado pela sua Store.", ephemeral: true });
  }
}

client.once("ready", async () => {
  console.log(`WisePix bot online as ${client.user?.tag}`);
  await registerCommands();
});

client.on("guildMemberUpdate", async (_, member) => {
  await syncRoles(member).catch(console.error);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await handleCommand(interaction).catch(async (error) => {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "Não consegui processar agora.", ephemeral: true });
    } else {
      await interaction.reply({ content: "Não consegui processar agora.", ephemeral: true });
    }
  });
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  client.destroy();
  process.exit(0);
});

client.login(env.DISCORD_BOT_TOKEN);
