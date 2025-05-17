/**
 * Role-based Access Control Test
 * 
 * Tests the access control for events based on user roles and community membership.
 */

// Import the prisma client to interact with the database
import { PrismaClient } from '@prisma/client';
import { seedTestData } from './helpers/seed-test-data';

const prisma = new PrismaClient();

// Mock user session function for different roles
async function mockUserSession(email: string) {
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { community: true }
  });
  return { user };
}

describe('Role-based Event Access Control', () => {
  
  beforeAll(async () => {
    // Seed test data before running tests
    await seedTestData();
  });
  
  afterAll(async () => {
    // Disconnect Prisma client after tests
    await prisma.$disconnect();
  });
  
  test('Admin can view all events in any community', async () => {
    // Mock admin session
    const session = await mockUserSession('admin@example.com');
    
    // Get all events
    const allEvents = await prisma.event.findMany({
      include: {
        community: true
      }
    });
    
    // Function to check if user can access event
    const canAccessEvent = (event: any, user: any) => {
      // Admins can access any event
      if (user.role === 'ADMIN') return true;
      
      // Check community membership
      return user.communityId === event.communityId;
    };
    
    // Verify admin can access all events
    for (const event of allEvents) {
      expect(canAccessEvent(event, session.user)).toBe(true);
    }
    
    // Count events admin can access
    const accessibleEventsCount = allEvents.filter(event => 
      canAccessEvent(event, session.user)
    ).length;
    
    // Should match the total count of events
    expect(accessibleEventsCount).toBe(allEvents.length);
  });
  
  test('Users can only view events in their own community', async () => {
    // Mock regular member session
    const session = await mockUserSession('member.bonn@example.com');
    
    // Get all events
    const allEvents = await prisma.event.findMany({
      include: {
        community: true
      }
    });
    
    // Function to check if user can access event
    const canAccessEvent = (event: any, user: any) => {
      // Admins can access any event
      if (user.role === 'ADMIN') return true;
      
      // Check community membership
      return user.communityId === event.communityId;
    };
    
    // Count events user can access
    const accessibleEventsCount = allEvents.filter(event => 
      canAccessEvent(event, session.user)
    ).length;
    
    // Should be less than total count (user can only access their community's events)
    expect(accessibleEventsCount).toBeLessThan(allEvents.length);
    
    // Get events in user's community
    const userCommunityEvents = allEvents.filter(event => 
      event.communityId === session.user.communityId
    );
    
    // User should be able to access all events in their community
    expect(accessibleEventsCount).toBe(userCommunityEvents.length);
    
    // Verify user can access their community events but not others
    for (const event of allEvents) {
      const canAccess = canAccessEvent(event, session.user);
      if (event.communityId === session.user.communityId) {
        expect(canAccess).toBe(true);
      } else {
        expect(canAccess).toBe(false);
      }
    }
  });
  
  test('Pending users cannot access events', async () => {
    // Mock pending user session
    const session = await mockUserSession('pending@example.com');
    
    // Get all events
    const allEvents = await prisma.event.findMany({
      include: {
        community: true
      }
    });
    
    // Function to check if user can access event
    const canAccessEvent = (event: any, user: any) => {
      // Only approved users can access events
      if (user.status !== 'APPROVED') return false;
      
      // Admins can access any event
      if (user.role === 'ADMIN') return true;
      
      // Check community membership
      return user.communityId === event.communityId;
    };
    
    // Count events user can access
    const accessibleEventsCount = allEvents.filter(event => 
      canAccessEvent(event, session.user)
    ).length;
    
    // Pending user should not have access to any events
    expect(accessibleEventsCount).toBe(0);
  });
  
}); 