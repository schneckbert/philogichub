# Philogic-Hub – Complete Setup Script
# Installiert Dependencies, richtet Prisma ein, erstellt DB-Schema

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  PHILOGIC-HUB SETUP KOMPLETT     " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Dependencies installieren
Write-Host "[1/5] Installiere npm Dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler bei npm install!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installiert." -ForegroundColor Green
Write-Host ""

# 2. .env Datei erstellen (falls nicht vorhanden)
Write-Host "[2/5] Erstelle .env Datei..." -ForegroundColor Yellow
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
Write-Host "[3/5] Generiere Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Generieren des Prisma Client!" -ForegroundColor Red
    exit 1
}

Write-Host "Prisma Client generiert." -ForegroundColor Green
Write-Host ""

# 4. Git Status
Write-Host "[4/5] Git Status..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "Git Repository existiert bereits." -ForegroundColor Green
    Write-Host "Fuehre 'git status' aus um Aenderungen zu sehen:" -ForegroundColor Cyan
    git status --short
} else {
    Write-Host "Kein Git Repository gefunden." -ForegroundColor Yellow
    Write-Host "Fuehre './setup.ps1' aus um Git zu initialisieren." -ForegroundColor Cyan
}
Write-Host ""

# 5. Next Steps Info
Write-Host "[5/5] Setup abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  NAECHSTE SCHRITTE                " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. DATABASE_URL in .env eintragen (Supabase Connection String)" -ForegroundColor White
Write-Host "   Siehe docs/SUPABASE_SETUP.md fuer Details" -ForegroundColor Gray
Write-Host ""
Write-Host "2. SQL-Scripts in Supabase ausfuehren:" -ForegroundColor White
Write-Host "   Oeffne Supabase SQL Editor und fuehre aus:" -ForegroundColor Gray
Write-Host "   - sql/01_agent_system.sql" -ForegroundColor Gray
Write-Host "   - sql/02_project_management.sql" -ForegroundColor Gray
Write-Host "   - sql/03_disable_rls_baucrm.sql" -ForegroundColor Gray
Write-Host "   - sql/04_dashboard_views.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Prisma-Schema aus Supabase importieren:" -ForegroundColor White
Write-Host "   npx prisma db pull" -ForegroundColor Gray
Write-Host "   npx prisma generate" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Dev-Server starten:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   oder: ./dev.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Optional: Prisma Studio oeffnen" -ForegroundColor White
Write-Host "   npx prisma studio" -ForegroundColor Gray
Write-Host "   (Visueller DB-Browser auf http://localhost:5555)" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  BEREIT ZUM LOSLEGEN!             " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
