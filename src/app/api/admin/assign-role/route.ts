import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, canModerateUsers, hasRole } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';

// Mock email service - in a real app, use a real email service
async function sendRoleChangeEmail(userEmail: string, userName: string | null, newRole: UserRole) {
  console.log(`📧 MOCK EMAIL: Sending role change notification to ${userEmail}`);
  console.log(`Subject: Your Role Has Been Updated`);
  console.log(`
    Hello ${userName || 'there'},
    
    We're writing to inform you that your role in the community has been updated.
    
    Your new role: ${newRole}
    
    This change may grant you additional permissions and responsibilities within our platform.
    Please check the documentation to understand your new capabilities.
    
    If you have any questions about your new role, please reach out to an administrator.
    
    Best regards,
    The Community Team
  `);
  
  // In a real implementation, you would call an email service here
  return true;
}

// PATCH handler for assigning a new role to a user
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission (MODERATOR or ADMIN)
  if (!canModerateUsers(session)) {
    return NextResponse.json(
      { error: 'Unauthorized. Only moderators and administrators can assign roles.' }, 
      { status: 403 }
    );
  }
  
  try {
    const { userId, role } = await req.json();
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }
    
    // Validate the role is a valid UserRole
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: ADMIN, MODERATOR, FACILITATOR, MEMBER' },
        { status: 400 }
      );
    }
    
    // Get the user to check their current role and community
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        communityId: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if the moderator has permission to modify users in this community
    // ADMINs can modify any user, but MODERATORs can only modify users in their community
    if (
      session?.user?.role === UserRole.MODERATOR && 
      user.communityId !== session.user.communityId
    ) {
      return NextResponse.json(
        { error: 'You can only modify users in your own community' },
        { status: 403 }
      );
    }
    
    // Check that the user modifying has sufficient permissions for the role change
    // Only ADMINs can assign ADMIN or MODERATOR roles
    if (
      (role === UserRole.ADMIN || role === UserRole.MODERATOR) && 
      !hasRole(session?.user?.role as UserRole, UserRole.ADMIN)
    ) {
      return NextResponse.json(
        { error: 'Only administrators can assign ADMIN or MODERATOR roles' },
        { status: 403 }
      );
    }
    
    // Check that users aren't trying to modify someone with a higher role than themselves
    if (
      hasRole(user.role as UserRole, UserRole.ADMIN) && 
      !hasRole(session?.user?.role as UserRole, UserRole.ADMIN)
    ) {
      return NextResponse.json(
        { error: 'You cannot modify the role of an administrator' },
        { status: 403 }
      );
    }
    
    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as UserRole
      }
    });
    
    // Send role change email
    if (updatedUser.email) {
      await sendRoleChangeEmail(updatedUser.email, updatedUser.name, role as UserRole);
    }
    
    return NextResponse.json({
      message: `User role updated to ${role} successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
} 