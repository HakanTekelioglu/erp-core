import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

async function ensureGeneralChannel(userId: string) {
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

export async function getChatWorkspace(user: ChatUser, requestedConversationId?: string) {
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

  if (conversations.length) {
    await prisma.chatParticipant.createMany({
      data: conversations.map((conversation) => ({
        conversationId: conversation.id,
        userId: user.id
      })),
      skipDuplicates: true
    });
  }

  const unreadCounts = await Promise.all(
    conversations.map(async (conversation) => {
      const membership = conversation.members.find((member) => member.userId === user.id);
      if (!membership) return 0;

      return prisma.chatMessage.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: user.id },
          createdAt: { gt: membership.lastReadAt }
        }
      });
    })
  );

  const selectedConversation =
    conversations.find((conversation) => conversation.id === requestedConversationId) ?? conversations[0] ?? null;

  const messages = selectedConversation
    ? await prisma.chatMessage.findMany({
        where: { conversationId: selectedConversation.id },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          sender: { select: { id: true, name: true, role: true } }
        }
      })
    : [];

  const users = await prisma.user.findMany({
    where: { isActive: true, id: { not: user.id } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true }
  });

  return {
    conversations: conversations.map((conversation, index) => {
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
        unreadCount: unreadCounts[index],
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
    messages: messages.reverse().map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      sender: message.sender
    })),
    users
  };
}

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
