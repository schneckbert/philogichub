# Philogic-Hub – Prisma Setup
# Installiert Prisma, generiert Client, erstellt Datenbank-Schema

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Prisma Setup fuer Philogic-Hub  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Prisma Dependencies installieren
Write-Host "[1/4] Installiere Prisma..." -ForegroundColor Yellow
npm install @prisma/client
npm install -D prisma

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Installieren von Prisma!" -ForegroundColor Red
    exit 1
}

Write-Host "Prisma installiert." -ForegroundColor Green
Write-Host ""

# 2. .env Datei erstellen (falls nicht vorhanden)
Write-Host "[2/4] Erstelle .env Datei..." -ForegroundColor Yellow
$envFile = ".env"
if (!(Test-Path $envFile)) {
    @"
# Philogic-Hub Environment Variables

# Database Connection
# Waehle eine deiner verfuegbaren Postgres-URIs:
# - postgres_uri (main)
# - postgres_local_harf_uri (local dev)
# - postgres_harf_uri (SWBB Harf)
# - postgres_favjob_uri (SWBB Favjob)

DATABASE_URL="postgresql://user:password@localhost:5432/philogichub?schema=public"

# NextAuth Secret (spaeter fuer Auth)
NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host ".env Datei erstellt." -ForegroundColor Green
    Write-Host "WICHTIG: Trage deine DATABASE_URL in .env ein!" -ForegroundColor Yellow
} else {
    Write-Host ".env existiert bereits." -ForegroundColor Green
}
Write-Host ""

# 3. Prisma Client generieren
Write-Host "[3/4] Generiere Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Generieren des Prisma Client!" -ForegroundColor Red
    exit 1
}

Write-Host "Prisma Client generiert." -ForegroundColor Green
Write-Host ""

# 4. Info zur Migration
Write-Host "[4/4] Migration-Info" -ForegroundColor Yellow
Write-Host "Das Schema wurde erstellt, aber noch NICHT in die Datenbank migriert." -ForegroundColor Cyan
Write-Host ""
Write-Host "Naechste Schritte:" -ForegroundColor White
Write-Host "1. Trage deine DATABASE_URL in .env ein" -ForegroundColor White
Write-Host "2. Fuehre aus: npx prisma migrate dev --name init" -ForegroundColor White
Write-Host "   (Erstellt Datenbank-Tabellen)" -ForegroundColor White
Write-Host ""
Write-Host "Optional: Prisma Studio oeffnen" -ForegroundColor White
Write-Host "  npx prisma studio" -ForegroundColor White
Write-Host "  (Visueller Datenbank-Browser auf http://localhost:5555)" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Prisma Setup abgeschlossen!     " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
