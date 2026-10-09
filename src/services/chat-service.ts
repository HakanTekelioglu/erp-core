import { Prisma, type Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canCreateChatChannel } from "@/lib/permissions";

type ChatUser = {
  id: string;
  role: Role;
};

function conversationAccessWhere(user: ChatUser): Prisma.ChatConversationWhereInput {
  const publicChannelAccess: Prisma.ChatConversationWhereInput[] = [
    { type: "CHANNEL", isPrivate: false, audienceRole: null }
  ];

  if (user.role === "ADMIN" || user.role === "MANAGER") {
    publicChannelAccess.push({ type: "CHANNEL", isPrivate: false });
  } else {
    publicChannelAccess.push({ type: "CHANNEL", isPrivate: false, audienceRole: user.role });
  }

  return {
    OR: [
      ...publicChannelAccess,
      { members: { some: { userId: user.id } } }
    ]
  };
}

function canDeleteConversation(
  user: ChatUser,
  conversation: {
    type: "DIRECT" | "CHANNEL";
    key: string | null;
    createdById: string;
  }
) {
  if (conversation.key === "global-general") return false;
  if (conversation.createdById === user.id) return true;
  return conversation.type === "CHANNEL" && canCreateChatChannel(user.role);
}

async function ensureGeneralChannel(userId: string) {
  if (await prisma.chatConversation.findUnique({ where: { key: "global-general" }, select: { id: true } })) return;
  await prisma.chatConversation.upsert({
    where: { key: "global-general" },
    update: {},
    create: {
      type: "CHANNEL",
      key: "global-general",
      name: "Genel",
      description: "Tüm şirketin ortak iletişim kanalı",
      createdById: userId,
      members: { create: { userId } }
    }
  });
}

export async function getChatWorkspace(user: ChatUser, requestedConversationId?: string, afterMessageId?: string) {
  await ensureGeneralChannel(user.id);

  const conversations = await prisma.chatConversation.findMany({
    where: conversationAccessWhere(user),
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true, isActive: true } }
        }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } }
      }
    }
  });

  const missingMembershipConversationIds = conversations
    .filter((conversation) => !conversation.members.some((member) => member.userId === user.id))
    .map((conversation) => conversation.id);

  if (missingMembershipConversationIds.length) {
    await prisma.chatParticipant.createMany({
      data: missingMembershipConversationIds.map((conversationId) => ({
        conversationId,
        userId: user.id
      })),
      skipDuplicates: true
    });
  }

  const unreadCountRows = conversations.length
    ? await prisma.$queryRaw<Array<{ conversationId: string; count: number }>>(Prisma.sql`
        SELECT message."conversationId", COUNT(*)::int AS count
        FROM "ChatMessage" AS message
        INNER JOIN "ChatParticipant" AS participant
          ON participant."conversationId" = message."conversationId"
          AND participant."userId" = ${user.id}
        WHERE message."conversationId" IN (${Prisma.join(conversations.map(({ id }) => id))})
          AND message."senderId" <> ${user.id}
          AND message."createdAt" > participant."lastReadAt"
        GROUP BY message."conversationId"
      `)
    : [];
  const unreadCountsByConversation = new Map(
    unreadCountRows.map((row) => [row.conversationId, Number(row.count)])
  );

  const selectedConversation =
    requestedConversationId
      ? conversations.find((conversation) => conversation.id === requestedConversationId) ?? null
      : null;

  const cursor = selectedConversation && afterMessageId
    ? await prisma.chatMessage.findFirst({ where: { id: afterMessageId, conversationId: selectedConversation.id }, select: { id: true, createdAt: true } })
    : null;
  const messages = selectedConversation
    ? await prisma.chatMessage.findMany({
        where: { conversationId: selectedConversation.id, ...(cursor ? { OR: [{ createdAt: { gt: cursor.createdAt } }, { createdAt: cursor.createdAt, id: { gt: cursor.id } }] } : {}) },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 101,
        include: {
          sender: { select: { id: true, name: true, role: true } }
        }
      })
    : [];

  return {
    messagesMode: cursor && messages.length <= 100 ? "append" as const : "replace" as const,
    conversations: conversations.map((conversation) => {
      const otherUser =
        conversation.type === "DIRECT"
          ? conversation.members.find((member) => member.userId !== user.id)?.user
          : null;
      const latestMessage = conversation.messages[0];

      return {
        id: conversation.id,
        type: conversation.type,
        name: conversation.type === "DIRECT" ? otherUser?.name ?? "Birebir görüşme" : conversation.name ?? "Kanal",
        description:
          conversation.type === "DIRECT"
            ? otherUser?.email ?? ""
            : conversation.description ?? (conversation.audienceRole ? "Birim kanalı" : "Ortak kanal"),
        audienceRole: conversation.audienceRole,
        isPrivate: conversation.isPrivate,
        canDelete: canDeleteConversation(user, conversation),
        unreadCount: unreadCountsByConversation.get(conversation.id) ?? 0,
        latestMessage: latestMessage
          ? {
              body: latestMessage.body,
              senderName: latestMessage.sender.name,
              createdAt: latestMessage.createdAt
            }
          : null,
        memberCount: conversation.members.filter((member) => member.user.isActive).length
      };
    }),
    selectedConversation: selectedConversation
      ? {
          id: selectedConversation.id,
          type: selectedConversation.type,
          name:
            selectedConversation.type === "DIRECT"
              ? selectedConversation.members.find((member) => member.userId !== user.id)?.user.name ?? "Birebir görüşme"
              : selectedConversation.name ?? "Kanal",
          description:
            selectedConversation.type === "DIRECT"
              ? selectedConversation.members.find((member) => member.userId !== user.id)?.user.email ?? ""
              : selectedConversation.description ?? "",
          audienceRole: selectedConversation.audienceRole,
          isPrivate: selectedConversation.isPrivate,
          canDelete: canDeleteConversation(user, selectedConversation),
          members: selectedConversation.members
            .filter((member) => member.user.isActive)
            .map((member) => ({
              id: member.user.id,
              name: member.user.name,
              email: member.user.email,
              role: member.user.role
            }))
        }
      : null,
    messages: messages.slice(0, 100).reverse().map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      sender: message.sender
    })),
    users: [] as Array<{ id: string; name: string; email: string; role: Role }>
  };
}

export async function listChatUsers(user: ChatUser) {
  return prisma.user.findMany({ where: { isActive: true, id: { not: user.id } }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true, role: true } });
}

export async function getChatUnreadCount(user: ChatUser) {
  const [result] = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
    SELECT count(*)::int AS count FROM "ChatMessage" m
    JOIN "ChatParticipant" p ON p."conversationId" = m."conversationId" AND p."userId" = ${user.id}
    WHERE m."senderId" <> ${user.id} AND m."createdAt" > p."lastReadAt"
  `);
  return result.count;
}

export function serializeChatWorkspace(workspace: Awaited<ReturnType<typeof getChatWorkspace>>) {
  return {
    ...workspace,
    conversations: workspace.conversations.map((conversation) => ({
      ...conversation,
      latestMessage: conversation.latestMessage
        ? {
            ...conversation.latestMessage,
            createdAt: conversation.latestMessage.createdAt.toISOString()
          }
        : null
    })),
    messages: workspace.messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString()
    }))
  };
}

export type SerializedChatWorkspace = ReturnType<typeof serializeChatWorkspace>;

export async function createDirectConversation(currentUser: ChatUser, targetUserId: string) {
  if (currentUser.id === targetUserId) throw new Error("Kendinizle görüşme başlatamazsınız");

  const targetUser = await prisma.user.findFirst({
    where: { id: targetUserId, isActive: true },
    select: { id: true }
  });
  if (!targetUser) throw new Error("Kullanıcı bulunamadı");

  const participantIds = [currentUser.id, targetUserId].sort();
  const key = `direct:${participantIds.join(":")}`;

  return prisma.chatConversation.upsert({
    where: { key },
    update: {},
    create: {
      type: "DIRECT",
      key,
      isPrivate: true,
      createdById: currentUser.id,
      members: {
        create: participantIds.map((userId) => ({ userId }))
      }
    },
    select: { id: true }
  });
}

export async function createChannel(
  currentUser: ChatUser,
  input: {
    name: string;
    description?: string;
    audienceRole?: Role | null;
    isPrivate: boolean;
    memberIds: string[];
  }
) {
  if (!canCreateChatChannel(currentUser.role)) {
    throw new Error("Yalnızca yönetici ve admin kullanıcıları kanal oluşturabilir");
  }

  const memberIds = [...new Set([currentUser.id, ...input.memberIds])];
  const validMembers = await prisma.user.findMany({
    where: { id: { in: memberIds }, isActive: true },
    select: { id: true }
  });

  if (validMembers.length !== memberIds.length) {
    throw new Error("Kanal katılımcılarından biri bulunamadı");
  }

  return prisma.chatConversation.create({
    data: {
      type: "CHANNEL",
      name: input.name,
      description: input.description || null,
      audienceRole: input.isPrivate ? null : input.audienceRole,
      isPrivate: input.isPrivate,
      createdById: currentUser.id,
      members: {
        create: validMembers.map(({ id: userId }) => ({ userId }))
      }
    },
    select: { id: true }
  });
}

export async function deleteConversation(currentUser: ChatUser, conversationId: string) {
  const conversation = await prisma.chatConversation.findFirst({
    where: {
      id: conversationId,
      ...conversationAccessWhere(currentUser)
    },
    select: {
      id: true,
      type: true,
      key: true,
      createdById: true
    }
  });

  if (!conversation) throw new Error("Sohbet bulunamadı veya bu sohbete erişiminiz yok");
  if (!canDeleteConversation(currentUser, conversation)) {
    throw new Error("Bu sohbeti silme yetkiniz yok");
  }

  await prisma.chatConversation.delete({
    where: { id: conversation.id }
  });
}

export async function sendChatMessage(currentUser: ChatUser, conversationId: string, body: string) {
  const conversation = await prisma.chatConversation.findFirst({
    where: {
      id: conversationId,
      ...conversationAccessWhere(currentUser)
    },
    select: { id: true }
  });
  if (!conversation) throw new Error("Bu görüşmeye erişiminiz yok");

  const now = new Date();
  await prisma.$transaction([
    prisma.chatParticipant.upsert({
      where: { conversationId_userId: { conversationId, userId: currentUser.id } },
      update: { lastReadAt: now },
      create: { conversationId, userId: currentUser.id, lastReadAt: now }
    }),
    prisma.chatMessage.create({
      data: { conversationId, senderId: currentUser.id, body }
    }),
    prisma.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: now }
    })
  ]);
}

export async function markConversationRead(currentUser: ChatUser, conversationId: string) {
  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, ...conversationAccessWhere(currentUser) },
    select: { id: true }
  });
  if (!conversation) throw new Error("Bu görüşmeye erişiminiz yok");

  await prisma.chatParticipant.upsert({
    where: { conversationId_userId: { conversationId, userId: currentUser.id } },
    update: { lastReadAt: new Date() },
    create: { conversationId, userId: currentUser.id, lastReadAt: new Date() }
  });
}
