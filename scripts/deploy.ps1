# deploy.ps1 — build ou deploy isolado do Trancoso Resolve (Windows PowerShell)
#Requires -Version 5.1
param(
    [ValidateSet('build', 'vercel', 'base44')]
    [string]$Target = 'build'
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host "  Trancoso Resolve — $Target"
Write-Host "========================================"
Write-Host ""

# Instalação determinística e build comum a todos os alvos
Write-Host "[1/2] npm ci..."
npm ci
if ($LASTEXITCODE -ne 0) { throw "npm ci falhou" }

Write-Host "[2/2] npm run build..."
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build falhou" }
Write-Host "  OK dist/ gerado"

switch ($Target) {
    'build' {
        Write-Host "Build concluido; nenhum deploy foi executado."
    }
    'vercel' {
        npx vercel deploy --prod --yes
        if ($LASTEXITCODE -ne 0) { throw "Deploy Vercel falhou" }
        Write-Host "Deploy Vercel concluido."
    }
    'base44' {
        npx base44 deploy --yes
        if ($LASTEXITCODE -ne 0) { throw "Deploy Base44 falhou" }
        Write-Host "Deploy Base44 concluido."
    }
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
Write-Host "    (secrets de pagamento Asaas ficam apenas nas functions do Base44)"
Write-Host ""
Write-Host "  WEBHOOK ASAAS"
Write-Host "    URL: https://trancosoresolve.com.br/api/functions/asaasWebhook"
Write-Host "    Token: ASAAS_WEBHOOK_TOKEN (header asaas-access-token)"
Write-Host ""
Write-Host "  TESTE LOCAL"
Write-Host "    Sandbox do Asaas apontando para o servidor local (ver base44/functions/asaasWebhook/entry.ts)"
Write-Host ""
Write-Host "========================================"
Write-Host "  A gente resolve!"
Write-Host "========================================"
