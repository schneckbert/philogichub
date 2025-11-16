import { spawn } from "node:child_process";
import process from "node:process";
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Environment
const PHILOGIC_AI_URL = process.env.PHILOGIC_AI_URL || "http://localhost:8000";

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "accept": "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

function runCommand(cmd: string, args: string[], timeoutMs = 15000): Promise<{ code: number; stdout: string; stderr: string }>{
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { shell: false });
    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      resolve({ code: -1, stdout, stderr: stderr + "\n[timeout]" });
    }, timeoutMs);

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? -1, stdout, stderr });
    });
  });
}

async function main() {
  const server = new McpServer({ name: "philogicai-mcp", version: "0.1.0" });

  // Tool: Health check
  server.registerTool("philogic.health", { description: "Check PhilogicAI /health" }, async (_args: unknown, _extra: unknown) => {
    try {
      const json = await fetchJson(`${PHILOGIC_AI_URL}/health`);
      return { content: [{ type: "text" as const, text: JSON.stringify(json, null, 2) }], isError: false };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: String(err) }], isError: true };
    }
  });

  // Tool: Cloudflare tunnel status
  server.registerTool("philogic.tunnelStatus", { description: "cloudflared tunnel list" }, async (_args: unknown, _extra: unknown) => {
    const result = await runCommand("cloudflared", ["tunnel", "list"], 12000);
    const ok = result.code === 0;
    return { content: [{ type: "text" as const, text: `code=${result.code}\n${result.stdout || result.stderr}` }], isError: !ok };
  });

  // Tool: Start tunnel
  server.registerTool(
    "philogic.tunnelRun",
    {
      description: "Run 'cloudflared tunnel run <name>'",
      inputSchema: z.object({ name: z.string(), background: z.boolean().optional() }),
    },
    async (args, _extra) => {
      const tName = args.name;
      const background = Boolean(args.background);
      if (background) {
        spawn("cloudflared", ["tunnel", "run", tName], { detached: true, stdio: "ignore" }).unref();
        return { content: [{ type: "text" as const, text: `Started tunnel '${tName}' in background.` }], isError: false };
      }
      const result = await runCommand("cloudflared", ["tunnel", "run", tName], 15000);
      const ok = result.code === 0;
      return { content: [{ type: "text" as const, text: `code=${result.code}\n${result.stdout || result.stderr}` }], isError: !ok };
    }
  );

  // Tool: Generate JWT (optional)
  server.registerTool(
    "philogic.generateJwt",
    {
      description: "Generate HS256 JWT using PHILOGIC_AI_JWT_SECRET",
      inputSchema: z.object({ user: z.string(), expiresIn: z.string().optional(), claims: z.record(z.any()).optional() }),
    },
    async (args, _extra) => {
      const user = args.user as string;
      const expiresIn = (args.expiresIn as string) || "7d";
      const claims = (args.claims as Record<string, any>) || {};
      const secret = process.env.PHILOGIC_AI_JWT_SECRET;
      if (!secret) {
        return { content: [{ type: "text" as const, text: "PHILOGIC_AI_JWT_SECRET not set" }], isError: true };
      }
      const token = jwt.sign({ user, ...claims }, secret as Secret, { algorithm: "HS256", expiresIn } as SignOptions);
      return { content: [{ type: "text" as const, text: token }], isError: false };
    }
  );

  await server.connect(new StdioServerTransport());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
