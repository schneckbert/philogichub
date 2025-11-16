import { PrismaClient } from '@prisma/client';

const testUrl = 'postgresql://postgres:AJDSF838edfjafd8sJASDF8fdshdfhs@db.nhxkbqimuserpkjspojh.supabase.co:5432/postgres?sslmode=require&connect_timeout=10';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testUrl
    }
  }
});

console.log('🔄 Testing Supabase connection from local...');

prisma.$connect()
  .then(() => {
    console.log('✅ Connection successful!');
    return prisma.user.findFirst();
  })
  .then((user) => {
    if (user) {
      console.log('✅ User query successful:', user.email);
    } else {
      console.log('⚠️  No users found in database');
    }
  })
  .catch((e) => {
    console.error('❌ Connection failed:', e.message);
    if (e.message.includes("Can't reach database")) {
      console.error('💡 Possible causes:');
      console.error('   - Supabase firewall blocking this IP');
      console.error('   - Database paused/inactive');
      console.error('   - Wrong credentials');
    }
  })
  .finally(() => {
    prisma.$disconnect();
  });
