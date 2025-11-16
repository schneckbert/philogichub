# PhilogicAI MCP Server

Lightweight MCP server exposing operational tools for your PhilogicAI backend (health checks, Cloudflare Tunnel control, and JWT generation).

## Tools

- philogic.health
  - Checks `${PHILOGIC_AI_URL}/health` and returns JSON.
- philogic.tunnelStatus
  - Runs `cloudflared tunnel list` to show tunnel status.
- philogic.tunnelRun
  - Starts a tunnel: `cloudflared tunnel run <name>`.
  - Args: `{ name: string; background?: boolean }`.
- philogic.generateJwt
  - Creates an HS256 token using `PHILOGIC_AI_JWT_SECRET`.
  - Args: `{ user: string; expiresIn?: string; claims?: Record<string, any> }`.

## Prereqs

- Node 18+ (or 20+ recommended)
- Cloudflare Tunnel CLI (`cloudflared`) on PATH, if you want tunnel tools
- Environment variables in your shell (or a process manager):
  - `PHILOGIC_AI_URL` (e.g. http://localhost:8000)
  - `PHILOGIC_AI_JWT_SECRET` (for the JWT tool)

## Develop

```powershell
cd tools/philogicai-mcp
npm install
npm run dev
```

## Build & Run

```powershell
cd tools/philogicai-mcp
npm run build
npm start
```

This server speaks MCP over stdio and is meant to be launched by an MCP-capable client. It will idle waiting for a client connection when started directly.

## Example Client Config (generic)

If your MCP client uses a JSON config, add something like:

```json
{
  "mcpServers": {
    "philogicai": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "PHILOGIC_AI_URL": "http://localhost:8000",
        "PHILOGIC_AI_JWT_SECRET": "replace-with-strong-secret"
      },
      "cwd": "./tools/philogicai-mcp"
    }
  }
}
```

## Notes

- Health tool uses the `PHILOGIC_AI_URL` base; ensure PhilogicAI exposes `/health`.
- Tunnel commands assume you have already created and authenticated a named Cloudflare tunnel locally (`cloudflared tunnel create <name>` and `cloudflared login`).
- JWT tool returns the raw token; include it as `Authorization: Bearer <token>` when calling PhilogicAI if your backend is configured to require it.
