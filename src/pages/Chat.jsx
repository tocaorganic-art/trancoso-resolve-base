import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, ArrowLeft, CheckCheck } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { checkContactData } from "@/lib/contactFilter";
import { toast } from "sonner";
import { playMessageSound } from "@/components/chat/ChatNotificationSound";

function EmptyConversations() {
  const suggestions = ["Preciso de uma diarista", "Quero um eletricista", "Buscar cozinheiro particular"];
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <span className="text-5xl mb-4">💬</span>
      <h3 className="text-lg font-bold text-foreground mb-2">Olá! Sou o TryA</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
        Seu assistente para encontrar os melhores profissionais em Trancoso. Como posso ajudar hoje?
      </p>
      <Link to="/Assistentevirtual">
        <Button className="bg-orange-700 hover:bg-orange-800 text-white font-semibold mb-5 transition-all duration-200 active:scale-95 hover:scale-105">
          Iniciar Conversa
        </Button>
      </Link>
      <div className="space-y-2 w-full max-w-xs">
        {suggestions.map((s) => (
          <Link key={s} to={`/Assistentevirtual`}>
            <button className="w-full text-left text-sm px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100 transition-colors duration-150">
              {s} →
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ConversationList({ conversations, selectedId, onSelect, currentUser }) {
  if (!conversations || conversations.length === 0) {
    return <EmptyConversations />;
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => {
        const isClient = conv.client_email === currentUser?.email;
        const otherName = isClient ? conv.provider_name : conv.client_name;
        const unread = isClient ? conv.unread_client : conv.unread_provider;
        const isSelected = conv.id === selectedId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left p-4 hover:bg-muted transition-colors ${isSelected ? "bg-orange-50 border-l-4 border-brand-primary" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">
                {otherName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-foreground truncate">{otherName || "Usuário"}</p>
                  {unread > 0 && (
                    <Badge className="bg-brand-primary text-white text-xs ml-2 shrink-0">{unread}</Badge>
                  )}
                </div>
                {conv.service_title && (
                  <p className="text-xs text-orange-600 truncate">{conv.service_title}</p>
                )}
                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message || "Sem mensagens"}</p>
                {conv.last_message_at && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MessageBubbleChat({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? "bg-brand-primary text-white rounded-br-sm" : "bg-card border border-border text-foreground rounded-bl-sm"}`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className={`text-xs ${isOwn ? "text-orange-100" : "text-muted-foreground"}`}>
            {message.created_date ? format(new Date(message.created_date), "HH:mm") : ""}
          </span>
          {isOwn && <CheckCheck className={`w-3 h-3 ${message.read ? "text-orange-200" : "text-orange-300"}`} />}
        </div>
      </div>
    </div>
  );
}

function ChatWindow({ conversation, currentUser, onBack }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const isClient = conversation.client_email === currentUser?.email;
  const prevMessageCountRef = useRef(null);

  const { data: messages } = useQuery({
    queryKey: ["chatMessages", conversation.id],
    queryFn: () => base44.entities.ChatMessage.filter({ conversation_id: conversation.id }, "created_date", 100),
    refetchInterval: 3000,
  });

  // Som + toast quando chegam mensagens novas de outro usuário
  useEffect(() => {
    if (!messages) return;
    const prev = prevMessageCountRef.current;
    if (prev !== null && messages.length > prev) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.sender_email !== currentUser?.email) {
        playMessageSound();
        toast.info(`💬 Nova mensagem de ${lastMsg.sender_name || 'alguém'}`, {
          description: lastMsg.content?.substring(0, 80),
          duration: 4000,
        });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const msg = await base44.entities.ChatMessage.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email,
        sender_role: isClient ? "client" : "provider",
        content,
        read: false,
      });
      await base44.entities.ChatConversation.update(conversation.id, {
        last_message: content,
        last_message_at: new Date().toISOString(),
        unread_client: isClient ? 0 : (conversation.unread_client || 0) + 1,
        unread_provider: isClient ? (conversation.unread_provider || 0) + 1 : 0,
      });
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", conversation.id] });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
      setNewMessage("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const { blocked, reason } = checkContactData(newMessage.trim());
    if (blocked) {
      toast.warning(reason, { duration: 6000 });
      return;
    }
    sendMessageMutation.mutate(newMessage.trim());
  };

  const otherName = isClient ? conversation.provider_name : conversation.client_name;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
          {otherName?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-semibold text-foreground">{otherName || "Usuário"}</p>
          {conversation.service_title && (
            <p className="text-xs text-orange-600">{conversation.service_title}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted space-y-1">
        {!messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">Inicie a conversa!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubbleChat
              key={msg.id}
              message={msg}
              isOwn={msg.sender_email === currentUser?.email}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1"
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          className="bg-brand-primary hover:bg-orange-600 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const autoOpenConvId = urlParams.get("conv");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversations } = useQuery({
    queryKey: ["chatConversations"],
    queryFn: () => base44.entities.ChatConversation.list("-last_message_at", 50),
    refetchInterval: 5000,
  });

  // Auto-open conversation from URL param
  useEffect(() => {
    if (autoOpenConvId && conversations) {
      const conv = conversations.find((c) => c.id === autoOpenConvId);
      if (conv) setSelectedConversation(conv);
    }
  }, [autoOpenConvId, conversations]);

  const totalUnread = conversations?.reduce((sum, c) => {
    const isClient = c.client_email === currentUser?.email;
    return sum + (isClient ? (c.unread_client || 0) : (c.unread_provider || 0));
  }, 0) || 0;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-brand-primary mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Faça login para usar o chat</h2>
            <p className="text-muted-foreground mb-6">Você precisa estar logado para conversar com prestadores.</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="w-full bg-brand-primary hover:bg-orange-600">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-7 h-7 text-brand-primary" />
          <h1 className="text-2xl font-bold text-foreground">Minhas Conversas</h1>
          {totalUnread > 0 && (
            <Badge className="bg-brand-primary text-white">{totalUnread} nova{totalUnread > 1 ? "s" : ""}</Badge>
          )}
        </div>

        <Card className="border-none shadow-xl overflow-hidden" style={{ height: "70vh" }}>
          <div className="flex h-full">
            {/* Sidebar - Lista de conversas */}
            <div className={`w-full md:w-80 border-r flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}>
              <div className="p-4 border-b bg-muted">
                <p className="text-sm text-muted-foreground font-medium">
                  {conversations?.length || 0} conversa{conversations?.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                  currentUser={currentUser}
                />
              </div>
            </div>

            {/* Chat area */}
            <div className={`flex-1 ${!selectedConversation ? "hidden md:flex" : "flex"} flex-col`}>
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  currentUser={currentUser}
                  onBack={() => setSelectedConversation(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
                  <p className="font-medium text-muted-foreground">Selecione uma conversa</p>
                  <p className="text-sm mt-1">ou inicie um chat pelo perfil de um prestador</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}