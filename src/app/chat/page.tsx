import { AppShell } from "@/components/layout/app-shell";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { getCurrentUser } from "@/lib/auth";
import { getChatWorkspace } from "@/services/chat-service";

type ChatPageProps = {
  searchParams: Promise<{ conversation?: string }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await getCurrentUser();
  if (!session?.user?.id || !session.user.role) return null;

  const { conversation } = await searchParams;
  const workspace = await getChatWorkspace(
    { id: session.user.id, role: session.user.role },
    conversation
  );

  return (
    <AppShell>
      <ChatWorkspace
        currentUser={{ id: session.user.id, name: session.user.name ?? "Kullanıcı", role: session.user.role }}
        conversations={workspace.conversations.map((item) => ({
          ...item,
          latestMessage: item.latestMessage
            ? { ...item.latestMessage, createdAt: item.latestMessage.createdAt.toISOString() }
            : null
        }))}
        selectedConversation={workspace.selectedConversation}
        messages={workspace.messages.map((message) => ({
          ...message,
          createdAt: message.createdAt.toISOString()
        }))}
        users={workspace.users}
      />
    </AppShell>
  );
}
