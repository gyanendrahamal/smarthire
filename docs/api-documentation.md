# SmartHire — REST API Documentation

## Base URL
`/api`

All protected endpoints require an `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints

### Register User
`POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "fullName": "Alex Rivers",
    "email": "alex.dev@gmail.com",
    "password": "Candidate@123",
    "role": "CANDIDATE",
    "phone": "+1 206-555-0182"
  }
  ```
- **Response:** `201 Created` with JWT token and user profile.

### Login User
`POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "alex.dev@gmail.com",
    "password": "Candidate@123"
  }
  ```
- **Response:** `200 OK` with token and user profile.

### Current User Session
`GET /api/auth/me`
- **Response:** `200 OK` with authenticated user profile, candidate details, or company associations.

### Upload PDF Resume
`POST /api/auth/resumes` (multipart/form-data: `resume`)
- **Response:** `201 Created` with resume metadata.

---

## 2. Jobs Endpoints

### Search & List Jobs
`GET /api/jobs?search=react&location=remote&workMode=REMOTE&sort=newest`
- **Response:** `200 OK` with paginated job list, company details, deadline countdown, and saved/applied indicators.

### Get Job Details
`GET /api/jobs/:id`
- **Response:** `200 OK` with job description, requirements, company info, and application status if applied.

### Create Job (Recruiter Only)
`POST /api/jobs`
- **Request Body:** `title`, `description`, `location`, `workMode`, `employmentType`, `salaryMin`, `salaryMax`, `applicationDeadline`, etc.
- **Response:** `201 Created`

---

## 3. Applications & ATS Endpoints

### Submit Job Application
`POST /api/applications` (multipart/form-data)
- **Fields:**
  - `jobId`: Target job ID
  - `coverLetter`: Application message
  - `resumeId` (optional): ID of saved resume
  - `resumeFile` (optional): Uploaded PDF resume
- **Response:** `201 Created` with application record, initial `SUBMITTED` timeline event, and real-time recruiter alert.

### Candidate Applications List
`GET /api/applications/my-applications`
- **Response:** `200 OK` with applications list, current status, recruiter view flags (`isViewed`, `firstViewedAt`, `viewCount`), and interview details.

### Get Application Timeline & Details
`GET /api/applications/:id`
- **Response:** `200 OK` with complete event timeline, view logs, interview invitation, and candidate profile.

---

## 4. Recruiter Tracking Endpoints

### Recruiter Applications List
`GET /api/recruiter/applications?jobId=:id&status=SHORTLISTED`
- **Response:** `200 OK` with candidates for company jobs.

### View Candidate Application (Authentic View Tracking)
`GET /api/recruiter/applications/:id` or `POST /api/recruiter/applications/:id/view`
- **Behavior:**
  - Validates recruiter belongs to the job's company.
  - Automatically records an `ApplicationView` entry with recruiter ID and timestamp.
  - Logs `VIEWED` event in application timeline.
  - Dispatches instant in-app notification to candidate: *"Your application was viewed by the recruiter on [Date & Time]"*.
- **Response:** `200 OK` with application details and updated view counts.

### Shortlist Candidate & Update Status
`PATCH /api/recruiter/applications/:id/status`
- **Request Body:**
  ```json
  {
    "status": "SHORTLISTED",
    "note": "Candidate selected for technical evaluation"
  }
  ```
- **Response:** `200 OK` with updated status, new timeline event, and candidate notification.

### View Candidate Resume PDF
`GET /api/recruiter/applications/:id/resume`
- **Behavior:** Validates access, logs `RESUME_OPENED` view event, and streams PDF document inline.

---

## 5. Interview Scheduling Endpoints

### Schedule Interview (Recruiter)
`POST /api/interviews`
- **Request Body:**
  ```json
  {
    "applicationId": "cmv587bjc0001kvm12dj4537q",
    "interviewDate": "2026-10-25",
    "startTime": "10:30 AM",
    "endTime": "11:30 AM",
    "timezone": "UTC",
    "interviewMode": "ONLINE",
    "meetingLink": "https://meet.google.com/smarthire-interview",
    "interviewerName": "Sarah Jenkins",
    "instructions": "System design and live coding session"
  }
  ```
- **Behavior:**
  - Updates application status to `INTERVIEW_SCHEDULED`.
  - Creates `Interview` record.
  - Creates timeline event.
  - Sends candidate in-app notification with exact date, time, and meeting link.
- **Response:** `201 Created`

### Candidate Respond to Interview
`PATCH /api/interviews/:id/respond`
- **Request Body:**
  ```json
  {
    "response": "ACCEPTED",
    "candidateNotes": "Looking forward to meeting the team!"
  }
  ```
- **Response:** `200 OK`
