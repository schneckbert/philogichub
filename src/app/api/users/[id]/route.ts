import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, auditLog, getRequestMetadata } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requirePermission('user:read:all');
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isSystem: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requirePermission(['user:write:all', 'user:write:non_admin']);
  if (error) return error;

  try {
    const body = await req.json();
    const { name, email, roleIds } = body;

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
    });

    // Update roles if provided
    if (roleIds && Array.isArray(roleIds)) {
      // Delete existing roles
      await prisma.userRole.deleteMany({
        where: { userId: params.id },
      });

      // Add new roles
      await prisma.userRole.createMany({
        data: roleIds.map((roleId: string) => ({
          userId: params.id,
          roleId,
          assignedBy: session.user.id,
        })),
      });
    }

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: 'user.updated',
      resourceType: 'user',
      resourceId: params.id,
      metadata: { name, email, roleIds },
      ...metadata,
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requirePermission('user:delete:all');
  if (error) return error;

  try {
    // Check if user is trying to delete themselves
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user is a superadmin
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isSuperadmin = userToDelete.userRoles.some(
      (ur) => ur.role.name === 'superadmin'
    );

    if (isSuperadmin) {
      // Check if this is the last superadmin
      const superadminCount = await prisma.userRole.count({
        where: {
          role: {
            name: 'superadmin',
          },
        },
      });

      if (superadminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last superadmin' },
          { status: 400 }
        );
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    });

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: 'user.deleted',
      resourceType: 'user',
      resourceId: params.id,
      metadata: { email: userToDelete.email },
      ...metadata,
    });

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
