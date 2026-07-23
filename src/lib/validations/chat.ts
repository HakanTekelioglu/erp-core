import { Role } from "@prisma/client";
import { z } from "zod";

export const chatMessageSchema = z.object({
  conversationId: z.string().trim().min(1).max(64),
  body: z.string().trim().min(1, "Mesaj boş olamaz").max(4000, "Mesaj 4000 karakterden uzun olamaz")
});

export const directConversationSchema = z.object({
  userId: z.string().trim().min(1).max(64)
});

export const conversationIdSchema = z.string().trim().min(1).max(64);

export const channelSchema = z.object({
  name: z.string().trim().min(2, "Kanal adı en az 2 karakter olmalı").max(80),
  description: z.string().trim().max(240).optional(),
  audienceRole: z.nativeEnum(Role).nullable().optional(),
  isPrivate: z.boolean().default(false),
  memberIds: z.array(z.string().trim().min(1).max(64)).max(50).default([])
});

export type ChannelInput = z.input<typeof channelSchema>;
