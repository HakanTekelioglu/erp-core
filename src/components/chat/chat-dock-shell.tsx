"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode
} from "react";
import type { Role } from "@prisma/client";
import {
  ArrowLeft,
  Check,
  Hash,
  LockKeyhole,
  MessageCircle,
  Plus,
  Search,
  Send,
  Users,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  createChannelAction,
  createDirectConversationAction,
  getChatWorkspaceAction,
  markConversationReadAction,
  sendChatMessageAction
} from "@/app/chat/actions";
import { Button } from "@/components/ui/button";
import { canCreateChatChannel, roleLabels } from "@/lib/permissions";
import type { SerializedChatWorkspace } from "@/services/chat-service";
import { cn } from "@/lib/utils";

type ChatDockContextValue = {
  isOpen: boolean;
  unreadCount: number;
  toggle: () => void;
};

type CurrentUser = {
  id: string;
  name: string;
  role: Role;
};

type DialogType = "direct" | "channel" | null;
type ChannelVisibility = "company" | "unit" | "private";

const ChatDockContext = createContext<ChatDockContextValue | null>(null);
const unitRoles: Role[] = ["SALES", "WAREHOUSE", "ACCOUNTING"];

export function useChatDock() {
  const context = useContext(ChatDockContext);
  if (!context) throw new Error("useChatDock, ChatDockShell içinde kullanılmalı");
  return context;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

function messageTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function conversationTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return messageTime(value);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short"
  }).format(date);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "İşlem tamamlanamadı";
}

export function ChatDockShell({
  currentUser,
  initialData,
  topbar,
  children
}: {
  currentUser: CurrentUser;
  initialData: SerializedChatWorkspace;
  topbar: ReactNode;
  children: ReactNode;
}) {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState<DialogType>(null);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelVisibility, setChannelVisibility] = useState<ChannelVisibility>("company");
  const [channelRole, setChannelRole] = useState<Role>("SALES");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const canCreateChannel = canCreateChatChannel(currentUser.role);

  const unreadCount = useMemo(
    () => data.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
    [data.conversations]
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    if (!query) return data.conversations;
    return data.conversations.filter((conversation) =>
      `${conversation.name} ${conversation.description}`
        .toLocaleLowerCase("tr-TR")
        .includes(query)
    );
  }, [data.conversations, search]);

  const selectedConversation =
    activeConversationId && data.selectedConversation?.id === activeConversationId
      ? data.selectedConversation
      : null;

  const setDockOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    try {
      window.localStorage.setItem("mini-erp-chat-open", String(open));
    } catch {}
  }, []);

  const refreshWorkspace = useCallback(async (conversationId?: string) => {
    const nextData = await getChatWorkspaceAction(conversationId);
    setData(nextData);
    return nextData;
  }, []);

  useEffect(() => {
    try {
      if (window.localStorage.getItem("mini-erp-chat-open") === "true") {
        setIsOpen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refreshWorkspace(activeConversationId ?? undefined).catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [activeConversationId, refreshWorkspace]);

  useEffect(() => {
    if (!activeConversationId || !selectedConversation) return;

    setData((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    }));
    void markConversationReadAction(activeConversationId);
  }, [activeConversationId, data.messages.length, selectedConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data.messages, selectedConversation?.id]);

  async function openConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setIsConversationLoading(true);
    try {
      await refreshWorkspace(conversationId);
    } catch (error) {
      setActiveConversationId(null);
      toast.error(errorMessage(error));
    } finally {
      setIsConversationLoading(false);
    }
  }

  function startDirectConversation(userId: string) {
    startTransition(async () => {
      try {
        const conversation = await createDirectConversationAction(userId);
        setDialog(null);
        await openConversation(conversation.id);
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });
  }

  function createChannel() {
    if (!canCreateChannel) {
      toast.error("Yalnızca yönetici ve admin kullanıcıları kanal oluşturabilir");
      setDialog(null);
      return;
    }

    startTransition(async () => {
      try {
        const conversation = await createChannelAction({
          name: channelName,
          description: channelDescription,
          isPrivate: channelVisibility === "private",
          audienceRole: channelVisibility === "unit" ? channelRole : null,
          memberIds: selectedMembers
        });
        setDialog(null);
        setChannelName("");
        setChannelDescription("");
        setChannelVisibility("company");
        setSelectedMembers([]);
        await openConversation(conversation.id);
        toast.success("Kanal oluşturuldu");
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });
  }

  function sendMessage() {
    const body = message.trim();
    if (!activeConversationId || !body) return;
    setMessage("");

    startTransition(async () => {
      try {
        await sendChatMessageAction(activeConversationId, body);
        await refreshWorkspace(activeConversationId);
      } catch (error) {
        setMessage(body);
        toast.error(errorMessage(error));
      }
    });
  }

  const scopeLabel = selectedConversation
    ? selectedConversation.type === "DIRECT"
      ? roleLabels[
          selectedConversation.members.find((member) => member.id !== currentUser.id)?.role ??
            currentUser.role
        ]
      : selectedConversation.isPrivate
        ? `${selectedConversation.members.length} katılımcı`
        : selectedConversation.audienceRole
          ? `${roleLabels[selectedConversation.audienceRole]} birimi`
          : "Tüm şirket"
    : "";

  return (
    <ChatDockContext.Provider
      value={{
        isOpen,
        unreadCount,
        toggle: () => setDockOpen(!isOpen)
      }}
    >
      {topbar}

      <div className="flex min-h-[calc(100vh-4rem)] items-stretch">
        <main className="min-w-0 flex-1">{children}</main>

        {isOpen ? (
          <button
            type="button"
            aria-label="Mesaj panelini kapat"
            onClick={() => setDockOpen(false)}
            className="fixed inset-0 top-16 z-30 bg-slate-950/25 md:hidden"
          />
        ) : null}

        <aside
          aria-label="Mesaj paneli"
          aria-hidden={!isOpen}
          className={cn(
            "fixed inset-y-0 right-0 top-16 z-40 h-[calc(100vh-4rem)] overflow-hidden border-l border-border bg-white shadow-2xl transition-transform duration-200 md:sticky md:z-10 md:shrink-0 md:translate-x-0 md:shadow-none md:transition-[width] md:duration-200",
            isOpen
              ? "w-full translate-x-0 sm:w-[420px] md:w-[390px] xl:w-[430px]"
              : "pointer-events-none w-full translate-x-full border-l-0 sm:w-[420px] md:w-0 md:translate-x-0"
          )}
        >
          <div
            className={cn(
              "flex h-full w-full flex-col bg-white transition-opacity sm:w-[420px] md:w-[390px] xl:w-[430px]",
              isOpen ? "opacity-100" : "opacity-0"
            )}
          >
            {activeConversationId ? (
              <ConversationView
                currentUser={currentUser}
                selectedConversation={selectedConversation}
                messages={data.messages}
                message={message}
                isLoading={isConversationLoading}
                isPending={isPending}
                scopeLabel={scopeLabel}
                messageEndRef={messageEndRef}
                onBack={() => setActiveConversationId(null)}
                onClose={() => setDockOpen(false)}
                onMessageChange={setMessage}
                onSend={sendMessage}
              />
            ) : (
              <ConversationList
                conversations={filteredConversations}
                search={search}
                unreadCount={unreadCount}
                onSearchChange={setSearch}
                onOpenConversation={openConversation}
                onOpenDirectDialog={() => setDialog("direct")}
                onOpenChannelDialog={() => setDialog("channel")}
                canCreateChannel={canCreateChannel}
                onClose={() => setDockOpen(false)}
              />
            )}
          </div>
        </aside>
      </div>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setDockOpen(true)}
          className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-lg border border-r-0 border-border bg-white px-2 py-3 text-muted shadow-lg transition hover:bg-blue-50 hover:text-brand"
          aria-label="Mesaj panelini aç"
        >
          <MessageCircle className="size-4" />
          <span className="rotate-180 text-[11px] font-semibold tracking-wide [writing-mode:vertical-rl]">
            Mesajlar
          </span>
          {unreadCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-5 text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      ) : null}

      {dialog && (dialog !== "channel" || canCreateChannel) ? (
        <ChatDialog
          type={dialog}
          users={data.users}
          isPending={isPending}
          channelName={channelName}
          channelDescription={channelDescription}
          channelVisibility={channelVisibility}
          channelRole={channelRole}
          selectedMembers={selectedMembers}
          onClose={() => setDialog(null)}
          onStartDirect={startDirectConversation}
          onChannelNameChange={setChannelName}
          onChannelDescriptionChange={setChannelDescription}
          onChannelVisibilityChange={setChannelVisibility}
          onChannelRoleChange={setChannelRole}
          onSelectedMembersChange={setSelectedMembers}
          onCreateChannel={createChannel}
        />
      ) : null}
    </ChatDockContext.Provider>
  );
}

function ConversationList({
  conversations,
  search,
  unreadCount,
  onSearchChange,
  onOpenConversation,
  onOpenDirectDialog,
  onOpenChannelDialog,
  canCreateChannel,
  onClose
}: {
  conversations: SerializedChatWorkspace["conversations"];
  search: string;
  unreadCount: number;
  onSearchChange: (value: string) => void;
  onOpenConversation: (id: string) => void;
  onOpenDirectDialog: () => void;
  onOpenChannelDialog: () => void;
  canCreateChannel: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <header className="shrink-0 border-b border-border px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-50 text-brand">
              <MessageCircle className="size-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-ink">Mesajlar</h2>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </div>
              <p className="text-[10px] text-muted">Ekip iletişimi</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenDirectDialog}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted transition hover:bg-slate-50 hover:text-brand"
              aria-label="Yeni birebir görüşme"
              title="Yeni birebir görüşme"
            >
              <MessageCircle className="size-3.5" />
            </button>
            {canCreateChannel ? (
              <button
                type="button"
                onClick={onOpenChannelDialog}
                className="inline-flex size-8 items-center justify-center rounded-md bg-brand text-white transition hover:bg-blue-700"
                aria-label="Yeni kanal"
                title="Yeni kanal"
              >
                <Plus className="size-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-slate-100 hover:text-ink"
              aria-label="Mesaj panelini kapat"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="min-h-9 w-full rounded-md border border-border bg-slate-50 pl-8 pr-3 text-xs outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
            placeholder="Konuşmalarda ara"
            aria-label="Konuşmalarda ara"
          />
        </label>
      </header>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onOpenConversation(conversation.id)}
            className="mb-1 flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-100"
          >
            <span
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center text-xs font-semibold",
                conversation.type === "CHANNEL"
                  ? "rounded-lg bg-slate-100 text-slate-700"
                  : "rounded-full bg-blue-50 text-brand"
              )}
            >
              {conversation.type === "CHANNEL" ? (
                conversation.isPrivate ? (
                  <LockKeyhole className="size-3.5" />
                ) : (
                  <Hash className="size-3.5" />
                )
              ) : (
                initials(conversation.name)
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-ink">
                  {conversation.name}
                </span>
                {conversation.latestMessage ? (
                  <span className="shrink-0 text-[9px] text-muted">
                    {conversationTime(conversation.latestMessage.createdAt)}
                  </span>
                ) : null}
              </span>
              <span className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-[11px] text-muted">
                  {conversation.latestMessage
                    ? `${conversation.latestMessage.senderName}: ${conversation.latestMessage.body}`
                    : conversation.description}
                </span>
                {conversation.unreadCount > 0 ? (
                  <span className="inline-flex min-w-4 shrink-0 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-4 text-white">
                    {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                  </span>
                ) : null}
              </span>
            </span>
          </button>
        ))}

        {!conversations.length ? (
          <div className="px-5 py-12 text-center">
            <MessageCircle className="mx-auto mb-3 size-6 text-muted" />
            <p className="text-xs font-medium text-ink">Konuşma bulunamadı</p>
            <p className="mt-1 text-[11px] text-muted">
              Aramayı temizleyin veya yeni bir görüşme başlatın.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}

function ConversationView({
  currentUser,
  selectedConversation,
  messages,
  message,
  isLoading,
  isPending,
  scopeLabel,
  messageEndRef,
  onBack,
  onClose,
  onMessageChange,
  onSend
}: {
  currentUser: CurrentUser;
  selectedConversation: SerializedChatWorkspace["selectedConversation"];
  messages: SerializedChatWorkspace["messages"];
  message: string;
  isLoading: boolean;
  isPending: boolean;
  scopeLabel: string;
  messageEndRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onClose: () => void;
  onMessageChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-slate-100 hover:text-ink"
          aria-label="Konuşmalara dön"
        >
          <ArrowLeft className="size-4" />
        </button>

        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center bg-slate-100 text-[10px] font-semibold text-slate-700",
            selectedConversation?.type === "DIRECT" ? "rounded-full" : "rounded-lg"
          )}
        >
          {selectedConversation?.type === "CHANNEL" ? (
            selectedConversation.isPrivate ? (
              <LockKeyhole className="size-3.5" />
            ) : (
              <Hash className="size-3.5" />
            )
          ) : selectedConversation ? (
            initials(selectedConversation.name)
          ) : (
            <MessageCircle className="size-3.5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xs font-semibold text-ink">
            {selectedConversation?.name ?? "Konuşma yükleniyor"}
          </h2>
          <p className="truncate text-[10px] text-muted">{scopeLabel}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-slate-100 hover:text-ink"
          aria-label="Mesaj panelini kapat"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 px-4 py-4">
        {isLoading || !selectedConversation ? (
          <div className="flex h-full items-center justify-center">
            <span className="size-5 animate-spin rounded-full border-2 border-brand/25 border-t-brand" />
          </div>
        ) : (
          <>
            {!messages.length ? (
              <div className="mx-auto max-w-xs py-16 text-center">
                <span className="mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-blue-50 text-brand">
                  <MessageCircle className="size-5" />
                </span>
                <h3 className="text-xs font-semibold text-ink">İlk mesajı siz gönderin</h3>
                <p className="mt-1 text-[11px] leading-5 text-muted">
                  Bu görüşmede henüz mesaj bulunmuyor.
                </p>
              </div>
            ) : null}

            <div className="space-y-4">
              {messages.map((item, index) => {
                const own = item.sender.id === currentUser.id;
                const previous = messages[index - 1];
                const grouped =
                  previous?.sender.id === item.sender.id &&
                  new Date(item.createdAt).getTime() -
                    new Date(previous.createdAt).getTime() <
                    5 * 60 * 1000;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-end gap-2",
                      own && "flex-row-reverse",
                      grouped && "-mt-2"
                    )}
                  >
                    {grouped ? (
                      <span className="size-7 shrink-0" />
                    ) : (
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-700">
                        {initials(item.sender.name)}
                      </span>
                    )}

                    <div className={cn("max-w-[82%]", own && "text-right")}>
                      {!grouped ? (
                        <div
                          className={cn(
                            "mb-1 flex items-center gap-1.5",
                            own && "justify-end"
                          )}
                        >
                          <span className="text-[10px] font-semibold text-ink">
                            {own ? "Siz" : item.sender.name}
                          </span>
                          <span className="text-[9px] text-muted">
                            {roleLabels[item.sender.role]}
                          </span>
                        </div>
                      ) : null}

                      <div
                        className={cn(
                          "inline-block whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-left text-xs leading-5",
                          own
                            ? "rounded-br-sm bg-brand text-white"
                            : "rounded-bl-sm border border-border bg-white text-ink"
                        )}
                      >
                        {item.body}
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 flex items-center gap-1 text-[9px] text-muted",
                          own && "justify-end"
                        )}
                      >
                        {messageTime(item.createdAt)}
                        {own ? <Check className="size-2.5" /> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div ref={messageEndRef} />
          </>
        )}
      </div>

      <form
        className="flex shrink-0 items-end gap-2 border-t border-border bg-white p-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          rows={1}
          maxLength={4000}
          disabled={!selectedConversation}
          placeholder="Mesaj yazın"
          className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-border bg-slate-50 px-3 py-2.5 text-xs outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15 disabled:opacity-60"
          aria-label="Mesaj"
        />
        <button
          type="submit"
          disabled={!message.trim() || isPending || !selectedConversation}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Mesaj gönder"
        >
          <Send className="size-3.5" />
        </button>
      </form>
    </>
  );
}

function ChatDialog({
  type,
  users,
  isPending,
  channelName,
  channelDescription,
  channelVisibility,
  channelRole,
  selectedMembers,
  onClose,
  onStartDirect,
  onChannelNameChange,
  onChannelDescriptionChange,
  onChannelVisibilityChange,
  onChannelRoleChange,
  onSelectedMembersChange,
  onCreateChannel
}: {
  type: Exclude<DialogType, null>;
  users: SerializedChatWorkspace["users"];
  isPending: boolean;
  channelName: string;
  channelDescription: string;
  channelVisibility: ChannelVisibility;
  channelRole: Role;
  selectedMembers: string[];
  onClose: () => void;
  onStartDirect: (userId: string) => void;
  onChannelNameChange: (value: string) => void;
  onChannelDescriptionChange: (value: string) => void;
  onChannelVisibilityChange: (value: ChannelVisibility) => void;
  onChannelRoleChange: (value: Role) => void;
  onSelectedMembersChange: (value: string[]) => void;
  onCreateChannel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-dialog-title"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="chat-dialog-title" className="text-sm font-semibold text-ink">
              {type === "direct" ? "Yeni görüşme" : "Yeni kanal"}
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              {type === "direct"
                ? "Mesajlaşmak istediğiniz kişiyi seçin."
                : "Ekibiniz için ortak bir iletişim alanı açın."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-slate-100"
            aria-label="Pencereyi kapat"
          >
            <X className="size-4" />
          </button>
        </header>

        {type === "direct" ? (
          <div className="p-2">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={isPending}
                onClick={() => onStartDirect(user.id)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50 disabled:opacity-50"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-blue-50 text-[10px] font-semibold text-brand">
                  {initials(user.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-ink">
                    {user.name}
                  </span>
                  <span className="block truncate text-[10px] text-muted">
                    {roleLabels[user.role]} · {user.email}
                  </span>
                </span>
                <MessageCircle className="size-3.5 text-muted" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <label className="grid gap-1.5 text-xs font-medium text-ink">
              Kanal adı
              <input
                value={channelName}
                onChange={(event) => onChannelNameChange(event.target.value)}
                maxLength={80}
                placeholder="Örn. Operasyon gündemi"
                className="min-h-10 rounded-md border border-border bg-white px-3 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-medium text-ink">
              Açıklama
              <textarea
                value={channelDescription}
                onChange={(event) => onChannelDescriptionChange(event.target.value)}
                maxLength={240}
                rows={2}
                placeholder="Kanalın kullanım amacını yazın"
                className="resize-none rounded-md border border-border bg-white px-3 py-2 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>

            <fieldset>
              <legend className="mb-2 text-xs font-medium text-ink">Erişim</legend>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "company", label: "Tüm şirket", icon: Users },
                  { value: "unit", label: "Bir birim", icon: Hash },
                  { value: "private", label: "Davetliler", icon: LockKeyhole }
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onChannelVisibilityChange(option.value as ChannelVisibility)
                      }
                      className={cn(
                        "flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border p-2 text-[10px] font-medium transition",
                        channelVisibility === option.value
                          ? "border-brand bg-blue-50 text-brand"
                          : "border-border text-muted hover:bg-slate-50"
                      )}
                    >
                      <Icon className="size-3.5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {channelVisibility === "unit" ? (
              <label className="grid gap-1.5 text-xs font-medium text-ink">
                Birim
                <select
                  value={channelRole}
                  onChange={(event) => onChannelRoleChange(event.target.value as Role)}
                  className="min-h-10 rounded-md border border-border bg-white px-3 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                >
                  {unitRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {channelVisibility === "private" ? (
              <fieldset>
                <legend className="mb-2 text-xs font-medium text-ink">Katılımcılar</legend>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {users.map((user) => {
                    const selected = selectedMembers.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md p-2 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            onSelectedMembersChange(
                              selected
                                ? selectedMembers.filter((id) => id !== user.id)
                                : [...selectedMembers, user.id]
                            )
                          }
                          className="size-4 rounded border-border text-brand"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-semibold text-ink">
                            {user.name}
                          </span>
                          <span className="block text-[9px] text-muted">
                            {roleLabels[user.role]}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={onCreateChannel}
                disabled={isPending || channelName.trim().length < 2}
              >
                {isPending ? "Oluşturuluyor..." : "Kanalı oluştur"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
