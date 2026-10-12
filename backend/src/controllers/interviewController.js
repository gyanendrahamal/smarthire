import prisma from '../config/db.js';
import { z } from 'zod';
import { logApplicationEvent } from '../services/eventLogger.js';
import { createNotification } from '../services/notificationService.js';

const interviewScheduleSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  interviewDate: z.string().min(1, 'Interview date is required (YYYY-MM-DD)'),
  startTime: z.string().min(1, 'Interview start time is required (e.g. 10:30 AM)'),
  endTime: z.string().optional(),
  timezone: z.string().default('UTC'),
  interviewMode: z.enum(['IN_PERSON', 'ONLINE', 'TELEPHONE']).default('ONLINE'),
  interviewLocation: z.string().optional().nullable(),
  meetingLink: z.string().optional().nullable(),
  interviewerName: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
});

export const scheduleInterview = async (req, res, next) => {
  try {
    const data = interviewScheduleSchema.parse(req.body);

    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        job: { include: { company: { include: { members: true } } } },
        candidate: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found' });
    }

    // Authorization
    const isCompanyRecruiter = application.job.company.members.some((m) => m.userId === req.user.id);
    if (!isCompanyRecruiter && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to schedule interviews for this applicant.' });
    }

    // 1. Create Interview
    const interview = await prisma.interview.create({
      data: {
        applicationId: application.id,
        scheduledBy: req.user.id,
        interviewDate: data.interviewDate,
        startTime: data.startTime,
        endTime: data.endTime || null,
        timezone: data.timezone,
        interviewMode: data.interviewMode,
        interviewLocation: data.interviewLocation || null,
        meetingLink: data.meetingLink || null,
        interviewerName: data.interviewerName || req.user.fullName,
        instructions: data.instructions || 'Please be on time and bring any relevant portfolio materials.',
        status: 'SCHEDULED',
        candidateResponse: 'PENDING',
      },
      include: {
        scheduler: { select: { id: true, fullName: true, email: true } },
      },
    });

    // 2. Update application status to INTERVIEW_SCHEDULED
    const previousStatus = application.status;
    await prisma.application.update({
      where: { id: application.id },
      data: { status: 'INTERVIEW_SCHEDULED' },
    });

    // 3. Log event to timeline
    const placeDetail = data.interviewMode === 'IN_PERSON'
      ? (data.interviewLocation || 'Company Office')
      : data.interviewMode === 'ONLINE'
      ? (data.meetingLink || 'Online Video Conference')
      : 'Telephone Call';

    await logApplicationEvent({
      applicationId: application.id,
      actorId: req.user.id,
      eventType: 'INTERVIEW_SCHEDULED',
      previousStatus,
      newStatus: 'INTERVIEW_SCHEDULED',
      metadata: {
        interviewId: interview.id,
        interviewDate: data.interviewDate,
        startTime: data.startTime,
        mode: data.interviewMode,
        place: placeDetail,
        interviewerName: data.interviewerName,
      },
    });

    // 4. Notify Candidate with Date, Time, Mode, and Place
    await createNotification({
      userId: application.candidateId,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled!',
      message: `Congratulations! An interview has been scheduled for "${application.job.title}" at ${application.job.company.companyName} on ${data.interviewDate} at ${data.startTime}. Mode: ${data.interviewMode}. Location/Link: ${placeDetail}.`,
      relatedApplicationId: application.id,
      relatedInterviewId: interview.id,
    });

    res.status(201).json({
      success: true,
      message: 'Interview successfully scheduled and invitation dispatched!',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response, candidateNotes } = req.body;

    if (!['ACCEPTED', 'DECLINED', 'RESCHEDULE_REQUESTED'].includes(response)) {
      return res.status(400).json({ success: false, message: 'Invalid response status.' });
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: { include: { company: { include: { members: true } } } },
            candidate: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.application.candidateId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        candidateResponse: response,
        candidateNotes: candidateNotes || interview.candidateNotes,
      },
    });

    // Log timeline event
    await logApplicationEvent({
      applicationId: interview.applicationId,
      actorId: req.user.id,
      eventType: response === 'ACCEPTED' ? 'INTERVIEW_CONFIRMED' : 'INTERVIEW_RESPONSE_UPDATED',
      previousStatus: interview.application.status,
      newStatus: interview.application.status,
      metadata: {
        candidateResponse: response,
        notes: candidateNotes,
      },
    });

    // Notify recruiter
    const statusText = response === 'ACCEPTED' ? 'confirmed attendance for' : response === 'DECLINED' ? 'declined' : 'requested rescheduling for';
    for (const member of interview.application.job.company.members) {
      await createNotification({
        userId: member.userId,
        type: 'INTERVIEW_SCHEDULED',
        title: `Candidate Response: ${response}`,
        message: `${req.user.fullName} has ${statusText} the interview for ${interview.application.job.title}.`,
        relatedApplicationId: interview.applicationId,
        relatedInterviewId: interview.id,
      });
    }

    res.json({
      success: true,
      message: `Interview response recorded as ${response}`,
      interview: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interviewDate, startTime, endTime, interviewMode, interviewLocation, meetingLink, instructions, status } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: { include: { company: { include: { members: true } } } },
          },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const isCompanyRecruiter = interview.application.job.company.members.some((m) => m.userId === req.user.id);
    if (!isCompanyRecruiter && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this interview.' });
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        interviewDate: interviewDate || interview.interviewDate,
        startTime: startTime || interview.startTime,
        endTime: endTime !== undefined ? endTime : interview.endTime,
        interviewMode: interviewMode || interview.interviewMode,
        interviewLocation: interviewLocation !== undefined ? interviewLocation : interview.interviewLocation,
        meetingLink: meetingLink !== undefined ? meetingLink : interview.meetingLink,
        instructions: instructions !== undefined ? instructions : interview.instructions,
        status: status || (interviewDate || startTime ? 'RESCHEDULED' : interview.status),
      },
    });

    // Notify candidate
    await createNotification({
      userId: interview.application.candidateId,
      type: 'INTERVIEW_RESCHEDULED',
      title: 'Interview Details Updated',
      message: `Your interview for "${interview.application.job.title}" has been updated to ${updated.interviewDate} at ${updated.startTime}.`,
      relatedApplicationId: interview.applicationId,
      relatedInterviewId: interview.id,
    });

    res.json({
      success: true,
      message: 'Interview updated successfully',
      interview: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateInterviews = async (req, res, next) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        application: {
          candidateId: req.user.id,
        },
      },
      include: {
        application: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
          },
        },
        scheduler: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { interviewDate: 'asc' },
    });

    res.json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};
