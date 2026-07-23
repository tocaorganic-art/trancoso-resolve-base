#!/usr/bin/env bash
# deploy.sh — deploy do Trancoso Resolve (Linux/macOS)
set -euo pipefail

echo ""
echo "========================================"
echo "  Trancoso Resolve — Deploy"
echo "========================================"
echo ""

# 1. Instalar dependências e build
echo "[1/4] npm install..."
npm install

echo "[2/4] npm run build..."
npm run build
echo "  ✓ dist/ gerado"

# 3. Deploy Vercel
echo ""
echo "[3/4] Deploy Vercel (frontend)..."
if command -v vercel &>/dev/null || npx vercel --version &>/dev/null 2>&1; then
  if npx vercel deploy --prod --yes 2>&1; then
    echo "  ✓ Vercel deploy concluído"
  else
    echo "  ⚠ Vercel deploy falhou. Passos manuais:"
    echo "    1. npx vercel login"
    echo "    2. npx vercel link   (primeira vez)"
    echo "    3. npx vercel deploy --prod --yes"
    echo "    (ou: push para 'main' dispara deploy automático)"
  fi
else
  echo "  ⚠ Vercel CLI não encontrado. Instalando..."
  npm install -g vercel 2>/dev/null || true
  echo "    Rode: npx vercel login && npx vercel deploy --prod --yes"
fi

# 4. Deploy Base44
echo ""
echo "[4/4] Deploy Base44 (functions + entities)..."
if npx base44 --version &>/dev/null 2>&1; then
  if npx base44 deploy --yes 2>&1; then
    echo "  ✓ Base44 deploy concluído"
  else
    echo "  ⚠ Base44 deploy falhou. Passos manuais:"
    echo "    1. npx base44 login"
    echo "    2. npx base44 deploy --yes"
  fi
else
  echo "  ⚠ Base44 CLI não disponível. Deploy manual necessário:"
  echo ""
  echo "  Acesse app 68eb21726a9614db4a82ba99 no painel Base44:"
  echo "  • Entities → New Entity → colar base44/entities/LogWhatsApp.jsonc"
  echo "  • Functions → enviarMensagemWhatsApp → colar base44/functions/enviarMensagemWhatsApp/entry.ts"
  echo "  • Functions → stripeWebhook → colar base44/functions/stripeWebhook/entry.ts"
fi

# Resumo final
echo ""
echo "========================================"
echo "  Passos manuais obrigatórios (1ª vez)"
echo "========================================"
echo ""
echo "  SECRETS (Vercel Dashboard)"
echo "    WHATSAPP_PROVIDER=zapi (ou waba)"
echo "    ZAPI_INSTANCE_ID, ZAPI_TOKEN"
echo "    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET"
echo ""
echo "  WEBHOOK STRIPE"
echo "    URL: https://trancosoresolve.com.br/api/functions/stripeWebhook"
echo "    Eventos: checkout.session.completed, invoice.paid, etc."
echo ""
echo "  TESTE LOCAL"
echo "    stripe listen --forward-to http://localhost:5173/api/functions/stripeWebhook"
echo "    stripe trigger checkout.session.completed"
echo ""
echo "========================================"
echo "  A gente resolve! ✅"
echo "========================================"
