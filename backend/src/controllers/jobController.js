import prisma from '../config/db.js';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().trim().min(1, 'Job title is required'),
  description: z.string().trim().min(1, 'Job description is required'),
  location: z.string().trim().min(1, 'Location is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).default('FULL_TIME'),
  workMode: z.enum(['ON_SITE', 'HYBRID', 'REMOTE']).default('ON_SITE'),
  salaryMin: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v)),
    z.number().nullable().optional()
  ),
  salaryMax: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v)),
    z.number().nullable().optional()
  ),
  experienceLevel: z.string().nullish().default(''),
  requirements: z.string().nullish().default(''),
  vacancies: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? 1 : Math.max(1, parseInt(v, 10))),
    z.number().int().positive().default(1)
  ),
  applicationDeadline: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).default('PUBLISHED'),
});

export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      workMode,
      employmentType,
      experienceLevel,
      minSalary,
      sort = 'newest',
      page = 1,
      limit = 50,
    } = req.query;

    const where = {
      status: 'PUBLISHED',
    };

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { title: { contains: s } },
        { description: { contains: s } },
        { requirements: { contains: s } },
        { location: { contains: s } },
        { company: { companyName: { contains: s } } },
        { company: { industry: { contains: s } } },
      ];
    }

    if (location && location.trim()) {
      const loc = location.trim();
      if (loc.toLowerCase().includes('remote')) {
        const remoteConditions = [
          { workMode: 'REMOTE' },
          { location: { contains: 'Remote' } },
        ];
        if (where.OR) {
          where.AND = [
            { OR: where.OR },
            { OR: remoteConditions },
          ];
          delete where.OR;
        } else {
          where.OR = remoteConditions;
        }
      } else {
        const locConditions = [
          { location: { contains: loc } },
          { company: { location: { contains: loc } } },
        ];
        if (where.OR) {
          where.AND = [
            { OR: where.OR },
            { OR: locConditions },
          ];
          delete where.OR;
        } else {
          where.OR = locConditions;
        }
      }
    }

    if (workMode && workMode !== 'ALL') {
      where.workMode = workMode;
    }

    if (employmentType && employmentType !== 'ALL') {
      where.employmentType = employmentType;
    }

    if (experienceLevel && experienceLevel !== 'ALL') {
      where.experienceLevel = { contains: experienceLevel };
    }

    if (minSalary) {
      where.salaryMax = { gte: parseFloat(minSalary) };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'deadline') {
      orderBy = { applicationDeadline: 'asc' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        include: {
          company: true,
          _count: {
            select: { applications: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
    ]);

    // Check saved or applied if candidate is logged in
    let candidateSavedJobIds = new Set();
    let candidateAppliedJobIds = new Set();

    if (req.user?.role === 'CANDIDATE') {
      const [saved, applied] = await Promise.all([
        prisma.savedJob.findMany({
          where: { candidateId: req.user.id },
          select: { jobId: true },
        }),
        prisma.application.findMany({
          where: { candidateId: req.user.id },
          select: { jobId: true },
        }),
      ]);
      saved.forEach((s) => candidateSavedJobIds.add(s.jobId));
      applied.forEach((a) => candidateAppliedJobIds.add(a.jobId));
    }

    const enrichedJobs = jobs.map((job) => ({
      ...job,
      isSaved: candidateSavedJobIds.has(job.id),
      hasApplied: candidateAppliedJobIds.has(job.id),
      isExpired: job.applicationDeadline ? new Date(job.applicationDeadline) < new Date() : false,
      daysRemaining: job.applicationDeadline
        ? Math.max(0, Math.ceil((new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
        : null,
    }));

    res.json({
      success: true,
      data: enrichedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        poster: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opportunity not found.' });
    }

    let isSaved = false;
    let application = null;

    if (req.user?.role === 'CANDIDATE') {
      const [savedRecord, appRecord] = await Promise.all([
        prisma.savedJob.findUnique({
          where: {
            candidateId_jobId: {
              candidateId: req.user.id,
              jobId: job.id,
            },
          },
        }),
        prisma.application.findUnique({
          where: {
            jobId_candidateId: {
              jobId: job.id,
              candidateId: req.user.id,
            },
          },
          include: {
            interviews: true,
          },
        }),
      ]);

      isSaved = !!savedRecord;
      application = appRecord;
    }

    const isExpired = job.applicationDeadline ? new Date(job.applicationDeadline) < new Date() : false;
    const daysRemaining = job.applicationDeadline
      ? Math.max(0, Math.ceil((new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
      : null;

    res.json({
      success: true,
      job: {
        ...job,
        isSaved,
        application,
        isExpired,
        daysRemaining,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const data = jobSchema.parse(req.body);

    const membership = await prisma.companyMember.findFirst({
      where: { userId: req.user.id },
      include: { company: true },
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'You must be associated with a company to post jobs.' });
    }

    const job = await prisma.job.create({
      data: {
        companyId: membership.companyId,
        postedBy: req.user.id,
        title: data.title,
        description: data.description,
        location: data.location,
        employmentType: data.employmentType,
        workMode: data.workMode,
        salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
        experienceLevel: data.experienceLevel || null,
        requirements: data.requirements || null,
        vacancies: data.vacancies || 1,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        status: data.status,
      },
      include: {
        company: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingJob = await prisma.job.findUnique({
      where: { id },
      include: { company: { include: { members: true } } },
    });

    if (!existingJob) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const isMember = existingJob.company.members.some((m) => m.userId === req.user.id);
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this job listing.' });
    }

    const {
      title,
      description,
      location,
      employmentType,
      workMode,
      salaryMin,
      salaryMax,
      experienceLevel,
      requirements,
      vacancies,
      applicationDeadline,
      status,
    } = req.body;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        location,
        employmentType,
        workMode,
        salaryMin: salaryMin !== undefined ? (salaryMin ? parseFloat(salaryMin) : null) : undefined,
        salaryMax: salaryMax !== undefined ? (salaryMax ? parseFloat(salaryMax) : null) : undefined,
        experienceLevel,
        requirements,
        vacancies: vacancies !== undefined ? parseInt(vacancies) : undefined,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
        status,
      },
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSaveJob = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;

    const existing = await prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: req.user.id,
          jobId,
        },
      },
    });

    if (existing) {
      await prisma.savedJob.delete({
        where: { id: existing.id },
      });
      return res.json({ success: true, saved: false, message: 'Job removed from saved list' });
    } else {
      await prisma.savedJob.create({
        data: {
          candidateId: req.user.id,
          jobId,
        },
      });
      return res.json({ success: true, saved: true, message: 'Job saved to your shortlist' });
    }
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: {
          include: {
            company: true,
            _count: { select: { applications: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    const jobs = saved.map((s) => ({
      ...s.job,
      isSaved: true,
      savedAt: s.savedAt,
      isExpired: s.job.applicationDeadline ? new Date(s.job.applicationDeadline) < new Date() : false,
      daysRemaining: s.job.applicationDeadline
        ? Math.max(0, Math.ceil((new Date(s.job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
        : null,
    }));

    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};
