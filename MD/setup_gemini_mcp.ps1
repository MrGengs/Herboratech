# ============================================================
# HerboraTech — Setup Gemini MCP untuk Claude Desktop
# Jalankan dengan: klik kanan → "Run with PowerShell"
# ============================================================

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  HerboraTech — Setup Gemini 2.5 Flash MCP" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# --- Minta API Key secara aman ---
$apiKey = Read-Host "Masukkan Gemini API Key Anda (dari aistudio.google.com/apikey)" -AsSecureString
$apiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)
)

if ([string]::IsNullOrWhiteSpace($apiKeyPlain)) {
    Write-Host "API Key tidak boleh kosong. Batalkan." -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}

# --- Lokasi config Claude Desktop ---
$configDir  = "$env:APPDATA\Claude"
$configFile = "$configDir\claude_desktop_config.json"

# Buat folder jika belum ada
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Host "Folder Claude config dibuat: $configDir" -ForegroundColor Yellow
}

# --- Baca config lama jika ada ---
$config = @{ mcpServers = @{} }

if (Test-Path $configFile) {
    Write-Host "Config lama ditemukan, akan digabung..." -ForegroundColor Yellow
    try {
        $existing = Get-Content $configFile -Raw | ConvertFrom-Json
        # Konversi ke hashtable agar bisa dimodifikasi
        $config = $existing | ConvertTo-Json -Depth 10 | ConvertFrom-Json -AsHashtable
        if (-not $config.ContainsKey("mcpServers")) {
            $config["mcpServers"] = @{}
        }
    } catch {
        Write-Host "Config lama tidak valid, akan dibuat ulang." -ForegroundColor Yellow
        $config = @{ mcpServers = @{} }
    }
}

# --- Tambahkan / Update entri Gemini ---
$config["mcpServers"]["gemini"] = @{
    command = "npx"
    args    = @("-y", "github:aliargun/mcp-server-gemini")
    env     = @{
        GEMINI_API_KEY       = $apiKeyPlain
        GOOGLE_GEMINI_MODEL  = "gemini-2.5-flash"
    }
}

# --- Tulis config baru ---
$jsonOutput = $config | ConvertTo-Json -Depth 10
Set-Content -Path $configFile -Value $jsonOutput -Encoding UTF8

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "  BERHASIL! Config disimpan ke:" -ForegroundColor Green
Write-Host "  $configFile" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host "  1. Tutup Claude Desktop sepenuhnya" -ForegroundColor White
Write-Host "  2. Buka kembali Claude Desktop" -ForegroundColor White
Write-Host "  3. Gemini 2.5 Flash siap digunakan!" -ForegroundColor White
Write-Host ""

Read-Host "Tekan Enter untuk keluar"
