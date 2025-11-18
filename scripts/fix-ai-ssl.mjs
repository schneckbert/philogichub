#!/usr/bin/env node
// Fix SSL for ai.philogic-labs.de (philogichub CRM)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function loadEnv(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {}
}

loadEnv(path.resolve(ROOT, '..', 'site', '.env.local'));

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

if (!token || !zoneId) {
  console.error('Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID');
  console.error('Make sure site/.env.local exists with these values');
  process.exit(1);
}

const API = 'https://api.cloudflare.com/client/v4';

async function cf(pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const msg = data.errors?.map(e => e.message).join('; ') || res.statusText;
    throw new Error(`Cloudflare API error ${res.status}: ${msg}`);
  }
  return data.result ?? data;
}

async function getDNSRecords(name) {
  const records = await cf(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}`);
  return Array.isArray(records) ? records : [];
}

async function updateRecord(id, proxied) {
  const record = await cf(`/zones/${zoneId}/dns_records/${id}`);
  if (record.proxied === proxied) return null;
  
  const updated = await cf(`/zones/${zoneId}/dns_records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ proxied }),
  });
  return updated;
}

async function main() {
  const mode = process.argv[2] || 'disable';
  const targetProxied = mode === 'enable';
  
  console.log(`\n=== Cloudflare Proxy ${mode === 'enable' ? 'ENABLE' : 'DISABLE'} for ai.philogic-labs.de ===\n`);
  
  const domain = 'ai.philogic-labs.de';
  
  console.log(`🔍 Processing: ${domain}`);
  const records = await getDNSRecords(domain);
  
  if (records.length === 0) {
    console.log(`  ⚠️  No DNS record found`);
    return;
  }

  for (const record of records) {
    const current = record.proxied ? '🟠 Proxied' : '⚪ DNS only';
    const target = targetProxied ? '🟠 Proxied' : '⚪ DNS only';
    
    if (record.proxied === targetProxied) {
      console.log(`  ✓ ${record.type} ${record.name}: ${current} (already set)`);
    } else {
      console.log(`  ⚙️  ${record.type} ${record.name}: ${current} → ${target}`);
      await updateRecord(record.id, targetProxied);
      console.log(`  ✓ Updated!`);
    }
  }

  console.log('\n✅ Done!\n');
  
  if (mode === 'disable') {
    console.log('📝 Next: Add ai.philogic-labs.de in Vercel Dashboard');
    console.log('https://vercel.com/schneckberts-projects/philogichub/settings/domains');
    console.log('\nOnce SSL works, re-enable proxy:');
    console.log('node scripts/fix-ai-ssl.mjs enable\n');
  }
}

main().catch((e) => {
  console.error('\n❌ Error:', e.message || e);
  process.exit(1);
});
