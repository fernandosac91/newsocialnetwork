const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Mock data
const communities = [
  { name: 'Bonn', description: 'Community for Bonn residents' },
  { name: 'Cologne', description: 'Community for Cologne residents' },
  { name: 'Düsseldorf', description: 'Community for Düsseldorf residents' }
];

// Helper to hash passwords
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function main() {
  console.log('Start seeding...');
  
  // Create communities
  const createdCommunities = [];
  
  for (const community of communities) {
    const createdCommunity = await prisma.community.create({
      data: community
    });
    createdCommunities.push(createdCommunity);
    console.log(`Created community: ${community.name}`);
  }
  
  // Create users with different roles and statuses
  const users = [
    // Admins
    {
      name: 'Admin User',
      email: 'admin@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'ADMIN',
      status: 'APPROVED',
      communityId: createdCommunities[0].id,
      stripeCustomerId: 'cus_mock_12345',
      stripeSubscriptionStatus: 'active'
    },
    // Moderators
    {
      name: 'Moderator Bonn',
      email: 'mod.bonn@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'MODERATOR',
      status: 'APPROVED',
      communityId: createdCommunities[0].id
    },
    {
      name: 'Moderator Cologne',
      email: 'mod.cologne@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'MODERATOR',
      status: 'APPROVED',
      communityId: createdCommunities[1].id
    },
    {
      name: 'Moderator Düsseldorf',
      email: 'mod.duesseldorf@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'MODERATOR',
      status: 'APPROVED',
      communityId: createdCommunities[2].id
    },
    // Facilitators
    {
      name: 'Facilitator User',
      email: 'facilitator@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'FACILITATOR',
      status: 'APPROVED',
      communityId: createdCommunities[1].id
    },
    // Regular members
    {
      name: 'Member User Bonn',
      email: 'member.bonn@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'MEMBER',
      status: 'APPROVED',
      communityId: createdCommunities[0].id
    },
    {
      name: 'Member User Cologne',
      email: 'member.cologne@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'MEMBER',
      status: 'APPROVED',
      communityId: createdCommunities[1].id
    },
    {
      name: 'Member User Düsseldorf',
      email: 'member.duesseldorf@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'MEMBER',
      status: 'APPROVED',
      communityId: createdCommunities[2].id
    },
    // Pending approval user
    {
      name: 'Pending User',
      email: 'pending@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'MEMBER',
      status: 'PENDING',
      communityId: createdCommunities[0].id
    },
    // Rejected user
    {
      name: 'Rejected User',
      email: 'rejected@example.com',
      hashedPassword: await hashPassword('password123'),
      role: 'MEMBER',
      status: 'REJECTED',
      communityId: createdCommunities[0].id
    }
  ];
  
  const createdUsers = [];
  
  for (const user of users) {
    const createdUser = await prisma.user.create({
      data: user
    });
    createdUsers.push(createdUser);
    console.log(`Created user: ${user.name} (${user.email})`);
    
    // Create profile for the user
    await prisma.userProfile.create({
      data: {
        userId: createdUser.id,
        bio: `This is ${user.name}'s bio`,
        workTitle: user.role === 'MEMBER' ? 'Community Member' : user.role.toLowerCase(),
        location: user.communityId ? communities.find(c => c.id === user.communityId)?.name : 'Unknown',
        interests: JSON.stringify(['networking', 'community', 'social'])
      }
    });
  }
  
  // Create events for each community
  const events = [];
  
  for (const community of createdCommunities) {
    // Get creator for this community (moderator or admin)
    const creator = createdUsers.find(u => 
      u.communityId === community.id && 
      (u.role === 'MODERATOR' || u.role === 'ADMIN')
    );
    
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
      const event = await prisma.event.create({
        data: eventData
      });
      events.push(event);
      console.log(`Created event: ${event.title}`);
      
      // Add some attendees
      const communityMembers = createdUsers.filter(
        u => u.communityId === community.id && u.status === 'APPROVED'
      );
      
      for (const member of communityMembers) {
        await prisma.eventAttendee.create({
          data: {
            eventId: event.id,
            userId: member.id
          }
        });
      }
    }
  }
  
  // Create circles for each community
  for (const community of createdCommunities) {
    // Get creator for this community (moderator or admin)
    const creator = createdUsers.find(u => 
      u.communityId === community.id && 
      (u.role === 'MODERATOR' || u.role === 'ADMIN')
    );
    
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
      const circle = await prisma.circle.create({
        data: circleData
      });
      console.log(`Created circle: ${circle.name}`);
      
      // Add some members
      const communityMembers = createdUsers.filter(
        u => u.communityId === community.id && u.status === 'APPROVED'
      );
      
      for (const member of communityMembers) {
        await prisma.circleMember.create({
          data: {
            circleId: circle.id,
            userId: member.id
          }
        });
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
  const approvedUsers = createdUsers.filter(u => u.status === 'APPROVED');
  for (let i = 0; i < approvedUsers.length - 1; i++) {
    await prisma.friend.create({
      data: {
        requesterId: approvedUsers[i].id,
        addresseeId: approvedUsers[i + 1].id,
        status: 'ACCEPTED'
      }
    });
    console.log(`Created friendship between ${approvedUsers[i].name} and ${approvedUsers[i + 1].name}`);
  }
  
  // Create some notifications
  for (const user of createdUsers.slice(0, 5)) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'CHAT',
        referenceId: 'mock-ref-id',
        read: false
      }
    });
    console.log(`Created notification for ${user.name}`);
  }
  
  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 