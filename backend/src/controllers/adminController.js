import prisma from '../config/db.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      verifiedCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      submittedCount,
      underReviewCount,
      shortlistedCount,
      interviewsScheduled,
      hiredCount,
      rejectedCount,
      totalResumes,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.company.count(),
      prisma.company.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'SUBMITTED' } }),
      prisma.application.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.application.count({ where: { status: 'SHORTLISTED' } }),
      prisma.interview.count(),
      prisma.application.count({ where: { status: 'HIRED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.resume.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    const recentApplications = await prisma.application.findMany({
      orderBy: { appliedAt: 'desc' },
      take: 6,
      include: {
        job: { select: { title: true, company: { select: { companyName: true } } } },
        candidate: { select: { fullName: true, email: true } },
      },
    });

    const recentJobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        company: { select: { companyName: true, verificationStatus: true } },
        _count: { select: { applications: true } },
      },
    });

    const recentInterviews = await prisma.interview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        application: {
          select: {
            job: { select: { title: true } },
            candidate: { select: { fullName: true, email: true } },
          },
        },
        scheduler: { select: { fullName: true } },
      },
    });

    res.json({
      success: true,
      stats: {
        totalCandidates,
        totalRecruiters,
        totalCompanies,
        verifiedCompanies,
        totalJobs,
        activeJobs,
        totalApplications,
        submittedCount,
        underReviewCount,
        shortlistedCount,
        interviewsScheduled,
        hiredCount,
        rejectedCount,
        totalResumes,
      },
      workflow: {
        pipeline: [
          {
            step: 1,
            name: 'Candidate Profiles & Resumes',
            description: 'Candidate registration, profile details, and uploaded resumes in vault',
            count: totalCandidates,
            subMetric: `${totalResumes} resumes stored`,
            status: 'Operational',
            link: '/admin/users',
            linkLabel: 'Inspect Candidates',
          },
          {
            step: 2,
            name: 'Recruiter & Company Onboarding',
            description: 'Corporate recruiters setup company profiles and receive verification',
            count: totalCompanies,
            subMetric: `${verifiedCompanies} verified companies`,
            status: 'Operational',
            link: '/admin/companies',
            linkLabel: 'Inspect Companies',
          },
          {
            step: 3,
            name: 'Job Opportunity Publishing',
            description: 'Recruiters publish vacancies with compensation, skills, and USA locations',
            count: activeJobs,
            subMetric: `${totalJobs} total listings`,
            status: 'Operational',
            link: '/jobs',
            linkLabel: 'View Live Jobs',
          },
          {
            step: 4,
            name: 'Application Ingestion & Tracking',
            description: 'Candidates discover jobs and submit applications with attached PDF resumes',
            count: totalApplications,
            subMetric: `${submittedCount} new submissions`,
            status: 'Operational',
            link: '/recruiter/applicants',
            linkLabel: 'Inspect Inflow',
          },
          {
            step: 5,
            name: 'Recruiter ATS Screening',
            description: 'Recruiters review resumes, view tracking records, and shortlist top talent',
            count: shortlistedCount + underReviewCount,
            subMetric: `${shortlistedCount} shortlisted candidates`,
            status: 'Operational',
            link: '/recruiter/dashboard',
            linkLabel: 'View Recruiter ATS',
          },
          {
            step: 6,
            name: 'Live Interview Scheduling',
            description: 'Recruiters coordinate interview rounds with date/time & meeting links',
            count: interviewsScheduled,
            subMetric: `${interviewsScheduled} scheduled rounds`,
            status: 'Operational',
            link: '/candidate/interviews',
            linkLabel: 'Inspect Calendar',
          },
          {
            step: 7,
            name: 'Candidate Placement & Hiring',
            description: 'Formal employment offers extended and successful hiring completed',
            count: hiredCount,
            subMetric: `${hiredCount} total hires confirmed`,
            status: 'Operational',
            link: '/admin/dashboard',
            linkLabel: 'Workflow Completed',
          },
        ],
        services: [
          { name: 'Node.js / Express Core Server', port: 5000, status: 'Online', protocol: 'HTTP/REST' },
          { name: 'Vite Frontend Dev Engine', port: 5173, status: 'Online', protocol: 'HTTP/SPA' },
          { name: 'SQLite dev.db Database', status: 'Healthy', protocol: 'Prisma ORM' },
          { name: 'Socket.io Event Gateway', status: 'Online', protocol: 'WebSockets' },
          { name: 'Local Resume Vault (/uploads)', status: 'Operational', protocol: 'Filesystem' },
        ],
      },
      recentUsers,
      recentApplications,
      recentJobs,
      recentInterviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        accountStatus: true,
        createdAt: true,
        candidateProfile: true,
        companyMembers: {
          include: { company: true },
        },
      },
    });

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const updateAccountStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { accountStatus: status },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_USER_STATUS',
        targetType: 'USER',
        targetId: id,
        details: `Updated user ${user.email} status to ${status}`,
      },
    });

    res.json({ success: true, message: `User account status changed to ${status}`, user });
  } catch (error) {
    next(error);
  }
};

export const getAdminCompanies = async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        members: {
          include: { user: { select: { fullName: true, email: true } } },
        },
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const company = await prisma.company.update({
      where: { id },
      data: { verificationStatus },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_COMPANY_VERIFICATION',
        targetType: 'COMPANY',
        targetId: id,
        details: `Updated company ${company.companyName} verification to ${verificationStatus}`,
      },
    });

    res.json({ success: true, message: `Company verification updated to ${verificationStatus}`, company });
  } catch (error) {
    next(error);
  }
};
