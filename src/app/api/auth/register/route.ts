import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { initializeUserTrial } from '@/lib/billing/trial-service';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        status: 'PENDING',
        role: 'MEMBER',
        photo: '/images/default-avatar.png', // Default avatar
        profile: {
          create: {
            bio: '',
            workTitle: '',
            location: '',
            interests: JSON.stringify([]),
          },
        },
      },
    });

    // Initialize trial period for the new user
    try {
      await initializeUserTrial(user.id);
    } catch (trialError) {
      console.error('Error initializing trial:', trialError);
      // Continue even if trial initialization fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
        }
      },
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}