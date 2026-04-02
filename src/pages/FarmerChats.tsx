import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, MessageCircle, PackageCheck, Search, Send, User } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatService, type ChatInfo, type ChatMessage } from "@/services/chat.service";
import { orderService } from "@/services/order.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  accepted: { label: "Accepted", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  shipped: { label: "Shipped", className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  delivered: { label: "Delivered", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const FarmerChats = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const { data: ordersResponse, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["farmer-chat-orders"],
    queryFn: () => orderService.list({ page: 1, limit: 100 }),
  });

  const orders = ordersResponse?.orders ?? [];

  useEffect(() => {
    if (!activeOrderId && orders.length > 0) {
      setActiveOrderId(Number(orders[0].id));
    }
  }, [orders, activeOrderId]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => {
      const productName = String(order.product_name || "").toLowerCase();
      const customerName = String(order.username || "").toLowerCase();
      return productName.includes(term) || customerName.includes(term) || String(order.id).includes(term);
    });
  }, [orders, search]);

  const activeOrder = orders.find((order) => Number(order.id) === activeOrderId) ?? null;

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", activeOrderId],
    queryFn: () => chatService.getMessages(Number(activeOrderId)),
    enabled: Boolean(activeOrderId),
    staleTime: 2 * 1000,
    refetchInterval: activeOrderId ? 3 * 1000 : false,
  });

  const { data: chatInfo } = useQuery<ChatInfo | null>({
    queryKey: ["chat-info", activeOrderId],
    queryFn: () => chatService.getChatInfo(Number(activeOrderId)),
    enabled: Boolean(activeOrderId),
    staleTime: 10 * 1000,
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => chatService.sendMessage(Number(activeOrderId), message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-messages", activeOrderId] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    },
  });

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, activeOrderId]);

  const canSend = activeOrder?.status !== "cancelled";

  const sendMessage = async () => {
    if (!activeOrderId || !canSend) return;
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    try {
      await sendMutation.mutateAsync(trimmed);
      setMessageInput("");
    } catch {
      // Error feedback is handled in mutation callback.
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-7xl space-y-6">
          <section>
            <h1 className="text-3xl font-display font-bold text-foreground">Chats</h1>
            <p className="text-muted-foreground mt-1">Talk to customers for each order and keep updates in one place.</p>
          </section>

          <section className="grid lg:grid-cols-[320px_1fr] gap-4">
            <aside className="rounded-2xl border border-border bg-card overflow-hidden h-[70vh] lg:h-[72vh] flex flex-col">
              <div className="p-3 border-b border-border bg-muted/30">
                <div className="relative">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by product or customer"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="overflow-y-auto p-2 space-y-2">
                {isLoadingOrders && <p className="px-2 py-4 text-sm text-muted-foreground">Loading conversations...</p>}

                {!isLoadingOrders && filteredOrders.length === 0 && (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">No order chats found.</div>
                )}

                {filteredOrders.map((order) => {
                  const isActive = Number(order.id) === activeOrderId;
                  const status = statusMap[order.status] ?? {
                    label: order.status,
                    className: "bg-muted text-muted-foreground border-border",
                  };

                  return (
                    <button
                      type="button"
                      key={order.id}
                      onClick={() => setActiveOrderId(Number(order.id))}
                      className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${
                        isActive
                          ? "border-primary/50 bg-primary/10"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{order.product_name || "Product"}</p>
                        <Badge variant="outline" className={`${status.className} text-[10px]`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">Customer: {order.username || "Customer"}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Order #{order.id}</p>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="rounded-2xl border border-border bg-card h-[70vh] lg:h-[72vh] flex flex-col overflow-hidden">
              {!activeOrder && (
                <div className="h-full flex items-center justify-center text-muted-foreground px-4 text-center">
                  Select an order chat from the left panel.
                </div>
              )}

              {activeOrder && (
                <>
                  <header className="border-b border-border px-4 py-3 bg-muted/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-foreground truncate flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-accent" />
                          {activeOrder.product_name || "Order Chat"}
                        </h2>
                        <p className="text-xs text-muted-foreground truncate">Chat with {chatInfo?.partnerName || activeOrder.username || "Customer"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={(statusMap[activeOrder.status]?.className ?? "bg-muted text-muted-foreground border-border") + " capitalize"}
                        >
                          {statusMap[activeOrder.status]?.label ?? activeOrder.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline-flex">Updates every 3s</span>
                      </div>
                    </div>
                  </header>

                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
                    {isLoadingMessages && <p className="text-sm text-muted-foreground">Loading chat...</p>}

                    {!isLoadingMessages && messages.length === 0 && (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-4">
                        No messages yet. Start the conversation.
                      </div>
                    )}

                    {messages.map((item) => {
                      const isMine = Number(item.sender_id) === Number(user?.id);
                      return (
                        <div key={item.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[82%] rounded-2xl border px-3 py-2 ${
                              isMine
                                ? "bg-accent text-accent-foreground border-accent/30"
                                : "bg-card text-foreground border-border"
                            }`}
                          >
                            {!isMine && (
                              <p className="text-[11px] font-medium opacity-80 mb-1 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.sender_name || item.sender_role}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>
                            <p className={`text-[10px] mt-1 ${isMine ? "text-accent-foreground/80" : "text-muted-foreground"}`}>
                              {formatTime(item.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border p-3 bg-card/90">
                    {!canSend && (
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        Chat is disabled for cancelled orders.
                      </p>
                    )}
                    <div className="flex items-end gap-2">
                      <Textarea
                        value={messageInput}
                        onChange={(event) => setMessageInput(event.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[48px] max-h-32"
                        maxLength={300}
                        disabled={!canSend || sendMutation.isPending}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            void sendMessage();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        className="h-12 px-4"
                        onClick={() => {
                          void sendMessage();
                        }}
                        disabled={!canSend || !messageInput.trim() || sendMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-1" /> Send
                      </Button>
                    </div>
                    <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><PackageCheck className="h-3.5 w-3.5" /> Order #{activeOrder.id}</span>
                      <span>{messageInput.length}/300</span>
                    </div>
                  </div>
                </>
              )}
            </section>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerChats;