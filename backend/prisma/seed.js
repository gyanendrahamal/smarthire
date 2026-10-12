import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SmartHire database with rich USA companies and extensive job listings...');

  // Ensure resume directory exists
  const uploadDir = path.join(__dirname, '../uploads/resumes');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const samplePdfPath1 = path.join(uploadDir, 'resume_alex_rivers.pdf');
  const samplePdfPath2 = path.join(uploadDir, 'resume_priya_patel.pdf');
  const dummyPdfContent = '%PDF-1.4\n%SmartHire Sample Resume PDF Content\n1 0 obj\n<< /Title (Alex Rivers Resume) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF';

  fs.writeFileSync(samplePdfPath1, dummyPdfContent);
  fs.writeFileSync(samplePdfPath2, dummyPdfContent);

  // Clean existing tables in proper order
  await prisma.notificationDelivery.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.applicationView.deleteMany();
  await prisma.applicationEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.company.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
  const hashedRecruiterPassword = await bcrypt.hash('Recruiter@123', 10);
  const hashedCandidatePassword = await bcrypt.hash('Candidate@123', 10);

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      fullName: 'Chief Administrator',
      email: 'admin@smarthire.com',
      passwordHash: hashedAdminPassword,
      role: 'ADMIN',
      phone: '+1 800-555-0100',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  // 2. Verified Real USA Companies
  const techNova = await prisma.company.create({
    data: {
      companyName: 'TechNova Cloud Solutions',
      description: 'TechNova is an enterprise cloud computing pioneer building next-generation distributed platforms, zero-downtime microservices infrastructure, and real-time collaboration engines serving Fortune 500 organizations.',
      industry: 'Enterprise Cloud & Distributed Systems',
      website: 'https://technova.io',
      location: 'San Francisco, CA',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      companySize: '1,200 - 2,500 employees',
      foundedYear: '2016',
      benefits: 'Comprehensive Medical/Dental/Vision, 401(k) 5% Match, Unlimited PTO, $2,500 Home Office & Tech Stipend, Annual Learning Budget',
      verificationStatus: 'VERIFIED',
    },
  });

  const cloudScale = await prisma.company.create({
    data: {
      companyName: 'CloudScale Dynamics',
      description: 'CloudScale Dynamics provides automated Kubernetes orchestration, high-frequency observability pipelines, and telemetry platforms that power global financial and infrastructure leaders.',
      industry: 'DevOps & Cloud Observability',
      website: 'https://cloudscale.dev',
      location: 'Austin, TX',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
      companySize: '450 - 800 employees',
      foundedYear: '2018',
      benefits: '100% Remote-First Culture, Flexible Working Hours, 401(k) Match, Wellness Allowance, Competitive Equity Options',
      verificationStatus: 'VERIFIED',
    },
  });

  const apexDesign = await prisma.company.create({
    data: {
      companyName: 'Apex Design Labs',
      description: 'Apex Design Labs is an award-winning digital experience studio in Manhattan crafting high-performance web applications, design systems, and delightful digital interfaces for high-growth tech companies.',
      industry: 'Digital Product Design & UX',
      website: 'https://apexdesign.nyc',
      location: 'New York, NY',
      logo: 'https://images.unsplash.com/photo-1542744094-3a31727223ec?w=150&auto=format&fit=crop&q=80',
      companySize: '150 - 300 employees',
      foundedYear: '2019',
      benefits: 'Hybrid Manhattan Office, Generous Equipment Stipend, Top-tier Health Coverage, Annual Team Offsites, Commuter Pass',
      verificationStatus: 'VERIFIED',
    },
  });

  const quantumAI = await prisma.company.create({
    data: {
      companyName: 'QuantumLeap AI',
      description: 'QuantumLeap AI builds foundational artificial intelligence agents, LLM inference infrastructure, and enterprise data processing pipelines driving automation in medicine, finance, and engineering.',
      industry: 'Artificial Intelligence & Machine Learning',
      website: 'https://quantumleap.ai',
      location: 'Seattle, WA',
      logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80',
      companySize: '300 - 600 employees',
      foundedYear: '2021',
      benefits: 'Silicon Valley Equity Grants, 401(k), Premier Health/Dental/Vision, Generous AI Research Budget, Catered Lunches',
      verificationStatus: 'VERIFIED',
    },
  });

  const cyberShield = await prisma.company.create({
    data: {
      companyName: 'CyberShield Defense',
      description: 'CyberShield Defense delivers zero-trust identity architectures, automated threat intelligence, and cloud security monitoring defending mission-critical public and private networks across North America.',
      industry: 'Cybersecurity & Zero-Trust',
      website: 'https://cybershield.security',
      location: 'Boston, MA',
      logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
      companySize: '800 - 1,500 employees',
      foundedYear: '2015',
      benefits: 'Full Health & Life Coverage, Student Loan Repayment Support, 401(k) Match, Generous Parental Leave, Certification Sponsorship',
      verificationStatus: 'VERIFIED',
    },
  });

  const dataStream = await prisma.company.create({
    data: {
      companyName: 'DataStream Technologies',
      description: 'DataStream Technologies creates high-throughput distributed databases and streaming event engines handling billions of queries per day with sub-millisecond latency.',
      industry: 'Big Data & Distributed Databases',
      website: 'https://datastream.io',
      location: 'Denver, CO',
      logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80',
      companySize: '250 - 500 employees',
      foundedYear: '2017',
      benefits: 'Outdoor Gear & Wellness Stipend, 401(k) 5% Match, Remote-First Setup, Premium Health Insurance, Sabbatical Program',
      verificationStatus: 'VERIFIED',
    },
  });

  const vectorPay = await prisma.company.create({
    data: {
      companyName: 'VectorPay Networks',
      description: 'VectorPay operates modern financial infrastructure enabling frictionless global payments, multi-currency settlement, and automated compliance for internet businesses worldwide.',
      industry: 'FinTech & Global Payments',
      website: 'https://vectorpay.com',
      location: 'Chicago, IL',
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
      companySize: '600 - 1,200 employees',
      foundedYear: '2017',
      benefits: 'Performance Bonus Structure, Medical/Dental/Vision 100% Covered, Commuter Benefits, 401(k) Match, Gym Membership',
      verificationStatus: 'VERIFIED',
    },
  });

  const pulseInteractive = await prisma.company.create({
    data: {
      companyName: 'Pulse Interactive Media',
      description: 'Pulse Interactive crafts consumer web experiences, streaming applications, and design systems reaching over 40 million active monthly users.',
      industry: 'Consumer Tech & Digital Media',
      website: 'https://pulseinteractive.la',
      location: 'Los Angeles, CA',
      logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80',
      companySize: '120 - 250 employees',
      foundedYear: '2020',
      benefits: 'Flexible Remote Schedule, Creative Project Grants, Medical/Dental Coverage, Mental Health Stipend, Annual Company Retreats',
      verificationStatus: 'VERIFIED',
    },
  });

  // 3. Recruiters associated with companies
  const recruiter1 = await prisma.user.create({
    data: {
      fullName: 'Sarah Jenkins',
      email: 'recruiter@technova.com',
      passwordHash: hashedRecruiterPassword,
      role: 'RECRUITER',
      phone: '+1 415-555-0199',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });
  await prisma.companyMember.create({
    data: { companyId: techNova.id, userId: recruiter1.id, memberRole: 'ADMIN' },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      fullName: 'Marcus Vance',
      email: 'recruiter@cloudscale.com',
      passwordHash: hashedRecruiterPassword,
      role: 'RECRUITER',
      phone: '+1 512-555-0144',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });
  await prisma.companyMember.create({
    data: { companyId: cloudScale.id, userId: recruiter2.id, memberRole: 'ADMIN' },
  });

  const recruiter3 = await prisma.user.create({
    data: {
      fullName: 'Elena Rostova',
      email: 'elena@quantumleap.ai',
      passwordHash: hashedRecruiterPassword,
      role: 'RECRUITER',
      phone: '+1 206-555-0188',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });
  await prisma.companyMember.create({
    data: { companyId: quantumAI.id, userId: recruiter3.id, memberRole: 'ADMIN' },
  });

  const recruiter4 = await prisma.user.create({
    data: {
      fullName: 'David Sterling',
      email: 'david@cybershield.security',
      passwordHash: hashedRecruiterPassword,
      role: 'RECRUITER',
      phone: '+1 617-555-0122',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });
  await prisma.companyMember.create({
    data: { companyId: cyberShield.id, userId: recruiter4.id, memberRole: 'ADMIN' },
  });

  // 4. Candidate Users
  const alex = await prisma.user.create({
    data: {
      fullName: 'Alex Rivers',
      email: 'alex.dev@gmail.com',
      passwordHash: hashedCandidatePassword,
      role: 'CANDIDATE',
      phone: '+1 206-555-0182',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.candidateProfile.create({
    data: {
      userId: alex.id,
      headline: 'Senior Full Stack Engineer (React, Node.js, TypeScript, PostgreSQL, AWS)',
      location: 'Seattle, WA (Open to Remote)',
      bio: 'Full-stack software architect with 6+ years building distributed React, Node, and cloud microservices platforms with high uptime and intuitive UI.',
      skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'Express', 'Prisma', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS', 'Next.js']),
      education: JSON.stringify([{ degree: 'B.S. in Computer Science', institution: 'University of Washington', year: '2019' }]),
      experience: JSON.stringify([
        { title: 'Senior Software Engineer', company: 'Apex Web Systems', duration: '2022 - Present', summary: 'Architected customer portal serving 50k DAU.' },
      ]),
    },
  });

  await prisma.resume.create({
    data: {
      candidateId: alex.id,
      originalFilename: 'Alex_Rivers_Senior_FullStack_Resume.pdf',
      storageKey: 'resume_alex_rivers.pdf',
      mimeType: 'application/pdf',
      fileSize: 104250,
    },
  });

  const priya = await prisma.user.create({
    data: {
      fullName: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      passwordHash: hashedCandidatePassword,
      role: 'CANDIDATE',
      phone: '+1 408-555-0133',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.candidateProfile.create({
    data: {
      userId: priya.id,
      headline: 'Lead Frontend UI/UX Developer (React, Next.js, Design Systems, TypeScript)',
      location: 'San Jose, CA',
      bio: 'UI engineer crafting accessible, component-driven design systems and high-converting web apps.',
      skills: JSON.stringify(['React', 'Next.js', 'Tailwind CSS', 'Figma', 'TypeScript', 'Redux Toolkit', 'Jest']),
    },
  });

  await prisma.resume.create({
    data: {
      candidateId: priya.id,
      originalFilename: 'Priya_Patel_Frontend_Lead_Resume.pdf',
      storageKey: 'resume_priya_patel.pdf',
      mimeType: 'application/pdf',
      fileSize: 98120,
    },
  });

  // 5. Array of 24+ Detailed, Realistic Tech Jobs in Real USA Cities
  const jobListings = [
    // San Francisco, CA
    {
      companyId: techNova.id,
      postedBy: recruiter1.id,
      title: 'Senior Full Stack Engineer',
      description: 'TechNova Solutions is seeking a Senior Full Stack Engineer to spearhead our core cloud collaboration platform. In this role, you will design scalable RESTful and GraphQL APIs, build reactive interfaces in modern React & TypeScript, and optimize relational database queries handling millions of requests daily.\n\nYou will collaborate closely with engineering directors, product designers, and DevOps architects to deliver high-availability software.',
      location: 'San Francisco, CA',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 145000,
      salaryMax: 185000,
      experienceLevel: 'Senior (5+ yrs)',
      requirements: '- 5+ years of production experience in TypeScript, React, and Node.js\n- Deep understanding of database modeling with PostgreSQL or SQLite and Prisma/TypeORM\n- Hands-on background with Redis caching, WebSockets/Socket.IO, and Docker\n- Commitment to automated unit & integration testing (Vitest, Jest, Playwright)',
      vacancies: 2,
      deadlineDays: 16,
    },
    {
      companyId: techNova.id,
      postedBy: recruiter1.id,
      title: 'Lead Frontend Architect',
      description: 'Join TechNova as a Lead Frontend Architect to establish engineering standards, design system tokens, and performance budgets across our suite of web applications. You will mentor frontend squads and ensure lighthouse performance benchmarks remain above 95.',
      location: 'San Francisco, CA',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 160000,
      salaryMax: 205000,
      experienceLevel: 'Lead / Staff',
      requirements: '- 7+ years building enterprise single-page applications with React, Next.js, and Vite\n- Expertise creating modular design systems and accessible Tailwind component libraries\n- Proven knowledge of web vitals, bundle splitting, micro-frontends, and state management',
      vacancies: 1,
      deadlineDays: 9,
    },
    {
      companyId: techNova.id,
      postedBy: recruiter1.id,
      title: 'Enterprise Solutions Architect',
      description: 'Guide large enterprise clients on integrating TechNova cloud solutions into their IT landscape. You will translate complex client requirements into scalable architectural blueprints and oversee seamless deployments.',
      location: 'San Francisco, CA',
      employmentType: 'FULL_TIME',
      workMode: 'ON_SITE',
      salaryMin: 175000,
      salaryMax: 220000,
      experienceLevel: 'Director / Principal',
      requirements: '- 8+ years in enterprise software architecture, cloud platforms (AWS/GCP/Azure)\n- Strong communication skills interfacing with C-level executives\n- Hands-on background in security compliance, SOC2, and distributed networking',
      vacancies: 1,
      deadlineDays: 20,
    },

    // Austin, TX
    {
      companyId: cloudScale.id,
      postedBy: recruiter2.id,
      title: 'Staff Backend Systems Engineer',
      description: 'CloudScale Dynamics is looking for a Staff Backend Systems Engineer to architect our telemetry processing engine. You will build concurrent microservices capable of ingesting gigabytes of log telemetry per second with zero data loss.',
      location: 'Austin, TX',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 155000,
      salaryMax: 195000,
      experienceLevel: 'Staff (6+ yrs)',
      requirements: '- Proficiency in Go, Rust, or modern Node.js/C++ for high-concurrency systems\n- Deep knowledge of distributed streaming (Kafka, Pulsar, or RabbitMQ)\n- Experience optimizing Linux kernel networking and containerized runtimes',
      vacancies: 2,
      deadlineDays: 14,
    },
    {
      companyId: cloudScale.id,
      postedBy: recruiter2.id,
      title: 'DevOps & Infrastructure Architect',
      description: 'Automate multi-region Kubernetes clusters across AWS and GCP, build zero-touch CI/CD pipelines, and implement automated infrastructure-as-code for our entire developer organization.',
      location: 'Austin, TX',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 140000,
      salaryMax: 175000,
      experienceLevel: 'Senior',
      requirements: '- 5+ years of hands-on Terraform, Kubernetes, Helm, and GitOps workflows (ArgoCD)\n- Solid scripting skills in Python, Go, or Bash\n- Strong experience managing production AWS environments with 99.99% SLA requirements',
      vacancies: 3,
      deadlineDays: 18,
    },
    {
      companyId: cloudScale.id,
      postedBy: recruiter2.id,
      title: 'Senior Software Engineer (Rust & Go)',
      description: 'Work at the cutting edge of low-latency systems programming. Build our next-generation data proxy and agent daemon running on client infrastructure across the world.',
      location: 'Austin, TX',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 160000,
      salaryMax: 210000,
      experienceLevel: 'Senior (5+ yrs)',
      requirements: '- 3+ years writing idiomatic, memory-safe Rust in production\n- Experience with asynchronous runtimes (Tokio) and gRPC communication protocols\n- Solid grasp of systems debugging with eBPF, perf, and flamegraphs',
      vacancies: 1,
      deadlineDays: 25,
    },

    // New York, NY
    {
      companyId: apexDesign.id,
      postedBy: recruiter1.id,
      title: 'Senior Product UI/UX Designer',
      description: 'Shape the next generation of SaaS user interfaces. You will conduct user research with product managers, craft wireframes and interactive prototypes in Figma, and design polished design systems.',
      location: 'New York, NY',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 125000,
      salaryMax: 155000,
      experienceLevel: 'Senior (4+ yrs)',
      requirements: '- Outstanding portfolio showcasing complex B2B SaaS or consumer products\n- Mastery of Figma, auto-layout, interactive component variants, and design token pipelines\n- Close partnership with frontend engineers to ensure high design fidelity',
      vacancies: 2,
      deadlineDays: 12,
    },
    {
      companyId: apexDesign.id,
      postedBy: recruiter1.id,
      title: 'Frontend Design Engineer',
      description: 'Bridge the gap between design and frontend code. Build animated micro-interactions, responsive CSS component libraries, and interactive design token playgrounds.',
      location: 'New York, NY',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 130000,
      salaryMax: 165000,
      experienceLevel: 'Mid to Senior',
      requirements: '- Strong fluency in CSS3, Tailwind CSS, Framer Motion, and React\n- Obsessive attention to typographic hierarchy, spacing, and accessibility (WCAG AA)\n- Experience maintaining living component storybooks',
      vacancies: 1,
      deadlineDays: 8,
    },

    // Seattle, WA
    {
      companyId: quantumAI.id,
      postedBy: recruiter3.id,
      title: 'Machine Learning / AI Platform Engineer',
      description: 'QuantumLeap AI is looking for an ML Platform Engineer to build scalable training and inference clusters. You will optimize GPU workloads, implement vector database indexers, and build low-latency API wrappers.',
      location: 'Seattle, WA',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 170000,
      salaryMax: 220000,
      experienceLevel: 'Senior to Lead',
      requirements: '- Production experience with PyTorch, Ray, vLLM, TensorRT, or Triton Inference Server\n- Deep understanding of vector databases (Pinecone, Qdrant, Milvus, pgvector)\n- Strong distributed computing skills with Kubernetes and NVIDIA GPU operators',
      vacancies: 2,
      deadlineDays: 21,
    },
    {
      companyId: quantumAI.id,
      postedBy: recruiter3.id,
      title: 'AI Application Engineer (LLM Integrations)',
      description: 'Build user-facing AI applications, autonomous agents, and intelligent workflow assistants. You will design prompt chaining pipelines, function calling schemas, and evaluation test suites.',
      location: 'Seattle, WA',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 155000,
      salaryMax: 195000,
      experienceLevel: 'Senior',
      requirements: '- Proven experience deploying production LLM apps using LangChain, LlamaIndex, or raw APIs\n- Strong TypeScript/Node.js or Python backend engineering foundation\n- Experience building real-time streaming interfaces with Server-Sent Events (SSE) or WebSockets',
      vacancies: 3,
      deadlineDays: 15,
    },

    // Boston, MA
    {
      companyId: cyberShield.id,
      postedBy: recruiter4.id,
      title: 'Cloud Security & Zero-Trust Specialist',
      description: 'Protect enterprise infrastructure by designing identity management policies, automated compliance verification, and proactive security guardrails across AWS and Azure environments.',
      location: 'Boston, MA',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 150000,
      salaryMax: 190000,
      experienceLevel: 'Senior',
      requirements: '- In-depth knowledge of IAM, OAuth2/OIDC, SAML, and Zero-Trust architecture\n- Experience with cloud posture management tools (Prisma Cloud, Wiz, GuardDuty)\n- Ability to perform threat modeling and security architecture reviews',
      vacancies: 2,
      deadlineDays: 17,
    },
    {
      companyId: cyberShield.id,
      postedBy: recruiter4.id,
      title: 'Security Operations & Incident Response Engineer',
      description: 'Monitor alerts, automate SIEM correlation rules, and lead incident response investigations to safeguard critical customer data against sophisticated attacks.',
      location: 'Boston, MA',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 130000,
      salaryMax: 165000,
      experienceLevel: 'Mid to Senior',
      requirements: '- 4+ years in SOC operations, incident response, or forensic log analysis\n- Experience building SOAR automation playbooks in Python or Go\n- Relevant certifications preferred (CISSP, CEH, or AWS Certified Security)',
      vacancies: 1,
      deadlineDays: 11,
    },

    // Denver, CO
    {
      companyId: dataStream.id,
      postedBy: recruiter2.id,
      title: 'Distributed Database Engineer',
      description: 'Develop and benchmark core storage engines, indexing algorithms, and consensus protocols powering our next-generation distributed SQL and time-series database.',
      location: 'Denver, CO',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 150000,
      salaryMax: 195000,
      experienceLevel: 'Senior (5+ yrs)',
      requirements: '- Strong background in database internals (LSM trees, B-trees, WAL, Raft/Paxos consensus)\n- Proficiency in C++, Go, or Rust\n- Experience tuning storage I/O and memory cache hierarchies',
      vacancies: 2,
      deadlineDays: 22,
    },
    {
      companyId: dataStream.id,
      postedBy: recruiter2.id,
      title: 'Data Platform & Pipeline Engineer',
      description: 'Design robust ETL/ELT pipelines, real-time data lakes, and SQL analytics interfaces for data scientists and operational business intelligence dashboards.',
      location: 'Denver, CO',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 135000,
      salaryMax: 170000,
      experienceLevel: 'Mid to Senior',
      requirements: '- Hands-on experience with Apache Spark, Snowflake, dbt, and Kafka\n- Strong SQL mastery and Python data transformation scripting\n- Familiarity with data quality testing and orchestration (Airflow, Dagster, Prefect)',
      vacancies: 2,
      deadlineDays: 19,
    },

    // Chicago, IL
    {
      companyId: vectorPay.id,
      postedBy: recruiter1.id,
      title: 'FinTech Payments API Engineer',
      description: 'VectorPay Networks is seeking a Payments API Engineer to build resilient payment processing integrations, automated ledger balance engines, and PCI-compliant financial APIs.',
      location: 'Chicago, IL',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 165000,
      salaryMax: 210000,
      experienceLevel: 'Senior (5+ yrs)',
      requirements: '- Experience building financial, payment, or transactional accounting systems\n- Deep knowledge of idempotency, transactional ACID guarantees, and distributed locks\n- Mastery of Java, Kotlin, or TypeScript with Spring Boot or Node.js',
      vacancies: 2,
      deadlineDays: 14,
    },
    {
      companyId: vectorPay.id,
      postedBy: recruiter1.id,
      title: 'Site Reliability Engineer (SRE)',
      description: 'Ensure 99.999% availability for critical payment gateways. Define SLIs/SLOs, participate in on-call rotation, and conduct blameless post-mortem investigations.',
      location: 'Chicago, IL',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 140000,
      salaryMax: 175000,
      experienceLevel: 'Senior',
      requirements: '- 4+ years of SRE or production infrastructure experience in high-volume environments\n- Mastery of Prometheus, Grafana, OpenTelemetry, and Datadog monitoring\n- Chaos engineering background and automated failover architecture',
      vacancies: 1,
      deadlineDays: 13,
    },

    // Los Angeles, CA
    {
      companyId: pulseInteractive.id,
      postedBy: recruiter1.id,
      title: 'Principal React / Next.js Developer',
      description: 'Lead engineering on our high-traffic customer-facing web experiences. You will design server-rendered Next.js architectures, optimize image delivery, and craft frictionless checkout flows.',
      location: 'Los Angeles, CA',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 155000,
      salaryMax: 190000,
      experienceLevel: 'Principal / Lead',
      requirements: '- 6+ years React experience with mastery of Next.js 14/15 App Router, RSC, and SSR\n- Deep understanding of client-side performance, browser rendering, and caching strategies\n- Track record of leading technical architectural decisions for multi-million user apps',
      vacancies: 1,
      deadlineDays: 24,
    },
    {
      companyId: pulseInteractive.id,
      postedBy: recruiter1.id,
      title: 'Mobile Software Engineer (iOS & React Native)',
      description: 'Build intuitive, high-performance mobile apps for iOS and Android. Partner with product designers to ship smooth gestures, native video playback, and offline sync.',
      location: 'Los Angeles, CA',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 125000,
      salaryMax: 160000,
      experienceLevel: 'Mid to Senior',
      requirements: '- 3+ years experience with React Native and native mobile bridges (Swift / Kotlin)\n- Experience shipping and maintaining apps on Apple App Store & Google Play\n- Understanding of mobile memory management, push notifications, and background tasks',
      vacancies: 2,
      deadlineDays: 18,
    },

    // San Jose, CA
    {
      companyId: techNova.id,
      postedBy: recruiter1.id,
      title: 'Cloud Infrastructure Performance Specialist',
      description: 'Diagnose bottlenecks and optimize compute, memory, and database I/O across our cloud fleet. Profile microservices to maximize efficiency and minimize latency.',
      location: 'San Jose, CA',
      employmentType: 'FULL_TIME',
      workMode: 'ON_SITE',
      salaryMin: 160000,
      salaryMax: 200000,
      experienceLevel: 'Senior',
      requirements: '- Deep knowledge of Linux kernel tuning, TCP/IP stack optimization, and CPU profiling\n- Familiarity with distributed tracing (Jaeger, OpenTelemetry) and load testing tools\n- Strong background in Node.js or Go runtime performance profiling',
      vacancies: 1,
      deadlineDays: 27,
    },

    // San Diego, CA
    {
      companyId: cloudScale.id,
      postedBy: recruiter2.id,
      title: 'QA Automation & SDET Lead',
      description: 'Establish end-to-end automation testing frameworks, synthetic monitoring tests, and regression pipelines to ensure pristine software releases with zero critical defects.',
      location: 'San Diego, CA',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 120000,
      salaryMax: 150000,
      experienceLevel: 'Lead',
      requirements: '- 5+ years building test automation suites in TypeScript/JavaScript or Python\n- Mastery of Playwright, Cypress, and Supertest for API and browser automation\n- Strong integration with GitHub Actions CI/CD workflows',
      vacancies: 1,
      deadlineDays: 12,
    },

    // Atlanta, GA
    {
      companyId: vectorPay.id,
      postedBy: recruiter1.id,
      title: 'Senior Data Analytics & BI Engineer',
      description: 'Turn complex payment telemetry and merchant transactions into intuitive business intelligence models, predictive risk scores, and executive dashboards.',
      location: 'Atlanta, GA',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      salaryMin: 125000,
      salaryMax: 160000,
      experienceLevel: 'Senior',
      requirements: '- Expertise in dimensional data modeling, Snowflake, BigQuery, and Tableau/PowerBI\n- Strong SQL proficiency and experience with Python pandas/numpy\n- Experience building financial revenue reconciliation and cohort metrics',
      vacancies: 2,
      deadlineDays: 15,
    },

    // Dallas, TX
    {
      companyId: cyberShield.id,
      postedBy: recruiter4.id,
      title: 'Senior Backend Engineer (Security Microservices)',
      description: 'Build backend microservices for automated vulnerability scanning, certificate management, and role-based policy enforcement across distributed clouds.',
      location: 'Dallas, TX',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 135000,
      salaryMax: 170000,
      experienceLevel: 'Senior (4+ yrs)',
      requirements: '- 4+ years of backend development with Node.js, Go, or Python\n- Solid security mindset: OWASP Top 10 mitigation, encryption-at-rest and in-transit\n- Experience with PostgreSQL, Prisma/GORM, and Redis',
      vacancies: 2,
      deadlineDays: 19,
    },

    // Remote (USA)
    {
      companyId: quantumAI.id,
      postedBy: recruiter3.id,
      title: 'Full Stack AI Developer (Remote USA)',
      description: 'Join QuantumLeap AI from anywhere in the United States. Build full-stack interfaces connecting generative AI models with intuitive drag-and-drop workflow canvases.',
      location: 'Remote (USA)',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 145000,
      salaryMax: 185000,
      experienceLevel: 'Senior',
      requirements: '- 4+ years of full stack web engineering (React, TypeScript, Node.js, Tailwind)\n- Hands-on experience integrating with modern AI LLM APIs and streaming responses\n- Experience in remote-first team communication and autonomous delivery',
      vacancies: 3,
      deadlineDays: 22,
    },
    {
      companyId: techNova.id,
      postedBy: recruiter1.id,
      title: 'Technical Product Manager — Cloud APIs',
      description: 'Drive the product roadmap for TechNova developer APIs, SDKs, and developer documentation. Partner with principal engineers to define developer experience and telemetry.',
      location: 'Remote (USA)',
      employmentType: 'FULL_TIME',
      workMode: 'REMOTE',
      salaryMin: 150000,
      salaryMax: 190000,
      experienceLevel: 'Senior PM',
      requirements: '- 4+ years of product management experience focused on developer platforms or APIs\n- Strong technical background (ability to read code and query databases with SQL)\n- Customer empathy and track record of driving developer adoption',
      vacancies: 1,
      deadlineDays: 30,
    },
  ];

  for (const jobData of jobListings) {
    const deadline = new Date(Date.now() + jobData.deadlineDays * 24 * 60 * 60 * 1000);
    delete jobData.deadlineDays;

    await prisma.job.create({
      data: {
        ...jobData,
        applicationDeadline: deadline,
        status: 'PUBLISHED',
      },
    });
  }

  console.log(`Successfully seeded ${jobListings.length} detailed tech job listings across real USA cities!`);
  console.log('Admin: admin@smarthire.com (password: Admin@123)');
  console.log('Recruiters: recruiter@technova.com, recruiter@cloudscale.com, elena@quantumleap.ai, david@cybershield.security');
  console.log('Candidates: alex.dev@gmail.com, priya.patel@gmail.com');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
