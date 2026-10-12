import prisma from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logApplicationEvent } from '../services/eventLogger.js';
import { createNotification } from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get company for recruiter
const getRecruiterCompany = async (userId) => {
  const membership = await prisma.companyMember.findFirst({
    where: { userId },
    include: { company: true },
  });
  return membership?.company || null;
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const company = await getRecruiterCompany(req.user.id);
    if (!company) {
      return res.status(403).json({ success: false, message: 'No company associated with this recruiter.' });
    }
    res.json({ success: true, company });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  try {
    const company = await getRecruiterCompany(req.user.id);
    if (!company) {
      return res.status(403).json({ success: false, message: 'No company associated with this recruiter.' });
    }

    const { companyName, description, industry, website, location, logo, companySize, foundedYear, benefits } = req.body;

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        companyName: companyName || company.companyName,
        description: description !== undefined ? description : company.description,
        industry: industry !== undefined ? industry : company.industry,
        website: website !== undefined ? website : company.website,
        location: location !== undefined ? location : company.location,
        logo: logo !== undefined ? logo : company.logo,
        companySize: companySize !== undefined ? companySize : company.companySize,
        foundedYear: foundedYear !== undefined ? foundedYear : company.foundedYear,
        benefits: benefits !== undefined ? benefits : company.benefits,
      },
    });

    res.json({ success: true, message: 'Company information updated successfully', company: updated });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterDashboardStats = async (req, res, next) => {
  try {
    const company = await getRecruiterCompany(req.user.id);
    if (!company) {
      return res.status(403).json({ success: false, message: 'No company associated with this account.' });
    }

    const [activeJobs, totalApplications, shortlisted, interviewsScheduled, hired, pendingReview] = await Promise.all([
      prisma.job.count({
        where: { companyId: company.id, status: 'PUBLISHED' },
      }),
      prisma.application.count({
        where: { job: { companyId: company.id } },
      }),
      prisma.application.count({
        where: { job: { companyId: company.id }, status: 'SHORTLISTED' },
      }),
      prisma.interview.count({
        where: { application: { job: { companyId: company.id } }, status: 'SCHEDULED' },
      }),
      prisma.application.count({
        where: { job: { companyId: company.id }, status: 'HIRED' },
      }),
      prisma.application.count({
        where: { job: { companyId: company.id }, status: 'SUBMITTED' },
      }),
    ]);

    res.json({
      success: true,
      company,
      stats: {
        activeJobs,
        totalApplications,
        shortlisted,
        interviewsScheduled,
        hired,
        pendingReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterJobs = async (req, res, next) => {
  try {
    const company = await getRecruiterCompany(req.user.id);
    if (!company) {
      return res.status(403).json({ success: false, message: 'No company association found.' });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterApplications = async (req, res, next) => {
  try {
    const company = await getRecruiterCompany(req.user.id);
    if (!company) {
      return res.status(403).json({ success: false, message: 'No company association found.' });
    }

    const { jobId, status, search } = req.query;

    const where = {
      job: {
        companyId: company.id,
      },
    };

    if (jobId) {
      where.jobId = jobId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.candidate = {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
        ],
      };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: true,
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
          orderBy: { viewedAt: 'desc' },
        },
        interviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const formatted = applications.map((app) => ({
      ...app,
      isViewed: app.views.length > 0,
      firstViewedAt: app.views.length > 0 ? app.views[app.views.length - 1].viewedAt : null,
      lastViewedAt: app.views.length > 0 ? app.views[0].viewedAt : null,
      viewCount: app.views.length,
      activeInterview: app.interviews.find((i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED') || null,
    }));

    res.json({ success: true, applications: formatted });
  } catch (error) {
    next(error);
  }
};

// Open and genuinely track application view
export const viewApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await getRecruiterCompany(req.user.id);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: { include: { company: true } },
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
          orderBy: { viewedAt: 'desc' },
        },
        events: {
          orderBy: { eventTimestamp: 'asc' },
          include: {
            actor: { select: { id: true, fullName: true, role: true } },
          },
        },
        interviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.companyId !== company?.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view applications of other companies.' });
    }

    // Authentic view tracking:
    // Only register a new view if there wasn't one from this recruiter in the last 2 minutes
    const recentView = await prisma.applicationView.findFirst({
      where: {
        applicationId: application.id,
        recruiterId: req.user.id,
        viewType: 'APPLICATION_OPENED',
        viewedAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000),
        },
      },
    });

    let viewRecorded = false;
    let newViewRecord = null;

    if (!recentView) {
      newViewRecord = await prisma.applicationView.create({
        data: {
          applicationId: application.id,
          recruiterId: req.user.id,
          viewType: 'APPLICATION_OPENED',
          viewedAt: new Date(),
        },
      });
      viewRecorded = true;

      // Log event to timeline
      await logApplicationEvent({
        applicationId: application.id,
        actorId: req.user.id,
        eventType: 'VIEWED',
        previousStatus: application.status,
        newStatus: application.status,
        metadata: {
          recruiterName: req.user.fullName,
          companyName: application.job.company.companyName,
          viewedAt: newViewRecord.viewedAt,
        },
      });

      // Send notification to candidate with accurate timestamp
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(newViewRecord.viewedAt);

      await createNotification({
        userId: application.candidateId,
        type: 'APPLICATION_VIEWED',
        title: 'Application Viewed by Recruiter',
        message: `Your application for "${application.job.title}" was viewed by the hiring team at ${application.job.company.companyName} on ${formattedDate}.`,
        relatedApplicationId: application.id,
      });
    }

    const allViews = await prisma.applicationView.findMany({
      where: { applicationId: application.id },
      orderBy: { viewedAt: 'asc' },
    });

    const isViewed = allViews.length > 0;
    const firstViewedAt = isViewed ? allViews[0].viewedAt : null;
    const lastViewedAt = isViewed ? allViews[allViews.length - 1].viewedAt : null;

    res.json({
      success: true,
      viewRecorded,
      application: {
        ...application,
        isViewed,
        firstViewedAt,
        lastViewedAt,
        viewCount: allViews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Recruiter shortlists or updates application status
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      'SUBMITTED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'OFFER_EXTENDED',
      'HIRED',
      'REJECTED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status provided.' });
    }

    const company = await getRecruiterCompany(req.user.id);
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: { include: { company: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.companyId !== company?.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this application.' });
    }

    const previousStatus = application.status;

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: { include: { company: true } },
        candidate: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Determine eventType for timeline
    let eventType = 'STATUS_UPDATED';
    if (status === 'SHORTLISTED') eventType = 'SHORTLISTED';
    else if (status === 'OFFER_EXTENDED') eventType = 'OFFER_EXTENDED';
    else if (status === 'HIRED') eventType = 'HIRED';
    else if (status === 'REJECTED') eventType = 'REJECTED';
    else if (status === 'UNDER_REVIEW') eventType = 'UNDER_REVIEW';

    // Log timeline event
    await logApplicationEvent({
      applicationId: id,
      actorId: req.user.id,
      eventType,
      previousStatus,
      newStatus: status,
      metadata: { note: note || null },
    });

    // Candidate notifications for important milestones
    if (status === 'SHORTLISTED') {
      await createNotification({
        userId: application.candidateId,
        type: 'APPLICATION_SHORTLISTED',
        title: 'You Have Been Shortlisted!',
        message: `Great news! You have been shortlisted for "${application.job.title}" at ${application.job.company.companyName}. The hiring team may reach out to schedule an interview soon.`,
        relatedApplicationId: id,
      });
    } else if (status === 'REJECTED') {
      await createNotification({
        userId: application.candidateId,
        type: 'APPLICATION_REJECTED',
        title: 'Application Status Update',
        message: `Thank you for taking the time to apply for "${application.job.title}" at ${application.job.company.companyName}. The team has decided not to proceed with your application at this time.`,
        relatedApplicationId: id,
      });
    } else if (status === 'OFFER_EXTENDED') {
      await createNotification({
        userId: application.candidateId,
        type: 'OFFER_EXTENDED',
        title: 'Job Offer Extended!',
        message: `Congratulations! ${application.job.company.companyName} has extended an official job offer for the position of "${application.job.title}".`,
        relatedApplicationId: id,
      });
    } else if (status === 'HIRED') {
      await createNotification({
        userId: application.candidateId,
        type: 'HIRED',
        title: 'Congratulations on Your New Role!',
        message: `You have been officially hired as "${application.job.title}" at ${application.job.company.companyName}! Welcome aboard!`,
        relatedApplicationId: id,
      });
    }

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Access candidate resume file with authentic view tracking
export const viewResumeFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await getRecruiterCompany(req.user.id);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        resume: true,
      },
    });

    if (!application || !application.resume) {
      return res.status(404).json({ success: false, message: 'Resume not found for this application' });
    }

    if (application.job.companyId !== company?.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this candidate resume.' });
    }

    // Record resume view event
    await prisma.applicationView.create({
      data: {
        applicationId: application.id,
        recruiterId: req.user.id,
        viewType: 'RESUME_OPENED',
      },
    });

    await logApplicationEvent({
      applicationId: application.id,
      actorId: req.user.id,
      eventType: 'RESUME_VIEWED',
      previousStatus: application.status,
      newStatus: application.status,
    });

    const filePath = path.resolve(__dirname, '../../uploads/resumes', application.resume.storageKey);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file is not present on disk.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${application.resume.originalFilename}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};
