"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  channelSchema,
  chatMessageSchema,
  directConversationSchema,
  type ChannelInput
} from "@/lib/validations/chat";
import {
  createChannel,
  createDirectConversation,
  markConversationRead,
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
  const conversation = await createDirectConversation(currentUser, data.userId);
  revalidatePath("/chat");
  return conversation;
}

export async function createChannelAction(input: ChannelInput) {
  const currentUser = await requireChatUser();
  const data = channelSchema.parse(input);
  const conversation = await createChannel(currentUser, data);
  revalidatePath("/chat");
  return conversation;
}

export async function sendChatMessageAction(conversationId: string, body: string) {
  const currentUser = await requireChatUser();
  const data = chatMessageSchema.parse({ conversationId, body });
  await sendChatMessage(currentUser, data.conversationId, data.body);
  revalidatePath("/chat");
}

export async function markConversationReadAction(conversationId: string) {
  const currentUser = await requireChatUser();
  const data = directConversationSchema.parse({ userId: conversationId });
  await markConversationRead(currentUser, data.userId);
  revalidatePath("/chat");
}
