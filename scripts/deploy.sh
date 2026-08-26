#!/usr/bin/env bash
# deploy.sh — build ou deploy isolado do Trancoso Resolve (Linux/macOS)
set -euo pipefail
TARGET="${1:-build}"
case "$TARGET" in
  build|vercel|base44) ;;
  *) echo "Uso: $0 [build|vercel|base44]"; exit 2 ;;
esac

echo ""
echo "========================================"
echo "  Trancoso Resolve — $TARGET"
echo "========================================"
echo ""

# Instalação determinística e build comum a todos os alvos
echo "[1/2] npm ci..."
npm ci

echo "[2/2] npm run build..."
npm run build
echo "  ✓ dist/ gerado"

case "$TARGET" in
  build)
    echo "Build concluído; nenhum deploy foi executado."
    ;;
  vercel)
    npx vercel deploy --prod --yes
    echo "Deploy Vercel concluído."
    ;;
  base44)
    npx base44 deploy --yes
    echo "Deploy Base44 concluído."
    ;;
esac
