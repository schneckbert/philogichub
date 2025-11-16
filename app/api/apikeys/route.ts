import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, auditLog, getRequestMetadata } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import {
  encryptApiKey,
  createKeyPreview,
  validateApiKeyFormat,
} from '@/lib/encryption';

export async function GET(req: NextRequest) {
  const { session, error } = await requirePermission(['apikey:read:self', 'apikey:read:all']);
  if (error) return error;

  try {
    const canReadAll = session.user.permissions.includes('apikey:read:all');

    const apiKeys = await prisma.apiKey.findMany({
      where: canReadAll ? {} : { userId: session.user.id },
      select: {
        id: true,
        name: true,
        provider: true,
        keyPreview: true,
        rateLimitRequestsPerMinute: true,
        rateLimitTokensPerDay: true,
        monthlyCostLimitUsd: true,
        totalRequests: true,
        totalTokens: true,
        totalCostUsd: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requirePermission(['apikey:write:self', 'apikey:write:other']);
  if (error) return error;

  try {
    const body = await req.json();
    const {
      name,
      provider,
      key,
      userId,
      rateLimitRequestsPerMinute,
      rateLimitTokensPerDay,
      monthlyCostLimitUsd,
    } = body;

    if (!name || !provider || !key) {
      return NextResponse.json(
        { error: 'Name, provider, and key are required' },
        { status: 400 }
      );
    }

    // Validate key format
    if (!validateApiKeyFormat(key, provider)) {
      return NextResponse.json(
        { error: 'Invalid API key format for the selected provider' },
        { status: 400 }
      );
    }

    // Determine target user
    const targetUserId = userId || session.user.id;

    // Check permission if creating for another user
    if (targetUserId !== session.user.id) {
      if (!session.user.permissions.includes('apikey:write:other')) {
        return NextResponse.json(
          { error: 'You do not have permission to create API keys for other users' },
          { status: 403 }
        );
      }
    }

    // Encrypt the key
    const { encrypted, hash } = encryptApiKey(key);
    const preview = createKeyPreview(key);

    // Check if key already exists (by hash)
    const existing = await prisma.apiKey.findUnique({
      where: { keyHash: hash },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This API key is already registered' },
        { status: 400 }
      );
    }

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: targetUserId,
        name,
        provider,
        keyEncrypted: encrypted,
        keyHash: hash,
        keyPreview: preview,
        rateLimitRequestsPerMinute: rateLimitRequestsPerMinute || 60,
        rateLimitTokensPerDay: rateLimitTokensPerDay || 100000,
        monthlyCostLimitUsd: monthlyCostLimitUsd || 100,
      },
      select: {
        id: true,
        name: true,
        provider: true,
        keyPreview: true,
        rateLimitRequestsPerMinute: true,
        rateLimitTokensPerDay: true,
        monthlyCostLimitUsd: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: 'apikey.created',
      resourceType: 'api_key',
      resourceId: apiKey.id,
      metadata: { name, provider, targetUserId, preview },
      ...metadata,
    });

    return NextResponse.json(
      {
        ...apiKey,
        message: 'API key created successfully. This is the only time you will see the full key.',
        fullKey: key, // Return key ONLY on creation
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
