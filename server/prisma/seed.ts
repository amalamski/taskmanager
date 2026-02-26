import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default tags
  const tags = [
    { name: 'Frontend', color: '#3B82F6' },
    { name: 'Backend', color: '#10B981' },
    { name: 'Design', color: '#F59E0B' },
    { name: 'Bug', color: '#EF4444' },
    { name: 'Feature', color: '#8B5CF6' },
    { name: 'Documentation', color: '#6B7280' },
    { name: 'Testing', color: '#EC4899' },
    { name: 'DevOps', color: '#06B6D4' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }

  console.log('✅ Tags created');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@taskflow.com' },
    update: {},
    create: {
      email: 'demo@taskflow.com',
      passwordHash: hashedPassword,
      name: 'Demo User',
      avatar: 'DU',
      color: '#8B5CF6',
      role: 'USER',
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create sample tasks for demo user
  const tagRecords = await prisma.tag.findMany();
  const tagMap = new Map(tagRecords.map(t => [t.name, t.id]));

  const tasks = [
    {
      title: 'Design new dashboard',
      description: 'Create wireframes and mockups for the new dashboard interface',
      status: 'TODO',
      priority: 'HIGH',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      color: '#8B5CF6',
      tagNames: ['Design', 'Frontend'],
    },
    {
      title: 'Implement user authentication',
      description: 'Set up OAuth2 and JWT authentication flow',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      color: '#06B6D4',
      tagNames: ['Backend', 'Feature'],
    },
    {
      title: 'Fix navigation bug',
      description: 'Navigation menu not closing on mobile devices',
      status: 'REVIEW',
      priority: 'MEDIUM',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      color: '#EF4444',
      tagNames: ['Bug', 'Frontend'],
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST API endpoints with examples',
      status: 'DONE',
      priority: 'LOW',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      color: '#10B981',
      tagNames: ['Documentation'],
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: 'TODO',
      priority: 'MEDIUM',
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      color: '#F59E0B',
      tagNames: ['DevOps'],
    },
    {
      title: 'Responsive design review',
      description: 'Test and fix responsive issues across all pages',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      color: '#EC4899',
      tagNames: ['Frontend', 'Design'],
    },
  ];

  for (const taskData of tasks) {
    const { tagNames, ...taskFields } = taskData;
    
    const task = await prisma.task.create({
      data: {
        ...taskFields,
        userId: demoUser.id,
        tags: {
          create: tagNames
            .map(name => tagMap.get(name))
            .filter((id): id is string => !!id)
            .map(tagId => ({
              tag: { connect: { id: tagId } }
            }))
        }
      },
    });

    console.log('✅ Task created:', task.title);
  }

  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email: demo@taskflow.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });