# Supabase Connection String finden

## Option 1: Connection Pooler (empfohlen für Production)

1. Öffne **Supabase Dashboard**: https://supabase.com/dashboard
2. Wähle dein Projekt: `nhxkbqimuserpkjspojh`
3. Gehe zu **Settings** → **Database**
4. Scrolle zu **Connection String** → **Transaction Mode** (Port 6543)
5. Kopiere die String und ersetze `[YOUR-PASSWORD]` mit deinem Passwort

Format:
```
postgresql://postgres.nhxkbqimuserpkjspojh:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Option 2: Direct Connection (für lokale Entwicklung)

Port 5432 statt 6543:
```
postgresql://postgres.nhxkbqimuserpkjspojh:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

## Passwort finden/zurücksetzen

Falls du dein Passwort nicht mehr hast:

1. **Settings** → **Database** → **Database password**
2. Klicke auf **Reset database password**
3. Kopiere das neue Passwort

⚠️ **Wichtig**: Nach Passwort-Reset musst du alle Connection Strings aktualisieren!

## In .env eintragen

Öffne `.env` und ersetze `[DEIN_PASSWORT]` mit dem echten Passwort:

```bash
DATABASE_URL="postgresql://postgres.nhxkbqimuserpkjspojh:ECHTES_PASSWORT_HIER@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Testen

```powershell
# Schema importieren (testet gleichzeitig die Connection)
.\sync-schema.ps1
```

Falls Fehler: Connection String überprüfen (Passwort, Port, URL).
