import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db.js';
import { config } from '../config/env.js';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CANDIDATE', 'RECRUITER', 'ADMIN']).default('CANDIDATE'),
  phone: z.string().optional(),
  // For recruiters:
  companyName: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyLocation: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        phone: data.phone || null,
        accountStatus: 'ACTIVE',
      },
    });

    if (data.role === 'CANDIDATE') {
      await prisma.candidateProfile.create({
        data: {
          userId: newUser.id,
          skills: JSON.stringify([]),
        },
      });
    } else if (data.role === 'RECRUITER') {
      const company = await prisma.company.create({
        data: {
          companyName: data.companyName || `${data.fullName}'s Company`,
          industry: data.companyIndustry || 'Technology',
          location: data.companyLocation || 'United States',
          verificationStatus: 'PENDING',
        },
      });

      await prisma.companyMember.create({
        data: {
          companyId: company.id,
          userId: newUser.id,
          memberRole: 'ADMIN',
        },
      });
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const userWithDetails = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        candidateProfile: true,
        companyMembers: { include: { company: true } },
      },
    });

    delete userWithDetails.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        candidateProfile: true,
        companyMembers: { include: { company: true } },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Contact support.' });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: true,
        companyMembers: { include: { company: true } },
        resumes: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    delete user.passwordHash;
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, headline, location, skills, bio, education, experience } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName || req.user.fullName,
        phone: phone !== undefined ? phone : req.user.phone,
      },
    });

    if (req.user.role === 'CANDIDATE') {
      await prisma.candidateProfile.upsert({
        where: { userId: req.user.id },
        update: {
          headline,
          location,
          bio,
          skills: skills ? (typeof skills === 'object' ? JSON.stringify(skills) : skills) : undefined,
          education: education ? (typeof education === 'object' ? JSON.stringify(education) : education) : undefined,
          experience: experience ? (typeof experience === 'object' ? JSON.stringify(experience) : experience) : undefined,
        },
        create: {
          userId: req.user.id,
          headline,
          location,
          bio,
          skills: skills ? (typeof skills === 'object' ? JSON.stringify(skills) : skills) : JSON.stringify([]),
        },
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: true,
        companyMembers: { include: { company: true } },
      },
    });
    delete updated.passwordHash;

    res.json({ success: true, message: 'Profile updated successfully', user: updated });
  } catch (error) {
    next(error);
  }
};

export const uploadCandidateResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or file not a valid PDF' });
    }

    const resume = await prisma.resume.create({
      data: {
        candidateId: req.user.id,
        originalFilename: req.file.originalname,
        storageKey: req.file.filename,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateResumes = async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { candidateId: req.user.id },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({ success: true, resumes });
  } catch (error) {
    next(error);
  }
};
