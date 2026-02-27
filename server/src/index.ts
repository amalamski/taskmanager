import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { taskRouter } from './routes/tasks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Постави това някъде след инициализацията на Prisma клиента
// Постави това след инициализацията на prisma (const prisma = new PrismaClient())
async function seedTags() {
  const defaultTags = [
    { id: '1', name: 'Frontend', color: '#3B82F6' },
    { id: '2', name: 'Backend', color: '#10B981' },
    { id: '3', name: 'Design', color: '#F59E0B' },
    { id: '4', name: 'Bug', color: '#EF4444' },
    { id: '5', name: 'Feature', color: '#8B5CF6' },
    { id: '6', name: 'Documentation', color: '#6B7280' },
    { id: '7', name: 'Testing', color: '#EC4899' },
    { id: '8', name: 'DevOps', color: '#06B6D4' },
  ];

  console.log('🌱 Seeding tags...');
  for (const tag of defaultTags) {
    await (prisma as any).tag.upsert({
      where: { id: tag.id },
      update: {},
      create: tag,
    });
  }
  console.log('✅ Tags seeded successfully');
}

// Извикай я веднага
seedTags().catch(err => console.error('Tag seeding failed:', err));
// Извикай функцията при стартиране
seedTags().catch(console.error);
// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://taskmanager-flame-gamma.vercel.app',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;