import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function StartChatButton({ provider, service, className = "" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const startChatMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        base44.auth.redirectToLogin();
        return;
      }

      // Verifica se já existe conversa entre este cliente e prestador para este serviço
      const existing = await base44.entities.ChatConversation.filter({
        client_email: currentUser.email,
        provider_id: provider.id,
        ...(service?.id ? { service_id: service.id } : {}),
      });

      if (existing && existing.length > 0) {
        return existing[0];
      }

      // Cria nova conversa
      const conv = await base44.entities.ChatConversation.create({
        client_email: currentUser.email,
        client_name: currentUser.full_name || currentUser.email,
        provider_id: provider.id,
        provider_name: provider.full_name,
        service_id: service?.id || null,
        service_title: service?.title || null,
        last_message: null,
        last_message_at: new Date().toISOString(),
        unread_client: 0,
        unread_provider: 0,
        status: "active",
      });
      return conv;
    },
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
      navigate(createPageUrl("Chat") + `?conv=${conv.id}`);
    },
  });

  const handleClick = () => {
    if (!currentUser) {
      base44.auth.redirectToLogin();
      return;
    }
    startChatMutation.mutate();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={startChatMutation.isPending}
      variant="outline"
      className={`border-cyan-500 text-cyan-600 hover:bg-cyan-50 ${className}`}
    >
      {startChatMutation.isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4 mr-2" />
      )}
      Chat com Prestador
    </Button>
  );
}