# Test Server Guide (PhilogicHub + PhilogicAI)

This guide shows how to validate the full integration locally and then via a public URL using a tunnel.

## Local test

1. Ensure PhilogicAI backend is running on http://localhost:8000
   - Health check:
     ```powershell
     Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing | Select-Object -ExpandProperty Content
     ```
2. Start PhilogicHub
   ```powershell
   npm run dev
   ```
3. Sign in, then open:
   - http://localhost:3000/philogic-ai/status
   - http://localhost:3000/philogic-ai

## Public test (Cloudflare Tunnel)

1. Install Cloudflare Tunnel CLI
   ```powershell
   winget install Cloudflare.cloudflared
   ```
2. Fully automated setup (one command)
```powershell
.\u005cscriptswindowsSetup-Cloudflared.ps1 -Hostname philogicai.yourdomain.com -AutoLogin -CreateDns -Start
```

3. Manual route (if preferred): Authenticate and create a named tunnel (one-time)
```powershell
cloudflared tunnel login
cloudflared tunnel create philogicai
cloudflared tunnel list
```
4. Configure ingress and DNS (see PHILOGICAI_DEPLOYMENT.md). Example config.yml:
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: C:\\Users\\<username>\\.cloudflared\\<TUNNEL_ID>.json
   ingress:
     - hostname: philogicai.yourdomain.com
       service: http://localhost:8000
     - service: http_status:404
   ```
   Or write it with the helper script:

   ```powershell
   .\scripts\windows\Write-CloudflaredConfig.ps1 -TunnelId 64c17a7d-b17e-4505-8d02-f7d3ec7582f8 -Hostname philogicai.yourdomain.com -ServiceUrl http://localhost:8000
   ```

   Create DNS record automatically (recommended):

   ```powershell
   cloudflared tunnel route dns philogicai philogicai.yourdomain.com
   ```
4. Run the tunnel
   ```powershell
   .\scripts\windows\Start-Cloudflared.ps1 -TunnelName philogicai
   ```
5. Update Vercel env PHILOGIC_AI_URL to the public hostname and redeploy. Then test the PhilogicHub production URLs for /philogic-ai/status and /philogic-ai.

## Quick alternative (ngrok)

For a fast smoke test without DNS:

```powershell
ngrok config add-authtoken <YOUR_TOKEN>
ngrok http 8000 --region eu
```

Use the printed https URL as PHILOGIC_AI_URL in Vercel for a quick end-to-end test. Replace it later with the stable Cloudflare domain.
