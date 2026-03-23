"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  MessageSquare,
  MessageSquarePlus,
  X,
  ArrowLeft,
  Send,
  Loader2,
  Building2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

function timeAgo(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  const { data: me } = api.user.me.useQuery();
  const canChat = me?.role === "admin" || me?.isActiveTenant === true;
  const { data: conversations, isLoading: isLoadingConversations } =
    api.messages.listConversations.useQuery(undefined, {
      refetchInterval: 10000,
      enabled: canChat,
    });
  const { data: messageableUsers } = api.messages.listMessageableUsers.useQuery(
    undefined,
    {
      enabled: canChat,
    },
  );
  const { data: messagesData, isLoading: isLoadingMessages } =
    api.messages.listMessages.useQuery(
      { conversationId: selectedConversationId! },
      {
        enabled: selectedConversationId !== null,
        refetchInterval: 5000,
      },
    );

  const createConversation = api.messages.getOrCreateConversation.useMutation({
    onSuccess: (data) => {
      setSelectedConversationId(data.conversationId);
      setShowNewDialog(false);
      void utils.messages.listConversations.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create conversation: ${error.message}`);
    },
  });

  const sendMessage = api.messages.sendMessage.useMutation({
    onSuccess: async () => {
      if (selectedConversationId) {
        await utils.messages.listMessages.invalidate({
          conversationId: selectedConversationId,
        });
        await utils.messages.listConversations.invalidate();
      }
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const markAsRead = api.messages.markAsRead.useMutation({
    onSuccess: () => {
      void utils.messages.listConversations.invalidate();
    },
  });

  const messageCount = messagesData?.items.length ?? 0;
  const messages = messagesData?.items ?? [];
  const totalUnread =
    conversations?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
  const selectedConversation = conversations?.find(
    (c) => c.id === selectedConversationId,
  );
  const otherUserName =
    selectedConversation?.otherUser?.fullName ??
    selectedConversation?.otherUser?.email ??
    "Unknown";

  // Group conversations by property
  const groupedConversations = (() => {
    if (!conversations) return [];
    const groups: Record<
      string,
      { propertyName: string; conversations: typeof conversations }
    > = {};
    for (const conv of conversations) {
      const key = conv.propertyName ?? "__none__";
      groups[key] ??= {
        propertyName: conv.propertyName ?? "Other",
        conversations: [],
      };
      groups[key].conversations.push(conv);
    }
    // Sort groups: named properties first (alphabetically), then "Other"
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "__none__") return 1;
      if (b === "__none__") return -1;
      return a.localeCompare(b);
    });
  })();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageCount]);

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    markAsRead.mutate({ conversationId: id });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && selectedConversationId) {
      sendMessage.mutate({
        conversationId: selectedConversationId,
        content: input.trim(),
      });
      setInput("");
    }
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    setInput("");
  };

  // Group messageable users by property for the new conversation dialog
  const groupedUsers = (() => {
    if (!messageableUsers) return [];
    const groups: Record<
      string,
      { propertyName: string; users: typeof messageableUsers }
    > = {};
    for (const user of messageableUsers) {
      const key = user.propertyName ?? "__none__";
      groups[key] ??= {
        propertyName: user.propertyName ?? "Other",
        users: [],
      };
      groups[key].users.push(user);
    }
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "__none__") return 1;
      if (b === "__none__") return -1;
      return a.localeCompare(b);
    });
  })();

  // Hide widget entirely for non-tenant/non-admin users
  if (!canChat) return null;

  return (
    <>
      {/* Floating chat panel */}
      {isOpen && (
        <div className="bg-background fixed right-6 bottom-20 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border shadow-2xl">
          {selectedConversationId ? (
            /* Thread View */
            <>
              <div className="flex items-center gap-2 border-b px-3 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {otherUserName[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {otherUserName}
                  </p>
                  {selectedConversation?.propertyName && (
                    <p className="text-muted-foreground truncate text-[11px]">
                      {selectedConversation.propertyName}
                    </p>
                  )}
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3">
                {isLoadingMessages ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                      >
                        <Skeleton className="h-9 w-40 rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <MessageSquare className="text-muted-foreground/30 h-8 w-8" />
                    <p className="text-muted-foreground mt-2 text-xs">
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === (me?.id ?? 0);
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            <p
                              className={`mt-0.5 text-[10px] ${
                                isOwn
                                  ? "text-primary-foreground/60"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString(
                                "en-AU",
                                { hour: "numeric", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="border-t p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-muted flex-1 rounded-full px-3 py-2 text-sm outline-none"
                    disabled={sendMessage.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    disabled={!input.trim() || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            /* Inbox View */
            <>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Messages</h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowNewDialog(true)}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoadingConversations ? (
                  <div className="space-y-1 p-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl p-3"
                      >
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (conversations ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                    <MessageSquare className="text-muted-foreground/30 h-8 w-8" />
                    <p className="text-muted-foreground mt-3 text-sm">
                      No conversations yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setShowNewDialog(true)}
                    >
                      Start a conversation
                    </Button>
                  </div>
                ) : (
                  <div className="p-2">
                    {groupedConversations.map(([key, group]) => (
                      <div key={key}>
                        <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
                          <Building2 className="text-muted-foreground h-3 w-3" />
                          <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                            {group.propertyName}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          {group.conversations.map((conv) => (
                            <button
                              key={conv.id}
                              type="button"
                              onClick={() => handleSelectConversation(conv.id)}
                              className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors"
                            >
                              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                {conv.otherUser?.fullName?.[0]?.toUpperCase() ??
                                  conv.otherUser?.email[0]?.toUpperCase() ??
                                  "?"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p
                                    className={`truncate text-sm ${conv.unreadCount > 0 ? "font-semibold" : "font-medium"}`}
                                  >
                                    {conv.otherUser?.fullName ??
                                      conv.otherUser?.email ??
                                      "Unknown"}
                                  </p>
                                  {conv.lastMessage && (
                                    <span className="text-muted-foreground shrink-0 text-[11px]">
                                      {timeAgo(conv.lastMessage.createdAt)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`truncate text-xs ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                                  >
                                    {conv.lastMessage
                                      ? conv.lastMessage.isOwn
                                        ? `You: ${conv.lastMessage.content}`
                                        : conv.lastMessage.content
                                      : "No messages yet"}
                                  </p>
                                  {conv.unreadCount > 0 && (
                                    <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold">
                                      {conv.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary/50 text-primary-foreground hover:bg-primary/90 fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-sm">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </>
        )}
      </button>

      {/* New conversation dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Start a conversation with someone.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {(messageableUsers ?? []).length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No users available to message.
              </p>
            ) : (
              groupedUsers.map(([key, group]) => (
                <div key={key}>
                  <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
                    <Building2 className="text-muted-foreground h-3 w-3" />
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                      {group.propertyName}
                    </p>
                  </div>
                  {group.users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() =>
                        createConversation.mutate({ targetUserId: user.id })
                      }
                      disabled={createConversation.isPending}
                      className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors disabled:opacity-50"
                    >
                      <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium">
                        {user.fullName?.[0]?.toUpperCase() ??
                          user.email[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {user.fullName ?? user.email}
                        </p>
                        {user.fullName && (
                          <p className="text-muted-foreground truncate text-xs">
                            {user.email}
                          </p>
                        )}
                      </div>
                      {createConversation.isPending && (
                        <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
