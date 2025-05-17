import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

// Initialize Prisma client
const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'fernandosac91@gmail.com';
  const password = 'erben123';
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      
      // Update the existing user to admin if not already
      if (existingUser.role !== 'ADMIN' || existingUser.status !== 'APPROVED') {
        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            role: 'ADMIN',
            status: 'APPROVED'
          }
        });
        console.log(`User ${updatedUser.email} updated to ADMIN role and APPROVED status.`);
      } else {
        console.log(`User ${existingUser.email} is already an ADMIN with APPROVED status.`);
      }
      
      return;
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the admin user
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Administrator',
        hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED',
      }
    });
    
    console.log(`Admin user created successfully: ${user.email}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser(); 