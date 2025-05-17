import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, UserStatus, canModerateUsers } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';

// Mock email service - in a real app, you would use a service like SendGrid, Mailgun, etc.
async function sendApprovalEmail(userEmail: string, userName: string | null) {
  console.log(`📧 MOCK EMAIL: Sending approval notification to ${userEmail}`);
  console.log(`Subject: Your Account Has Been Approved`);
  console.log(`
    Hello ${userName || 'there'},
    
    Great news! Your account has been approved by a community moderator.
    You can now access all features of the platform.
    
    Login now to start exploring.
    
    Best regards,
    The Community Team
  `);
  
  // In a real implementation, you would call an email service here
  return true;
}

// POST handler for approving a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission (MODERATOR or ADMIN)
  if (!canModerateUsers(session)) {
    return NextResponse.json(
      { error: 'Unauthorized. Only moderators and administrators can approve users.' }, 
      { status: 403 }
    );
  }
  
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get the user to check their current status and community
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
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
    
    // If the user is not pending, return an error
    if (user.status !== UserStatus.PENDING) {
      return NextResponse.json(
        { error: 'User is not in PENDING status' },
        { status: 400 }
      );
    }
    
    // Check if the moderator has permission to modify users in this community
    // ADMINs can approve any user, but MODERATORs can only approve users in their community
    if (
      session?.user?.role === UserRole.MODERATOR && 
      user.communityId !== session.user.communityId
    ) {
      return NextResponse.json(
        { error: 'You can only approve users in your own community' },
        { status: 403 }
      );
    }
    
    // Update the user's status to APPROVED
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.APPROVED
      }
    });

    // Record this action in a log or audit trail (optional)
    await prisma.notification.create({
      data: {
        userId: updatedUser.id,
        type: 'EVENT_INVITE', // Using existing type as example - you could add ACCOUNT_APPROVED type
        referenceId: session?.user?.id || null,
        read: false
      }
    });
    
    // Send approval email
    if (updatedUser.email) {
      await sendApprovalEmail(updatedUser.email, updatedUser.name);
    }
    
    return NextResponse.json({
      message: 'User approved successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Error approving user:', error);
    return NextResponse.json(
      { error: 'Failed to approve user' },
      { status: 500 }
    );
  }
} 