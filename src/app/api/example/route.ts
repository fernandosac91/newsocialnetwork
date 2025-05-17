import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, checkPermission } from '@/lib/auth/permissions';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to access this API
  const hasPermission = checkPermission(session, UserRole.MEMBER);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be an approved member to access this resource.' }, 
      { status: 403 }
    );
  }
  
  // Process the request
  return NextResponse.json({ 
    message: 'You have successfully accessed this API endpoint!',
    userInfo: {
      name: session?.user?.name,
      email: session?.user?.email,
      role: session?.user?.role,
    }
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // For content creation, require higher permission
  const hasPermission = checkPermission(session, UserRole.FACILITATOR);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be at least a facilitator to create content.' }, 
      { status: 403 }
    );
  }
  
  // Process the request
  try {
    const data = await req.json();
    return NextResponse.json({ 
      message: 'Content created successfully!', 
      content: data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' }, 
      { status: 400 }
    );
  }
} 