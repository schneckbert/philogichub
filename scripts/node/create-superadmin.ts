import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

function genPassword(length = 20): string {
  // URL-safe base64 plus symbols to meet complexity
  const raw = crypto.randomBytes(length + 4).toString('base64');
  // Ensure at least one of each class
  const symbols = '!@#$%^&*()-_=+[]{}';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let pwd = raw.replace(/[^A-Za-z0-9]/g, '');
  if (pwd.length < length - 4) {
    pwd = pwd.padEnd(length - 4, pick(lower));
  }
  pwd = pwd.slice(0, length - 4);
  pwd += pick(symbols) + pick(upper) + pick(lower) + pick(digits);
  return pwd;
}

async function main() {
  const emailArg = process.argv.find((a) => a.startsWith('--email='));
  const email = emailArg ? emailArg.split('=')[1] : process.env.ADMIN_EMAIL;
  if (!email) {
    console.error('Usage: tsx scripts/node/create-superadmin.ts --email=<email> [--password=<password>]');
    process.exit(1);
  }
  const pwdArg = process.argv.find((a) => a.startsWith('--password='));
  const initialPassword = pwdArg ? pwdArg.split('=')[1] : genPassword();

  console.log(`🔧 Using DATABASE_URL=${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`);
  console.log(`👤 Upserting superadmin for ${email} ...`);

  const superadminRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: {},
    create: {
      name: 'superadmin',
      description: 'Full system access with no restrictions',
      isSystem: true,
    },
  });

  const hashed = await bcrypt.hash(initialPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      emailVerified: new Date(),
    },
    create: {
      email,
      name: 'Superadmin',
      password: hashed,
      emailVerified: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superadminRole.id } },
    update: {},
    create: { userId: user.id, roleId: superadminRole.id },
  });

  console.log('✅ Superadmin ensured.');
  console.log(`   📧 Email: ${email}`);
  console.log(`   🔑 Password: ${initialPassword}`);
  console.log('   ⚠️  Please change this password after first login.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error creating superadmin:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
