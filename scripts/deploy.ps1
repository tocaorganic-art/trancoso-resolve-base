# deploy.ps1 — deploy do Trancoso Resolve (Windows PowerShell)
#Requires -Version 5.1
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host "  Trancoso Resolve — Deploy"
Write-Host "========================================"
Write-Host ""

# 1. Instalar dependências e build
Write-Host "[1/4] npm install..."
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install falhou" }

Write-Host "[2/4] npm run build..."
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build falhou" }
Write-Host "  OK dist/ gerado"

# 3. Deploy Vercel
Write-Host ""
Write-Host "[3/4] Deploy Vercel (frontend)..."
$vercelOk = $false
try {
    $null = npx vercel --version 2>&1
    $deployResult = npx vercel deploy --prod --yes 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK Vercel deploy concluido"
        $vercelOk = $true
    }
} catch {}

if (-not $vercelOk) {
    Write-Host "  AVISO Vercel deploy falhou. Passos manuais:"
    Write-Host "    1. npx vercel login"
    Write-Host "    2. npx vercel link   (primeira vez)"
    Write-Host "    3. npx vercel deploy --prod --yes"
    Write-Host "    (ou: push para 'main' dispara deploy automatico)"
}

# 4. Deploy Base44
Write-Host ""
Write-Host "[4/4] Deploy Base44 (functions + entities)..."
$base44Ok = $false
try {
    $null = npx base44 --version 2>&1
    $b44Result = npx base44 deploy --yes 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK Base44 deploy concluido"
        $base44Ok = $true
    }
} catch {}

if (-not $base44Ok) {
    Write-Host "  AVISO Base44 CLI nao disponivel. Deploy manual necessario:"
    Write-Host ""
    Write-Host "  Acesse app 68eb21726a9614db4a82ba99 no painel Base44:"
    Write-Host "  - Entities > New Entity > colar base44/entities/LogWhatsApp.jsonc"
    Write-Host "  - Functions > enviarMensagemWhatsApp > colar entry.ts"
    Write-Host "  - Functions > stripeWebhook > colar entry.ts atualizado"
}

# Resumo final
Write-Host ""
Write-Host "========================================"
Write-Host "  Passos manuais obrigatorios (1a vez)"
Write-Host "========================================"
Write-Host ""
Write-Host "  SECRETS (Vercel Dashboard)"
Write-Host "    WHATSAPP_PROVIDER=zapi (ou waba)"
Write-Host "    ZAPI_INSTANCE_ID, ZAPI_TOKEN"
Write-Host "    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET"
Write-Host ""
Write-Host "  WEBHOOK STRIPE"
Write-Host "    URL: https://trancosoresolve.com.br/api/functions/stripeWebhook"
Write-Host "    Eventos: checkout.session.completed, invoice.paid, etc."
Write-Host ""
Write-Host "  TESTE LOCAL"
Write-Host "    stripe listen --forward-to http://localhost:5173/api/functions/stripeWebhook"
Write-Host "    stripe trigger checkout.session.completed"
Write-Host ""
Write-Host "========================================"
Write-Host "  A gente resolve!"
Write-Host "========================================"
