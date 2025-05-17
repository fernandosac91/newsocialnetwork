import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Enum values as constant objects instead of TypeScript enums
const UserRole = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  FACILITATOR: 'FACILITATOR',
  MEMBER: 'MEMBER'
} as const;

const UserStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

const FriendStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const;

const NotificationType = {
  EVENT_INVITE: 'EVENT_INVITE',
  CIRCLE_JOIN: 'CIRCLE_JOIN',
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  CHAT: 'CHAT'
} as const;

// Mock data
const communities = [
  { name: 'Bonn', description: 'Community for Bonn residents' },
  { name: 'Cologne', description: 'Community for Cologne residents' },
  { name: 'Düsseldorf', description: 'Community for Düsseldorf residents' }
];

// Helper to hash passwords
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Community interface
interface Community {
  id: string;
  name: string;
  description: string | null;
  createdAt?: Date;
}

// User interface
interface User {
  id: string;
  name: string | null;
  email: string;
  communityId: string | null;
  role: string;
  status: string;
  [key: string]: any;
}

async function main() {
  try {
    console.log('🌱 Seeding database...');

    // First, clean the database (in testing environments only)
    // Uncomment these lines when running in a test environment
    /*
    console.log('Cleaning database...');
    await prisma.notification.deleteMany({});
    await prisma.friend.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.circleMember.deleteMany({});
    await prisma.circle.deleteMany({});
    await prisma.eventAttendee.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.userProfile.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.file.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.community.deleteMany({});
    await prisma.adminLog.deleteMany({});
    console.log('Database cleaned');
    */

    // Create communities
    const createdCommunities: Community[] = [];
    
    for (const community of communities) {
      const existingCommunity = await prisma.community.findFirst({
        where: { name: community.name }
      });
      
      if (existingCommunity) {
        createdCommunities.push(existingCommunity);
        console.log(`Community already exists: ${community.name}`);
      } else {
        const createdCommunity = await prisma.community.create({
          data: community
        });
        createdCommunities.push(createdCommunity);
        console.log(`Created community: ${community.name}`);
      }
    }
    
    // Create users with different roles and statuses
    const users = [
      // Admins
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
        status: UserStatus.APPROVED,
        communityId: createdCommunities[0].id,
        stripeCustomerId: 'cus_mock_12345',
        stripeSubscriptionStatus: 'active'
      },
      // Moderators
      {
        name: 'Moderator Bonn',
        email: 'mod.bonn@example.com',
        password: 'password123',
        role: UserRole.MODERATOR,
        status: UserStatus.APPROVED,
        communityId: createdCommunities[0].id
      },
      {
        name: 'Moderator Cologne',
        email: 'mod.cologne@example.com',
        password: 'password123',
        role: UserRole.MODERATOR,
        status: UserStatus.APPROVED,
        communityId: createdCommunities[1].id
      },
      {
        name: 'Moderator Düsseldorf',
        email: 'mod.duesseldorf@example.com',
        password: 'password123',
        role: UserRole.MODERATOR,
        status: UserStatus.APPROVED,
        communityId: createdCommunities[2].id
      },
      // Facilitators
      {
        name: 'Facilitator User',
        email: 'facilitator@example.com',
        password: 'password123',
        role: UserRole.FACILITATOR,
        status: UserStatus.APPROVED,
        communityId: createdCommunities[1].id
      },
      // Regular members
      {
        name: 'Member User Bonn',
        email: 'member.bonn@example.com',
        password: 'password123',
        role: UserRole.MEMBER,
        status: UserStatus.APPROVED,
        communityId: createdCommunities[0].id
      },
      {
        name: 'Member User Cologne',
        email: 'member.cologne@example.com',
        password: 'password123',
        role: UserRole.MEMBER,
        status: UserStatus.APPROVED,
        communityId: createdCommunities[1].id
      },
      {
        name: 'Member User Düsseldorf',
        email: 'member.duesseldorf@example.com',
        password: 'password123',
        role: UserRole.MEMBER,
        status: UserStatus.APPROVED,
        communityId: createdCommunities[2].id
      },
      // Pending approval user
      {
        name: 'Pending User',
        email: 'pending@example.com',
        password: 'password123',
        role: UserRole.MEMBER,
        status: UserStatus.PENDING,
        communityId: createdCommunities[0].id
      },
      // Rejected user
      {
        name: 'Rejected User',
        email: 'rejected@example.com',
        password: 'password123',
        role: UserRole.MEMBER,
        status: UserStatus.REJECTED,
        communityId: createdCommunities[0].id
      }
    ];
    
    const createdUsers: User[] = [];
    
    for (const user of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });
      
      if (existingUser) {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${user.name} (${user.email})`);
      } else {
        const hashedPassword = await hashPassword(user.password);
        
        const createdUser = await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            hashedPassword,
            role: user.role,
            status: user.status,
            communityId: user.communityId,
            stripeCustomerId: user.stripeCustomerId,
            stripeSubscriptionStatus: user.stripeSubscriptionStatus,
            emailVerified: new Date()
          }
        });
        
        createdUsers.push(createdUser);
        console.log(`Created user: ${user.name} (${user.email})`);
        
        // Create profile for the user
        await prisma.userProfile.create({
          data: {
            userId: createdUser.id,
            bio: `This is ${user.name}'s bio`,
            workTitle: user.role === UserRole.MEMBER ? 'Community Member' : user.role.toLowerCase(),
            location: user.communityId ? communities.find(c => c.name === createdCommunities.find(cc => cc.id === user.communityId)?.name)?.name : 'Unknown',
            interests: JSON.stringify(['networking', 'community', 'social'])
          }
        });
      }
    }
    
    // Create events for each community
    const events = [];
    
    for (const community of createdCommunities) {
      // Get creator for this community (moderator or admin)
      const creator = createdUsers.find(u => 
        u.communityId === community.id && 
        (u.role === UserRole.MODERATOR || u.role === UserRole.ADMIN)
      );
      
      if (!creator) continue;
      
      // Create 3 events per community
      const communityEvents = [
        {
          title: `${community.name} Networking Meetup`,
          description: `Join us for networking in ${community.name}`,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          location: `${community.name} City Center`,
          communityId: community.id,
          createdById: creator.id
        },
        {
          title: `${community.name} Workshop`,
          description: `Skill-building workshop in ${community.name}`,
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          location: `${community.name} Conference Hall`,
          communityId: community.id,
          createdById: creator.id
        },
        {
          title: `${community.name} Social Gathering`,
          description: `Casual social gathering in ${community.name}`,
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
          location: `${community.name} Park`,
          communityId: community.id,
          createdById: creator.id
        }
      ];
      
      for (const eventData of communityEvents) {
        // Check if event already exists
        const existingEvent = await prisma.event.findFirst({
          where: { 
            title: eventData.title,
            communityId: eventData.communityId
          }
        });
        
        if (existingEvent) {
          events.push(existingEvent);
          console.log(`Event already exists: ${eventData.title}`);
          continue;
        }
        
        const event = await prisma.event.create({
          data: eventData
        });
        
        events.push(event);
        console.log(`Created event: ${event.title}`);
        
        // Add some attendees
        const communityMembers = createdUsers.filter(
          u => u.communityId === community.id && u.status === UserStatus.APPROVED
        );
        
        for (const member of communityMembers) {
          // Check if already an attendee
          const isAttendee = await prisma.eventAttendee.findUnique({
            where: {
              eventId_userId: {
                eventId: event.id,
                userId: member.id
              }
            }
          });
          
          if (!isAttendee) {
            await prisma.eventAttendee.create({
              data: {
                eventId: event.id,
                userId: member.id
              }
            });
          }
        }
      }
    }
    
    // Create circles for each community
    for (const community of createdCommunities) {
      // Get creator for this community (moderator or admin)
      const creator = createdUsers.find(u => 
        u.communityId === community.id && 
        (u.role === UserRole.MODERATOR || u.role === UserRole.ADMIN)
      );
      
      if (!creator) continue;
      
      // Create 2 circles per community
      const communityCircles = [
        {
          name: `${community.name} Interest Group`,
          description: `A circle for ${community.name} interest discussions`,
          communityId: community.id,
          createdById: creator.id
        },
        {
          name: `${community.name} Project Team`,
          description: `A circle for ${community.name} project collaboration`,
          communityId: community.id,
          createdById: creator.id
        }
      ];
      
      for (const circleData of communityCircles) {
        // Check if circle already exists
        const existingCircle = await prisma.circle.findFirst({
          where: { 
            name: circleData.name,
            communityId: circleData.communityId
          }
        });
        
        if (existingCircle) {
          console.log(`Circle already exists: ${circleData.name}`);
          continue;
        }
        
        const circle = await prisma.circle.create({
          data: circleData
        });
        
        console.log(`Created circle: ${circle.name}`);
        
        // Add some members
        const communityMembers = createdUsers.filter(
          u => u.communityId === community.id && u.status === UserStatus.APPROVED
        );
        
        for (const member of communityMembers) {
          // Check if already a member
          const isMember = await prisma.circleMember.findUnique({
            where: {
              circleId_userId: {
                circleId: circle.id,
                userId: member.id
              }
            }
          });
          
          if (!isMember) {
            await prisma.circleMember.create({
              data: {
                circleId: circle.id,
                userId: member.id
              }
            });
          }
        }
        
        // Add a few sample messages
        await prisma.chatMessage.create({
          data: {
            content: `Welcome to the ${circle.name}!`,
            senderId: creator.id,
            circleId: circle.id
          }
        });
      }
    }
    
    // Create some friend relationships
    const approvedUsers = createdUsers.filter(u => u.status === UserStatus.APPROVED);
    for (let i = 0; i < approvedUsers.length - 1; i++) {
      // Check if friendship already exists
      const existingFriendship = await prisma.friend.findFirst({
        where: {
          OR: [
            {
              requesterId: approvedUsers[i].id,
              addresseeId: approvedUsers[i + 1].id
            },
            {
              requesterId: approvedUsers[i + 1].id,
              addresseeId: approvedUsers[i].id
            }
          ]
        }
      });
      
      if (!existingFriendship) {
        await prisma.friend.create({
          data: {
            requesterId: approvedUsers[i].id,
            addresseeId: approvedUsers[i + 1].id,
            status: FriendStatus.ACCEPTED
          }
        });
        console.log(`Created friendship between ${approvedUsers[i].name} and ${approvedUsers[i + 1].name}`);
      }
    }
    
    // Create some notifications
    for (const user of createdUsers.slice(0, 5)) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.CHAT,
          referenceId: 'mock-ref-id',
          read: false
        }
      });
      console.log(`Created notification for ${user.name}`);
    }

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 