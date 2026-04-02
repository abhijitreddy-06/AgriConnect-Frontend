import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock3, MessageCircle, Send, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatService } from "@/services/chat.service";
import { orderService } from "@/services/order.service";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
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

const FarmerChatThread = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const parsedOrderId = Number(orderId);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const { data: ordersResponse } = useQuery({
    queryKey: ["farmer-chat-orders"],
    queryFn: () => orderService.list({ page: 1, limit: 100 }),
  });

  const orders = ordersResponse?.orders ?? [];
  const activeOrder = useMemo(
    () => orders.find((order) => Number(order.id) === parsedOrderId) ?? null,
    [orders, parsedOrderId],
  );

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat-messages", parsedOrderId],
    queryFn: () => chatService.getMessages(parsedOrderId),
    enabled: Number.isFinite(parsedOrderId),
    staleTime: 2 * 1000,
    refetchInterval: Number.isFinite(parsedOrderId) ? 3 * 1000 : false,
  });

  const { data: chatInfo } = useQuery({
    queryKey: ["chat-info", parsedOrderId],
    queryFn: () => chatService.getChatInfo(parsedOrderId),
    enabled: Number.isFinite(parsedOrderId),
    staleTime: 10 * 1000,
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => chatService.sendMessage(parsedOrderId, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-messages", parsedOrderId] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    },
  });

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  if (!Number.isFinite(parsedOrderId)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 pt-24 pb-12">
          <div className="container max-w-4xl">
            <p className="text-muted-foreground">Invalid order id.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to={ROUTES.farmer.chats}>Back to Chats</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canSend = activeOrder?.status !== "cancelled";

  const sendMessage = async () => {
    if (!canSend) return;
    const trimmed = messageInput.trim();
    if (!trimmed) return;

    try {
      await sendMutation.mutateAsync(trimmed);
      setMessageInput("");
    } catch {
      // Error toast handled in mutation callbacks.
    }
  };

  const status = statusMap[activeOrder?.status ?? "pending"] ?? {
    label: activeOrder?.status ?? "pending",
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl">
          <section className="rounded-2xl border border-border bg-card h-[74vh] flex flex-col overflow-hidden">
            <header className="border-b border-border px-4 py-3 bg-muted/30">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Button asChild variant="ghost" size="sm" className="mb-1 px-1.5">
                    <Link to={ROUTES.farmer.chats}>
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back to chats
                    </Link>
                  </Button>
                  <h2 className="text-base font-semibold text-foreground truncate flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-accent" />
                    {activeOrder?.product_name || chatInfo?.productName || "Order Chat"}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    Chat with {chatInfo?.partnerName || activeOrder?.username || "Customer"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${status.className} capitalize`}>
                    {status.label}
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
                <p className="text-xs text-muted-foreground mb-2 inline-flex items-center gap-1">
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
              <div className="flex justify-end mt-1.5 text-[11px] text-muted-foreground">
                <span>{messageInput.length}/300</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerChatThread;
