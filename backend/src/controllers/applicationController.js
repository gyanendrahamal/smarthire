import prisma from '../config/db.js';
import { logApplicationEvent } from '../services/eventLogger.js';
import { createNotification } from '../services/notificationService.js';

export const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, resumeId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    // Check if job is closed or deadline passed
    if (job.status !== 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'This job opportunity is no longer accepting applications.' });
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'The application deadline for this position has passed.' });
    }

    // Prevent duplicate application
    const existingApp = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: req.user.id,
        },
      },
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an active application for this position.',
        applicationId: existingApp.id,
      });
    }

    // Determine resume: either uploaded now or selected existing
    let finalResumeId = resumeId || null;

    if (req.file) {
      const newResume = await prisma.resume.create({
        data: {
          candidateId: req.user.id,
          originalFilename: req.file.originalname,
          storageKey: req.file.filename,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
        },
      });
      finalResumeId = newResume.id;
    } else if (!finalResumeId) {
      // Use candidate's most recent resume if not explicitly selected
      const latestResume = await prisma.resume.findFirst({
        where: { candidateId: req.user.id },
        orderBy: { uploadedAt: 'desc' },
      });
      if (latestResume) {
        finalResumeId = latestResume.id;
      }
    }

    // 1. Create Application
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: req.user.id,
        resumeId: finalResumeId,
        coverLetter: coverLetter || null,
        status: 'SUBMITTED',
      },
      include: {
        job: {
          include: { company: true },
        },
        resume: true,
      },
    });

    // 2. Audit Event
    await logApplicationEvent({
      applicationId: application.id,
      actorId: req.user.id,
      eventType: 'SUBMITTED',
      previousStatus: null,
      newStatus: 'SUBMITTED',
      metadata: { appliedAt: new Date().toISOString() },
    });

    // 3. Candidate confirmation notification
    await createNotification({
      userId: req.user.id,
      type: 'APPLICATION_SUBMITTED',
      title: 'Application Submitted Successfully',
      message: `Your application for "${job.title}" at ${job.company.companyName} was submitted. You can track recruiter views and progress in your ATS dashboard.`,
      relatedApplicationId: application.id,
    });

    // 4. Notify company recruiters
    if (job.company.members?.length > 0) {
      for (const member of job.company.members) {
        await createNotification({
          userId: member.userId,
          type: 'APPLICATION_SUBMITTED',
          title: 'New Applicant Received',
          message: `${req.user.fullName} applied for ${job.title}.`,
          relatedApplicationId: application.id,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateApplications = async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        resume: true,
        views: {
          orderBy: { viewedAt: 'desc' },
        },
        interviews: {
          orderBy: { interviewDate: 'desc' },
        },
        events: {
          orderBy: { eventTimestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const enriched = applications.map((app) => {
      const isViewed = app.views.length > 0;
      const firstViewed = isViewed ? app.views[app.views.length - 1].viewedAt : null;
      const lastViewed = isViewed ? app.views[0].viewedAt : null;
      const viewCount = app.views.length;

      const activeInterview = app.interviews.find((i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED') || app.interviews[0] || null;

      const isDeadlinePassed = app.job.applicationDeadline
        ? new Date(app.job.applicationDeadline) < new Date()
        : false;

      const daysRemaining = app.job.applicationDeadline
        ? Math.max(0, Math.ceil((new Date(app.job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
        : null;

      return {
        id: app.id,
        jobId: app.job.id,
        jobTitle: app.job.title,
        companyName: app.job.company.companyName,
        companyLogo: app.job.company.logo,
        location: app.job.location,
        workMode: app.job.workMode,
        employmentType: app.job.employmentType,
        appliedAt: app.appliedAt,
        status: app.status,
        coverLetter: app.coverLetter,
        resume: app.resume,
        isViewed,
        firstViewedAt: firstViewed,
        lastViewedAt: lastViewed,
        viewCount,
        interview: activeInterview,
        isDeadlinePassed,
        daysRemaining,
        latestEvent: app.events[0] || null,
      };
    });

    res.json({ success: true, applications: enriched });
  } catch (error) {
    next(error);
  }
};

export const getApplicationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            profileImage: true,
            candidateProfile: true,
          },
        },
        resume: true,
        views: {
          orderBy: { viewedAt: 'asc' },
        },
        events: {
          orderBy: { eventTimestamp: 'asc' },
          include: {
            actor: {
              select: { id: true, fullName: true, role: true },
            },
          },
        },
        interviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            scheduler: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    // Role security check: candidate must be the owner, recruiter must belong to job company, or admin
    if (req.user.role === 'CANDIDATE' && application.candidateId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this application.' });
    }

    if (req.user.role === 'RECRUITER') {
      const member = await prisma.companyMember.findFirst({
        where: {
          userId: req.user.id,
          companyId: application.job.companyId,
        },
      });
      if (!member) {
        return res.status(403).json({ success: false, message: 'Unauthorized to access applications from other companies.' });
      }
    }

    const isViewed = application.views.length > 0;
    const firstViewedAt = isViewed ? application.views[0].viewedAt : null;
    const lastViewedAt = isViewed ? application.views[application.views.length - 1].viewedAt : null;

    res.json({
      success: true,
      application: {
        ...application,
        isViewed,
        firstViewedAt,
        lastViewedAt,
        viewCount: application.views.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: { include: { company: true } } },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.candidateId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (application.status === 'WITHDRAWN') {
      return res.status(400).json({ success: false, message: 'Application is already withdrawn' });
    }

    const previousStatus = application.status;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
      },
    });

    await logApplicationEvent({
      applicationId: id,
      actorId: req.user.id,
      eventType: 'WITHDRAWN',
      previousStatus,
      newStatus: 'WITHDRAWN',
      metadata: { reason: req.body.reason || 'Candidate withdrew application' },
    });

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      application: updated,
    });
  } catch (error) {
    next(error);
  }
};
