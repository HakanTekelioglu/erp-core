"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  ArrowLeft,
  Check,
  Hash,
  Info,
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
  markConversationReadAction,
  sendChatMessageAction
} from "@/app/chat/actions";
import { Button } from "@/components/ui/button";
import { roleLabels } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  type: "DIRECT" | "CHANNEL";
  name: string;
  description: string;
  audienceRole: Role | null;
  isPrivate: boolean;
  unreadCount: number;
  memberCount: number;
  latestMessage: {
    body: string;
    senderName: string;
    createdAt: string;
  } | null;
};

type SelectedConversation = {
  id: string;
  type: "DIRECT" | "CHANNEL";
  name: string;
  description: string;
  audienceRole: Role | null;
  isPrivate: boolean;
  members: Array<{ id: string; name: string; email: string; role: Role }>;
} | null;

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: Role };
};

type ChatUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type ChatWorkspaceProps = {
  currentUser: { id: string; name: string; role: Role };
  conversations: Conversation[];
  selectedConversation: SelectedConversation;
  messages: Message[];
  users: ChatUser[];
};

const unitRoles: Role[] = ["SALES", "WAREHOUSE", "ACCOUNTING"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

function messageTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function conversationTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return messageTime(value);
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "İşlem tamamlanamadı";
}

export function ChatWorkspace({
  currentUser,
  conversations,
  selectedConversation,
  messages,
  users
}: ChatWorkspaceProps) {
  const router = useRouter();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState<"direct" | "channel" | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelVisibility, setChannelVisibility] = useState<"company" | "unit" | "private">("company");
  const [channelRole, setChannelRole] = useState<Role>("SALES");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");
    if (!query) return conversations;
    return conversations.filter((item) =>
      `${item.name} ${item.description}`.toLocaleLowerCase("tr-TR").includes(query)
    );
  }, [conversations, search]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, [messages, selectedConversation?.id]);

  useEffect(() => {
    if (!selectedConversation?.id) return;
    void markConversationReadAction(selectedConversation.id);
  }, [selectedConversation?.id, messages.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 8000);
    return () => window.clearInterval(interval);
  }, [router]);

  function openConversation(id: string) {
    router.push(`/chat?conversation=${encodeURIComponent(id)}`);
  }

  function startDirectMessage(userId: string) {
    startTransition(async () => {
      try {
        const result = await createDirectConversationAction(userId);
        setDialog(null);
        router.push(`/chat?conversation=${encodeURIComponent(result.id)}`);
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  function createChannel() {
    startTransition(async () => {
      try {
        const result = await createChannelAction({
          name: channelName,
          description: channelDescription,
          isPrivate: channelVisibility === "private",
          audienceRole: channelVisibility === "unit" ? channelRole : null,
          memberIds: selectedMembers
        });
        setDialog(null);
        setChannelName("");
        setChannelDescription("");
        setSelectedMembers([]);
        router.push(`/chat?conversation=${encodeURIComponent(result.id)}`);
        router.refresh();
        toast.success("Kanal oluşturuldu");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  function sendMessage() {
    const body = message.trim();
    if (!selectedConversation || !body) return;
    setMessage("");

    startTransition(async () => {
      try {
        await sendChatMessageAction(selectedConversation.id, body);
        router.refresh();
      } catch (error) {
        setMessage(body);
        toast.error(getErrorMessage(error));
      }
    });
  }

  const channelScope = selectedConversation
    ? selectedConversation.type === "DIRECT"
      ? roleLabels[selectedConversation.members.find((member) => member.id !== currentUser.id)?.role ?? currentUser.role]
      : selectedConversation.isPrivate
        ? `${selectedConversation.members.length} katılımcı`
        : selectedConversation.audienceRole
          ? `${roleLabels[selectedConversation.audienceRole]} birimi`
          : "Tüm şirket"
    : "";

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[38rem] overflow-hidden bg-white">
      <aside
        className={cn(
          "w-full shrink-0 flex-col border-r border-border bg-slate-50/60 md:flex md:w-[21rem]",
          selectedConversation ? "hidden md:flex" : "flex"
        )}
      >
        <div className="border-b border-border px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-ink">Mesajlar</h1>
              <p className="text-xs text-muted">Ekip iletişimi</p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setDialog("direct")}
                className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-white text-muted transition hover:text-brand"
                aria-label="Yeni birebir görüşme"
                title="Yeni birebir görüşme"
              >
                <MessageCircle className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setDialog("channel")}
                className="inline-flex size-9 items-center justify-center rounded-md bg-brand text-white transition hover:bg-blue-700"
                aria-label="Yeni kanal"
                title="Yeni kanal"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Konuşmalarda ara"
              aria-label="Konuşmalarda ara"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredConversations.map((conversation) => {
            const active = selectedConversation?.id === conversation.id;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => openConversation(conversation.id)}
                className={cn(
                  "mb-1 flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition",
                  active ? "bg-blue-50" : "hover:bg-slate-100"
                )}
              >
                <span
                  className={cn(
                    "relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                    conversation.type === "CHANNEL"
                      ? "bg-slate-200 text-slate-700"
                      : "rounded-full bg-brand/10 text-brand"
                  )}
                >
                  {conversation.type === "CHANNEL" ? (
                    conversation.isPrivate ? <LockKeyhole className="size-4" /> : <Hash className="size-4" />
                  ) : (
                    initials(conversation.name)
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{conversation.name}</span>
                    {conversation.latestMessage ? (
                      <span className="shrink-0 text-[11px] text-muted">
                        {conversationTime(conversation.latestMessage.createdAt)}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted">
                      {conversation.latestMessage
                        ? `${conversation.latestMessage.senderName}: ${conversation.latestMessage.body}`
                        : conversation.description}
                    </span>
                    {conversation.unreadCount > 0 ? (
                      <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })}
          {!filteredConversations.length ? (
            <div className="px-4 py-10 text-center text-sm text-muted">Eşleşen konuşma bulunamadı.</div>
          ) : null}
        </div>
      </aside>

      {selectedConversation ? (
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-3 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/chat")}
                className="inline-flex size-9 items-center justify-center rounded-md text-muted md:hidden"
                aria-label="Konuşmalara dön"
              >
                <ArrowLeft className="size-5" />
              </button>
              <span
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center bg-slate-100 text-sm font-semibold text-slate-700",
                  selectedConversation.type === "DIRECT" ? "rounded-full" : "rounded-lg"
                )}
              >
                {selectedConversation.type === "CHANNEL" ? <Hash className="size-4" /> : initials(selectedConversation.name)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-ink">{selectedConversation.name}</h2>
                <p className="truncate text-xs text-muted">{channelScope}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowDetails((value) => !value)}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-md text-muted transition hover:bg-slate-100 hover:text-ink",
                  showDetails && "bg-slate-100 text-ink"
                )}
                aria-label="Görüşme detayları"
              >
                <Info className="size-4" />
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-5 md:px-7">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-7 flex justify-center">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-muted">
                      Görüşme başlangıcı
                    </span>
                  </div>
                  {!messages.length ? (
                    <div className="mx-auto max-w-sm py-12 text-center">
                      <span className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-blue-50 text-brand">
                        <MessageCircle className="size-6" />
                      </span>
                      <h3 className="text-base font-semibold text-ink">İlk mesajı siz gönderin</h3>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {selectedConversation.type === "CHANNEL"
                          ? "Bu kanalda henüz bir mesaj yok."
                          : `${selectedConversation.name} ile görüşmeniz burada başlayacak.`}
                      </p>
                    </div>
                  ) : null}
                  <div className="space-y-5">
                    {messages.map((item, index) => {
                      const own = item.sender.id === currentUser.id;
                      const previous = messages[index - 1];
                      const grouped =
                        previous?.sender.id === item.sender.id &&
                        new Date(item.createdAt).getTime() - new Date(previous.createdAt).getTime() < 5 * 60 * 1000;
                      return (
                        <div
                          key={item.id}
                          className={cn("flex items-end gap-2.5", own && "flex-row-reverse", grouped && "-mt-3")}
                        >
                          {grouped ? (
                            <span className="size-8 shrink-0" />
                          ) : (
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                              {initials(item.sender.name)}
                            </span>
                          )}
                          <div className={cn("max-w-[78%]", own && "text-right")}>
                            {!grouped ? (
                              <div className={cn("mb-1 flex items-center gap-2", own && "justify-end")}>
                                <span className="text-xs font-semibold text-ink">
                                  {own ? "Siz" : item.sender.name}
                                </span>
                                <span className="text-[10px] text-muted">{roleLabels[item.sender.role]}</span>
                              </div>
                            ) : null}
                            <div
                              className={cn(
                                "inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-left text-sm leading-5",
                                own
                                  ? "rounded-br-md bg-brand text-white"
                                  : "rounded-bl-md bg-slate-100 text-ink"
                              )}
                            >
                              {item.body}
                            </div>
                            <div className={cn("mt-1 flex items-center gap-1 text-[10px] text-muted", own && "justify-end")}>
                              {messageTime(item.createdAt)}
                              {own ? <Check className="size-3" /> : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div ref={messageEndRef} />
                </div>
              </div>

              <div className="shrink-0 border-t border-border px-3 py-3 md:px-6 md:py-4">
                <form
                  className="mx-auto flex max-w-3xl items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                  }}
                >
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      rows={1}
                      maxLength={4000}
                      placeholder={`${selectedConversation.name} için mesaj yazın`}
                      className="max-h-32 min-h-11 w-full resize-none rounded-lg border border-border bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
                      aria-label="Mesaj"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!message.trim() || isPending}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Mesaj gönder"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </div>

            {showDetails ? (
              <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-border bg-slate-50/60 p-5 lg:block">
                <div className="mb-6 text-center">
                  <span className="mx-auto mb-3 inline-flex size-14 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-brand">
                    {selectedConversation.type === "CHANNEL" ? <Hash className="size-6" /> : initials(selectedConversation.name)}
                  </span>
                  <h3 className="font-semibold text-ink">{selectedConversation.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {selectedConversation.description || channelScope}
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Katılımcılar</h4>
                    <span className="text-xs text-muted">{selectedConversation.members.length}</span>
                  </div>
                  <div className="space-y-2">
                    {selectedConversation.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2.5 rounded-md bg-white p-2">
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {initials(member.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-ink">{member.name}</p>
                          <p className="truncate text-[10px] text-muted">{roleLabels[member.role]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="hidden flex-1 items-center justify-center bg-slate-50/40 p-8 md:flex">
          <div className="max-w-sm text-center">
            <span className="mx-auto mb-5 inline-flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-brand">
              <MessageCircle className="size-8" />
            </span>
            <h2 className="text-xl font-bold text-ink">İletişim merkezi</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Bir ekip arkadaşınızla görüşme başlatın veya ortak bir kanal oluşturun.
            </p>
          </div>
        </section>
      )}

      {dialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="presentation">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-dialog-title"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 id="chat-dialog-title" className="font-semibold text-ink">
                  {dialog === "direct" ? "Yeni görüşme" : "Yeni kanal oluştur"}
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {dialog === "direct" ? "Mesajlaşmak istediğiniz kişiyi seçin." : "Ekibiniz için ortak bir alan açın."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="inline-flex size-9 items-center justify-center rounded-md text-muted hover:bg-slate-100"
                aria-label="Pencereyi kapat"
              >
                <X className="size-4" />
              </button>
            </div>

            {dialog === "direct" ? (
              <div className="p-3">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => startDirectMessage(user.id)}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-brand">
                      {initials(user.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {roleLabels[user.role]} · {user.email}
                      </span>
                    </span>
                    <MessageCircle className="size-4 text-muted" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-5 p-5">
                <label className="grid gap-1.5 text-sm font-medium text-ink">
                  Kanal adı
                  <input
                    value={channelName}
                    onChange={(event) => setChannelName(event.target.value)}
                    maxLength={80}
                    placeholder="Örn. Operasyon gündemi"
                    className="min-h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-ink">
                  Açıklama <span className="text-xs font-normal text-muted">(isteğe bağlı)</span>
                  <textarea
                    value={channelDescription}
                    onChange={(event) => setChannelDescription(event.target.value)}
                    maxLength={240}
                    rows={2}
                    placeholder="Kanalın hangi amaçla kullanılacağını yazın"
                    className="resize-none rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </label>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-ink">Kimler erişebilir?</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
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
                          onClick={() => setChannelVisibility(option.value as typeof channelVisibility)}
                          className={cn(
                            "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition",
                            channelVisibility === option.value
                              ? "border-brand bg-blue-50 text-brand"
                              : "border-border text-muted hover:bg-slate-50"
                          )}
                        >
                          <Icon className="size-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {channelVisibility === "unit" ? (
                  <label className="grid gap-1.5 text-sm font-medium text-ink">
                    Birim
                    <select
                      value={channelRole}
                      onChange={(event) => setChannelRole(event.target.value as Role)}
                      className="min-h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
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
                    <legend className="mb-2 text-sm font-medium text-ink">Katılımcılar</legend>
                    <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                      {users.map((user) => {
                        const checked = selectedMembers.includes(user.id);
                        return (
                          <label
                            key={user.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setSelectedMembers((current) =>
                                  checked ? current.filter((id) => id !== user.id) : [...current, user.id]
                                )
                              }
                              className="size-4 rounded border-border text-brand"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold text-ink">{user.name}</span>
                              <span className="block text-[10px] text-muted">{roleLabels[user.role]}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ) : null}

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <Button type="button" variant="secondary" onClick={() => setDialog(null)}>
                    Vazgeç
                  </Button>
                  <Button type="button" onClick={createChannel} disabled={isPending || channelName.trim().length < 2}>
                    {isPending ? "Oluşturuluyor..." : "Kanalı oluştur"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
