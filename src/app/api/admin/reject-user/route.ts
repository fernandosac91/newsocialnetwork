import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, UserStatus, canModerateUsers } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';

// Mock email service - in a real app, you would use a service like SendGrid, Mailgun, etc.
async function sendRejectionEmail(userEmail: string, userName: string | null, reason: string | null) {
  console.log(`📧 MOCK EMAIL: Sending rejection notification to ${userEmail}`);
  console.log(`Subject: Update on Your Account Application`);
  console.log(`
    Hello ${userName || 'there'},
    
    We're writing to inform you that your account application has been reviewed.
    Unfortunately, we are unable to approve your application at this time.
    
    ${reason ? `Reason: ${reason}` : 'If you have questions about this decision, please contact our support team.'}
    
    You may reapply after making the necessary adjustments to your profile.
    
    Regards,
    The Community Team
  `);
  
  // In a real implementation, you would call an email service here
  return true;
}

// POST handler for rejecting a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission (MODERATOR or ADMIN)
  if (!canModerateUsers(session)) {
    return NextResponse.json(
      { error: 'Unauthorized. Only moderators and administrators can reject users.' }, 
      { status: 403 }
    );
  }
  
  try {
    const { userId, reason } = await req.json();
    
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
    // ADMINs can reject any user, but MODERATORs can only reject users in their community
    if (
      session?.user?.role === UserRole.MODERATOR && 
      user.communityId !== session.user.communityId
    ) {
      return NextResponse.json(
        { error: 'You can only reject users in your own community' },
        { status: 403 }
      );
    }
    
    // Update the user's status to REJECTED
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.REJECTED
      }
    });
    
    // Record this action in a log or audit trail (optional)
    await prisma.notification.create({
      data: {
        userId: updatedUser.id,
        type: 'EVENT_INVITE', // Using existing type as example - you could add ACCOUNT_REJECTED type
        referenceId: session?.user?.id || null,
        read: false
      }
    });
    
    // Send rejection email
    if (updatedUser.email) {
      await sendRejectionEmail(updatedUser.email, updatedUser.name, reason);
    }
    
    return NextResponse.json({
      message: 'User rejected successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    return NextResponse.json(
      { error: 'Failed to reject user' },
      { status: 500 }
    );
  }
} 