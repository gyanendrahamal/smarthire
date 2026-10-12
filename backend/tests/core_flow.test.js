import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

describe('SmartHire ATS Core Flow Integration Test', () => {
  let candidateToken = '';
  let recruiterToken = '';
  let candidateUser = null;
  let recruiterUser = null;
  let targetJob = null;
  let createdApplication = null;
  let createdInterview = null;

  beforeAll(async () => {
    // 1. Login as Candidate
    const candRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex.dev@gmail.com', password: 'Candidate@123' });
    expect(candRes.status).toBe(200);
    candidateToken = candRes.body.token;
    candidateUser = candRes.body.user;

    // 2. Login as Recruiter
    const recRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recruiter@technova.com', password: 'Recruiter@123' });
    expect(recRes.status).toBe(200);
    recruiterToken = recRes.body.token;
    recruiterUser = recRes.body.user;

    // 3. Find published job
    targetJob = await prisma.job.findFirst({
      where: { title: 'Senior Full Stack Engineer' },
    });
    expect(targetJob).toBeDefined();

    // Clean any prior application for this job & candidate
    await prisma.application.deleteMany({
      where: { jobId: targetJob.id, candidateId: candidateUser.id },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // STEP 1: Candidate applies -> Application saved to database
  it('Step 1: Candidate applies for job and application is saved to database', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        jobId: targetJob.id,
        coverLetter: 'I am excited to bring my 6+ years of full-stack TypeScript & React expertise to TechNova Solutions.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.application).toBeDefined();
    expect(res.body.application.status).toBe('SUBMITTED');
    expect(res.body.application.jobId).toBe(targetJob.id);
    expect(res.body.application.candidateId).toBe(candidateUser.id);

    createdApplication = res.body.application;

    // Verify DB record
    const dbApp = await prisma.application.findUnique({
      where: { id: createdApplication.id },
      include: { events: true },
    });
    expect(dbApp).not.toBeNull();
    expect(dbApp.status).toBe('SUBMITTED');

    // Verify timeline event in DB
    const submitEvent = dbApp.events.find((e) => e.eventType === 'SUBMITTED');
    expect(submitEvent).toBeDefined();

    // Verify candidate received in-app confirmation notification
    const notif = await prisma.notification.findFirst({
      where: {
        userId: candidateUser.id,
        relatedApplicationId: createdApplication.id,
        type: 'APPLICATION_SUBMITTED',
      },
    });
    expect(notif).not.toBeNull();
  });

  // Prevent duplicate application
  it('Step 1.1: Prevents duplicate application submission for the same candidate and job', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        jobId: targetJob.id,
        coverLetter: 'Duplicate attempt',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already submitted an active application');
  });

  // STEP 2: Recruiter views application -> View event and timestamp recorded
  it('Step 2: Recruiter views candidate application and authentic view timestamp is recorded', async () => {
    const res = await request(app)
      .post(`/api/recruiter/applications/${createdApplication.id}/view`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.viewRecorded).toBe(true);
    expect(res.body.application.isViewed).toBe(true);
    expect(res.body.application.viewCount).toBeGreaterThanOrEqual(1);
    expect(res.body.application.lastViewedAt).toBeDefined();

    // Verify ApplicationView record in DB
    const views = await prisma.applicationView.findMany({
      where: { applicationId: createdApplication.id },
    });
    expect(views.length).toBeGreaterThanOrEqual(1);
    expect(views[0].recruiterId).toBe(recruiterUser.id);
    expect(views[0].viewType).toBe('APPLICATION_OPENED');

    // Verify timeline event
    const viewEvent = await prisma.applicationEvent.findFirst({
      where: { applicationId: createdApplication.id, eventType: 'VIEWED' },
    });
    expect(viewEvent).not.toBeNull();

    // Verify candidate received view notification with recruiter/company info
    const viewNotif = await prisma.notification.findFirst({
      where: {
        userId: candidateUser.id,
        relatedApplicationId: createdApplication.id,
        type: 'APPLICATION_VIEWED',
      },
    });
    expect(viewNotif).not.toBeNull();
    expect(viewNotif.message).toContain('viewed by the hiring team');
  });

  // STEP 3: Recruiter shortlists candidate -> Application timeline updated
  it('Step 3: Recruiter shortlists candidate and application status & timeline update', async () => {
    const res = await request(app)
      .patch(`/api/recruiter/applications/${createdApplication.id}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        status: 'SHORTLISTED',
        note: 'Impressive full stack experience and strong architectural background.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.application.status).toBe('SHORTLISTED');

    // Verify DB status
    const dbApp = await prisma.application.findUnique({
      where: { id: createdApplication.id },
    });
    expect(dbApp.status).toBe('SHORTLISTED');

    // Verify timeline audit event
    const shortlistEvent = await prisma.applicationEvent.findFirst({
      where: {
        applicationId: createdApplication.id,
        eventType: 'SHORTLISTED',
        newStatus: 'SHORTLISTED',
      },
    });
    expect(shortlistEvent).not.toBeNull();

    // Verify candidate received shortlisting notification
    const shortlistNotif = await prisma.notification.findFirst({
      where: {
        userId: candidateUser.id,
        relatedApplicationId: createdApplication.id,
        type: 'APPLICATION_SHORTLISTED',
      },
    });
    expect(shortlistNotif).not.toBeNull();
    expect(shortlistNotif.title).toContain('Shortlisted');
  });

  // STEP 4: Interview scheduled -> Candidate receives date, time and place
  it('Step 4: Recruiter schedules interview and candidate receives date, time, and location', async () => {
    const interviewPayload = {
      applicationId: createdApplication.id,
      interviewDate: '2026-10-22',
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      timezone: 'UTC',
      interviewMode: 'ONLINE',
      meetingLink: 'https://meet.google.com/smarthire-interview-alex',
      interviewerName: 'Sarah Jenkins (VP Engineering)',
      instructions: 'Please be prepared to share screen for live architecture design and problem solving.',
    };

    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send(interviewPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.interview).toBeDefined();
    expect(res.body.interview.interviewDate).toBe('2026-10-22');
    expect(res.body.interview.startTime).toBe('11:00 AM');
    expect(res.body.interview.meetingLink).toBe('https://meet.google.com/smarthire-interview-alex');

    createdInterview = res.body.interview;

    // Verify application status updated to INTERVIEW_SCHEDULED
    const updatedApp = await prisma.application.findUnique({
      where: { id: createdApplication.id },
    });
    expect(updatedApp.status).toBe('INTERVIEW_SCHEDULED');

    // Verify timeline event
    const interviewEvent = await prisma.applicationEvent.findFirst({
      where: {
        applicationId: createdApplication.id,
        eventType: 'INTERVIEW_SCHEDULED',
      },
    });
    expect(interviewEvent).not.toBeNull();

    // Verify candidate notification has exact date, time, and place
    const interviewNotif = await prisma.notification.findFirst({
      where: {
        userId: candidateUser.id,
        relatedInterviewId: createdInterview.id,
        type: 'INTERVIEW_SCHEDULED',
      },
    });
    expect(interviewNotif).not.toBeNull();
    expect(interviewNotif.message).toContain('2026-10-22');
    expect(interviewNotif.message).toContain('11:00 AM');
    expect(interviewNotif.message).toContain('https://meet.google.com/smarthire-interview-alex');
  });

  // STEP 4.1: Candidate confirms interview attendance
  it('Step 4.1: Candidate confirms attendance and status updates', async () => {
    const res = await request(app)
      .patch(`/api/interviews/${createdInterview.id}/respond`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        response: 'ACCEPTED',
        candidateNotes: 'Thank you! I will be ready at 11:00 AM on Google Meet.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.interview.candidateResponse).toBe('ACCEPTED');

    // Verify DB interview status
    const dbInterview = await prisma.interview.findUnique({
      where: { id: createdInterview.id },
    });
    expect(dbInterview.candidateResponse).toBe('ACCEPTED');
  });
});
