import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================
  // 1. CREATE ROLES
  // ============================================
  console.log('📋 Creating roles...');

  const superadminRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: {},
    create: {
      name: 'superadmin',
      description: 'Full system access with no restrictions',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Operational administration without system policy changes',
      isSystem: true,
    },
  });

  const domainOwnerRole = await prisma.role.upsert({
    where: { name: 'domain_owner' },
    update: {},
    create: {
      name: 'domain_owner',
      description: 'Domain/team leadership with scoped permissions',
      isSystem: true,
    },
  });

  const standardUserRole = await prisma.role.upsert({
    where: { name: 'standard_user' },
    update: {},
    create: {
      name: 'standard_user',
      description: 'Regular user with basic platform access',
      isSystem: true,
    },
  });

  const readOnlyRole = await prisma.role.upsert({
    where: { name: 'read_only' },
    update: {},
    create: {
      name: 'read_only',
      description: 'View-only access for reporting and auditing',
      isSystem: true,
    },
  });

  console.log('✅ Roles created');

  // ============================================
  // 2. CREATE PERMISSIONS
  // ============================================
  console.log('🔑 Creating permissions...');

  const permissions = [
    // Universal
    { key: '*', description: 'Full system access (superadmin only)' },
    
    // User management
    { key: 'user:read:all', description: 'Read all users' },
    { key: 'user:read:self', description: 'Read own user data' },
    { key: 'user:write:all', description: 'Create/update all users' },
    { key: 'user:write:non_admin', description: 'Manage non-admin users only' },
    { key: 'user:delete:all', description: 'Delete any user' },
    
    // Role management
    { key: 'role:read:all', description: 'Read all roles' },
    { key: 'role:write:all', description: 'Manage roles and permissions' },
    { key: 'role:assign:all', description: 'Assign any role to users' },
    { key: 'role:assign:non_admin', description: 'Assign non-admin roles only' },
    
    // Academy content
    { key: 'academy:content:read', description: 'Read published academy content' },
    { key: 'academy:content:draft_create', description: 'Create draft content' },
    { key: 'academy:content:create:self_domain', description: 'Create content in own domain' },
    { key: 'academy:content:create:all', description: 'Create content in any domain' },
    { key: 'academy:content:approve', description: 'Approve pending content' },
    { key: 'academy:content:rollback', description: 'Rollback content versions' },
    { key: 'academy:content:delete', description: 'Delete academy content' },
    
    // API Keys
    { key: 'apikey:read:self', description: 'Read own API keys' },
    { key: 'apikey:read:all', description: 'Read all API keys' },
    { key: 'apikey:write:self', description: 'Manage own API keys' },
    { key: 'apikey:write:other', description: 'Manage other users\' API keys' },
    { key: 'apikey:delete:self', description: 'Delete own API keys' },
    { key: 'apikey:delete:all', description: 'Delete any API key' },
    
    // n8n workflows
    { key: 'n8n:workflow:read:self', description: 'Read own workflows' },
    { key: 'n8n:workflow:read:team', description: 'Read team workflows' },
    { key: 'n8n:workflow:read:all', description: 'Read all workflows' },
    { key: 'n8n:workflow:execute:self', description: 'Execute own workflows' },
    { key: 'n8n:workflow:execute:team', description: 'Execute team workflows' },
    { key: 'n8n:workflow:execute:all', description: 'Execute any workflow' },
    { key: 'n8n:workflow:create:self', description: 'Create personal workflows' },
    { key: 'n8n:workflow:create:team', description: 'Create team workflows' },
    { key: 'n8n:workflow:manage:all', description: 'Full workflow management' },
    { key: 'n8n:credentials:manage', description: 'Manage global credentials' },
    
    // Audit logs
    { key: 'audit:read:self', description: 'Read own audit logs' },
    { key: 'audit:read:all', description: 'Read all audit logs' },
    
    // System config
    { key: 'system:config:read', description: 'Read system configuration' },
    { key: 'system:config:write', description: 'Modify system configuration' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: perm,
    });
  }

  console.log(`✅ ${permissions.length} permissions created`);

  // ============================================
  // 3. ASSIGN PERMISSIONS TO ROLES
  // ============================================
  console.log('🔗 Assigning permissions to roles...');

  // Superadmin: Everything
  const superadminPerms = await prisma.permission.findMany();
  for (const perm of superadminPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superadminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superadminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Admin: Operational permissions
  const adminPermKeys = [
    'user:read:all',
    'user:write:non_admin',
    'role:read:all',
    'role:assign:non_admin',
    'academy:content:read',
    'academy:content:create:all',
    'academy:content:approve',
    'academy:content:delete',
    'apikey:read:all',
    'apikey:write:other',
    'n8n:workflow:read:all',
    'n8n:workflow:execute:all',
    'n8n:workflow:manage:all',
    'audit:read:all',
    'system:config:read',
  ];

  for (const key of adminPermKeys) {
    const perm = await prisma.permission.findUnique({ where: { key } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Domain Owner: Scoped permissions
  const domainOwnerPermKeys = [
    'user:read:self',
    'academy:content:read',
    'academy:content:create:self_domain',
    'apikey:read:self',
    'apikey:write:self',
    'n8n:workflow:read:team',
    'n8n:workflow:execute:team',
    'n8n:workflow:create:team',
    'audit:read:self',
  ];

  for (const key of domainOwnerPermKeys) {
    const perm = await prisma.permission.findUnique({ where: { key } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: domainOwnerRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: domainOwnerRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Standard User: Basic permissions
  const standardUserPermKeys = [
    'user:read:self',
    'academy:content:read',
    'academy:content:draft_create',
    'apikey:read:self',
    'apikey:write:self',
    'apikey:delete:self',
    'n8n:workflow:read:self',
    'n8n:workflow:execute:self',
    'n8n:workflow:create:self',
    'audit:read:self',
  ];

  for (const key of standardUserPermKeys) {
    const perm = await prisma.permission.findUnique({ where: { key } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: standardUserRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: standardUserRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Read-Only: View permissions only
  const readOnlyPermKeys = [
    'user:read:self',
    'academy:content:read',
    'audit:read:self',
  ];

  for (const key of readOnlyPermKeys) {
    const perm = await prisma.permission.findUnique({ where: { key } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: readOnlyRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: readOnlyRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  console.log('✅ Permissions assigned to roles');

  // ============================================
  // 4. CREATE SUPERADMIN USER
  // ============================================
  console.log('👤 Creating superadmin user...');

  const hashedPassword = await bcrypt.hash('admin123!', 10);

  const superadminUser = await prisma.user.upsert({
    where: { email: 'admin@philogic.de' },
    update: {},
    create: {
      email: 'admin@philogic.de',
      name: 'Philip Superadmin',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superadminUser.id,
        roleId: superadminRole.id,
      },
    },
    update: {},
    create: {
      userId: superadminUser.id,
      roleId: superadminRole.id,
    },
  });

  console.log('✅ Superadmin user created');
  console.log('   📧 Email: admin@philogic.de');
  console.log('   🔑 Password: admin123!');
  console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!');

  // ============================================
  // 5. CREATE SAMPLE ACADEMY CONTENT
  // ============================================
  console.log('📚 Creating sample academy content...');

  await prisma.academyContent.upsert({
    where: { slug: 'welcome-to-philogic-ai' },
    update: {},
    create: {
      slug: 'welcome-to-philogic-ai',
      title: 'Welcome to PhilogicAI',
      category: 'getting-started',
      status: 'published',
      currentVersion: 1,
      isProtected: true,
      createdBy: superadminUser.id,
      versions: {
        create: {
          version: 1,
          markdown: `# Welcome to PhilogicAI

This is your internal AI knowledge platform. Here you can:

- Access curated AI knowledge
- Contribute your own insights
- Learn best practices
- Collaborate with your team

## Getting Started

1. Explore existing content
2. Ask questions to PhilogicAI
3. Suggest improvements
4. Build your expertise

Let's make AI work for everyone!`,
          createdBy: superadminUser.id,
        },
      },
    },
  });

  console.log('✅ Sample academy content created');

  console.log('\n🎉 Database seeding completed successfully!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
