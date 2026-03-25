import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Send, Wifi, WifiOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatService, type ChatMessage } from "@/services/chat.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface OrderChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
  productName?: string;
  fallbackPartnerName?: string;
}

const statusBadgeClass: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  accepted: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
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

const OrderChatDialog = ({ open, onOpenChange, orderId, productName, fallbackPartnerName }: OrderChatDialogProps) => {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const { data: history = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat-messages", orderId],
    queryFn: () => chatService.getMessages(Number(orderId)),
    enabled: open && Boolean(orderId),
    staleTime: 10 * 1000,
  });

  const { data: chatInfo, isLoading: isLoadingInfo } = useQuery({
    queryKey: ["chat-info", orderId],
    queryFn: () => chatService.getChatInfo(Number(orderId)),
    enabled: open && Boolean(orderId),
    staleTime: 10 * 1000,
  });

  useEffect(() => {
    setLiveMessages(history);
  }, [history]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [liveMessages, open]);

  useEffect(() => {
    if (!open || !orderId) return;

    const socket = chatService.getSocket();

    const onConnect = () => {
      setSocketConnected(true);
      socket.emit("join_order", orderId);
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      setPartnerTyping(false);
    };

    const onNewMessage = (incoming: ChatMessage) => {
      if (Number(incoming.order_id) !== Number(orderId)) return;
      setLiveMessages((prev) => {
        if (prev.some((item) => Number(item.id) === Number(incoming.id))) return prev;
        return [...prev, incoming];
      });
    };

    const onChatError = (message: string) => {
      if (message) toast.error(message);
    };

    const onTyping = (payload: { orderId: number; userId: number; active: boolean }) => {
      if (Number(payload.orderId) !== Number(orderId)) return;
      if (Number(payload.userId) === Number(user?.id)) return;
      setPartnerTyping(Boolean(payload.active));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("chat_error", onChatError);
    socket.on("typing", onTyping);

    if (!socket.connected) {
      socket.connect();
    } else {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("chat_error", onChatError);
      socket.off("typing", onTyping);
      socket.emit("typing_stop", { orderId });
    };
  }, [open, orderId, user?.id]);

  const canSend = useMemo(() => {
    if (!chatInfo) return false;
    return chatInfo.status !== "cancelled";
  }, [chatInfo]);

  const handleTyping = (nextValue: string) => {
    setMessageInput(nextValue);
    if (!orderId) return;

    const socket = chatService.getSocket();
    if (!socket.connected) return;

    socket.emit("typing_start", { orderId });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("typing_stop", { orderId });
    }, 900);
  };

  const sendMessage = () => {
    if (!orderId || !canSend) return;
    const trimmed = messageInput.trim();
    if (!trimmed) return;

    const socket = chatService.getSocket();
    if (!socket.connected) {
      toast.error("Realtime connection is not ready. Please try again.");
      return;
    }

    socket.emit("send_message", { orderId, message: trimmed });
    socket.emit("typing_stop", { orderId });
    setMessageInput("");
  };

  const title = productName || chatInfo?.productName || "Order Chat";
  const partnerName = chatInfo?.partnerName || fallbackPartnerName || "Partner";
  const status = chatInfo?.status || "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="truncate flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4 text-accent" />
                {title}
              </DialogTitle>
              <DialogDescription className="truncate">Chat with {partnerName}</DialogDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={statusBadgeClass[status] || ""}>{status}</Badge>
              <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
                {socketConnected ? <Wifi className="h-3.5 w-3.5 text-emerald-600" /> : <WifiOff className="h-3.5 w-3.5 text-amber-600" />}
                {socketConnected ? "Live" : "Reconnecting"}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="h-[420px] flex flex-col">
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
            {(isLoadingMessages || isLoadingInfo) && (
              <p className="text-sm text-muted-foreground">Loading chat...</p>
            )}

            {!isLoadingMessages && liveMessages.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No messages yet. Start the conversation.
              </div>
            )}

            {liveMessages.map((item) => {
              const isMine = Number(item.sender_id) === Number(user?.id);
              return (
                <div key={item.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 border ${isMine ? "bg-accent text-accent-foreground border-accent/30" : "bg-card text-foreground border-border"}`}>
                    {!isMine && <p className="text-[11px] font-medium opacity-80 mb-1">{item.sender_name || item.sender_role}</p>}
                    <p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-accent-foreground/80" : "text-muted-foreground"}`}>{formatTime(item.created_at)}</p>
                  </div>
                </div>
              );
            })}

            {partnerTyping && (
              <p className="text-xs text-muted-foreground italic">{partnerName} is typing...</p>
            )}
          </div>

          <div className="border-t border-border p-3 bg-card/90">
            {!canSend && (
              <p className="text-xs text-muted-foreground mb-2">Chat is disabled for cancelled orders.</p>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                value={messageInput}
                onChange={(event) => handleTyping(event.target.value)}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-32"
                maxLength={300}
                disabled={!canSend}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button type="button" className="h-11 bg-accent hover:bg-accent/90" onClick={sendMessage} disabled={!canSend || !messageInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{messageInput.length}/300</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderChatDialog;
