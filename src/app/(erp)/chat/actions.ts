"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  channelSchema,
  chatMessageSchema,
  conversationIdSchema,
  directConversationSchema,
  type ChannelInput
} from "@/lib/validations/chat";
import {
  createChannel,
  createDirectConversation,
  deleteConversation,
  getChatWorkspace,
  listChatUsers,
  markConversationRead,
  serializeChatWorkspace,
  sendChatMessage
} from "@/services/chat-service";

async function requireChatUser() {
  const session = await getCurrentUser();
  if (!session?.user?.id || !session.user.role) throw new Error("Oturum gerekli");
  return { id: session.user.id, role: session.user.role };
}

export async function createDirectConversationAction(userId: string) {
  const currentUser = await requireChatUser();
  const data = directConversationSchema.parse({ userId });
  return createDirectConversation(currentUser, data.userId);
}

export async function createChannelAction(input: ChannelInput) {
  const currentUser = await requireChatUser();
  const data = channelSchema.parse(input);
  return createChannel(currentUser, data);
}

export async function deleteConversationAction(conversationId: string) {
  const currentUser = await requireChatUser();
  const id = conversationIdSchema.parse(conversationId);
  await deleteConversation(currentUser, id);
}

export async function sendChatMessageAction(conversationId: string, body: string) {
  const currentUser = await requireChatUser();
  const data = chatMessageSchema.parse({ conversationId, body });
  await sendChatMessage(currentUser, data.conversationId, data.body);
}

export async function markConversationReadAction(conversationId: string) {
  const currentUser = await requireChatUser();
  const id = conversationIdSchema.parse(conversationId);
  await markConversationRead(currentUser, id);
}

export async function getChatWorkspaceAction(conversationId?: string, afterMessageId?: string) {
  const currentUser = await requireChatUser();
  const id = conversationId === undefined ? undefined : conversationIdSchema.parse(conversationId);
  const cursor = afterMessageId === undefined ? undefined : conversationIdSchema.parse(afterMessageId);
  const workspace = await getChatWorkspace(currentUser, id, cursor);
  return serializeChatWorkspace(workspace);
}

export async function getChatUsersAction() {
  return listChatUsers(await requireChatUser());
}
