import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { taskSchema, taskUpdateSchema, validate } from '../lib/validation.js';
import { createError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.js';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Get all tasks for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { status, priority, search } = req.query;
    
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    // Transform to match frontend format
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase().replace('_', '-'),
      priority: task.priority.toLowerCase(),
      startDate: task.startDate.toISOString(),
      endDate: task.endDate.toISOString(),
      color: task.color,
      completedAt: task.completedAt?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      tags: task.tags.map(tt => ({
        id: tt.tag.id,
        name: tt.tag.name,
        color: tt.tag.color,
      })),
    }));
    
    res.json({ tasks: formattedTasks });
  } catch (error) {
    next(error);
  }
});

// Get a single task
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    
    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    if (!task) {
      throw createError('Task not found', 404);
    }
    
    res.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status.toLowerCase().replace('_', '-'),
        priority: task.priority.toLowerCase(),
        startDate: task.startDate.toISOString(),
        endDate: task.endDate.toISOString(),
        color: task.color,
        completedAt: task.completedAt?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        tags: task.tags.map(tt => ({
          id: tt.tag.id,
          name: tt.tag.name,
          color: tt.tag.color,
        })),
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create a new task
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = validate(taskSchema, req.body);
    const userId = req.userId!;
    
    // Verify tags exist
    ?if (data.tagIds!.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: { id: { in: data.tagIds } }
      });
      
      if (existingTags.length !== data.tagIds!.length) {
        throw createError('One or more tags not found', 400);
      }
    }
    
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        color: data.color,
        userId,
        tags: {
          create: data.tagIds! ?? []).map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    // Set completedAt if status is DONE
    if (data.status === 'DONE') {
      await prisma.task.update({
        where: { id: task.id },
        data: { completedAt: new Date() }
      });
    }
    
    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status.toLowerCase().replace('_', '-'),
        priority: task.priority.toLowerCase(),
        startDate: task.startDate.toISOString(),
        endDate: task.endDate.toISOString(),
        color: task.color,
        completedAt: task.completedAt?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
        tags: task.tags.map(tt => ({
          id: tt.tag.id,
          name: tt.tag.name,
          color: tt.tag.color,
        })),
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update a task
router.patch('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = validate(taskUpdateSchema, req.body);
    const userId = req.userId!;
    
    // Check task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    });
    
    if (!existingTask) {
      throw createError('Task not found', 404);
    }
    
    // Build update data
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    
    // Handle completedAt
    if (data.status === 'DONE' && existingTask.status !== 'DONE') {
      updateData.completedAt = new Date();
    } else if (data.status !== 'DONE' && existingTask.status === 'DONE') {
      updateData.completedAt = null;
    }
    
    // Handle tags update
    if (data.tagIds !== undefined) {
      // Delete existing tags
      await prisma.taskTag.deleteMany({
        where: { taskId: id }
      });
      
      // Create new tag associations
      if (data.tagIds.length > 0) {
        await prisma.taskTag.createMany({
          data: data.tagIds.map(tagId => ({
            taskId: id,
            tagId
          }))
        });
      }
    }
    
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    res.json({
      message: 'Task updated successfully',
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status.toLowerCase().replace('_', '-'),
        priority: task.priority.toLowerCase(),
        startDate: task.startDate.toISOString(),
        endDate: task.endDate.toISOString(),
        color: task.color,
        completedAt: task.completedAt?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        tags: task.tags.map(tt => ({
          id: tt.tag.id,
          name: tt.tag.name,
          color: tt.tag.color,
        })),
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    
    // Check task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId }
    });
    
    if (!existingTask) {
      throw createError('Task not found', 404);
    }
    
    await prisma.task.delete({
      where: { id }
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as taskRouter };