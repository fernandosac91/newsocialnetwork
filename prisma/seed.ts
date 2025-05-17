import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database...');
    
    // Create demo communities
    const communities = [
      { name: 'Bonn', description: 'City of Bonn community' },
      { name: 'Cologne', description: 'City of Cologne community' },
      { name: 'Dusseldorf', description: 'City of Dusseldorf community' },
    ];
    
    for (const community of communities) {
      const existing = await prisma.community.findFirst({
        where: { name: community.name },
      });
      
      if (!existing) {
        await prisma.community.create({
          data: community,
        });
        console.log(`Created community: ${community.name}`);
      } else {
        console.log(`Community ${community.name} already exists, skipping...`);
      }
    }
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 