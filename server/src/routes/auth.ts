import bcrypt from 'bcrypt';
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../lib/jwt.js';
import { loginSchema, registerSchema, validate } from '../lib/validation.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = validate(registerSchema, req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw createError('User with this email already exists', 409);
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    // Generate avatar initials
    const avatar = data.name 
      ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : data.email.slice(0, 2).toUpperCase();
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name || null,
        avatar,
        color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        color: true,
        role: true,
        createdAt: true,
      }
    });
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = validate(loginSchema, req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (!user) {
      throw createError('Invalid email or password', 401);
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    
    if (!isValidPassword) {
      throw createError('Invalid email or password', 401);
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Authentication required', 401);
    }
    
    const token = authHeader.substring(7);
    const { verifyToken } = await import('../lib/jwt.js');
    const payload = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        color: true,
        role: true,
        createdAt: true,
      }
    });
    
    if (!user) {
      throw createError('User not found', 404);
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };