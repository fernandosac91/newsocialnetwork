import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { UserRole, checkPermission } from '@/lib/auth/permissions';
import prisma from '@/lib/db/prisma';

// GET handler for listing circles (scoped to user's community)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to access circles
  const hasPermission = checkPermission(session, UserRole.MEMBER);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be an approved member to view circles.' }, 
      { status: 403 }
    );
  }
  
  // Ensure user has a community assigned
  if (!session?.user?.communityId) {
    return NextResponse.json(
      { error: 'You are not assigned to a community' },
      { status: 403 }
    );
  }
  
  try {
    // Get circles for the user's community only
    const circles = await prisma.circle.findMany({
      where: {
        communityId: session.user.communityId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photo: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(circles);
  } catch (error) {
    console.error('Error fetching circles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circles' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new circle
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user has permission to create circles (FACILITATOR or higher)
  const hasPermission = checkPermission(session, UserRole.FACILITATOR);
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Unauthorized. You must be at least a facilitator to create circles.' }, 
      { status: 403 }
    );
  }
  
  // Ensure user has a community assigned
  if (!session?.user?.communityId) {
    return NextResponse.json(
      { error: 'You are not assigned to a community' },
      { status: 403 }
    );
  }
  
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Circle name is required' },
        { status: 400 }
      );
    }
    
    // Generate a URL-friendly username from the name
    const baseUsername = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single one
      .trim(); // Remove whitespace from ends
      
    // Check if username exists, if so, add a random suffix
    let username = baseUsername;
    let usernameExists = await prisma.circle.findUnique({ where: { username } });
    
    if (usernameExists) {
      // Add timestamp to make username unique
      username = `${baseUsername}-${Date.now().toString().slice(-6)}`;
    }
    
    // Create the circle in the user's community
    const newCircle = await prisma.circle.create({
      data: {
        name: data.name,
        username, // Add the generated username
        description: data.description,
        communityId: session.user.communityId,
        createdById: session.user.id
      }
    });
    
    // Automatically add the creator as a member
    await prisma.circleMember.create({
      data: {
        circleId: newCircle.id,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(newCircle, { status: 201 });
  } catch (error) {
    console.error('Error creating circle:', error);
    return NextResponse.json(
      { error: 'Failed to create circle' },
      { status: 500 }
    );
  }
} 