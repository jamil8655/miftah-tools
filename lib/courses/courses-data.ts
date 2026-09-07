export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  summary: string;
  videoUrl?: string;
  contentMarkdown?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'web-dev' | 'python-ai' | 'document-mastery' | 'cyber-security' | 'cloud-devops' | 'graphic-design';
  categoryLabel: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessonsCount: number;
  instructor: string;
  instructorRole: string;
  instructorAvatar?: string;
  rating: number;
  reviewsCount: number;
  thumbnail: string;
  badge: string;
  isPublished: boolean;
  featured: boolean;
  curriculum: {
    sectionTitle: string;
    lessons: Lesson[];
  }[];
}

export const COURSES_CATALOG: Course[] = [
  {
    id: 'course-web-01',
    slug: 'modern-fullstack-web-mastery',
    title: 'Modern Full-Stack Web Mastery (React, Next.js & TypeScript)',
    description: 'Learn modern web engineering from zero to production. Master React 18, Next.js 14, Tailwind CSS, TypeScript, and state management.',
    category: 'web-dev',
    categoryLabel: 'Web Development',
    level: 'beginner',
    duration: '18 Hours',
    lessonsCount: 24,
    instructor: 'Hafiz Jamilurrahman',
    instructorRole: 'Lead Architect & Full-Stack Engineer',
    rating: 4.9,
    reviewsCount: 1420,
    thumbnail: '/og-image.png',
    badge: 'Bestseller',
    featured: true,
    isPublished: true,
    curriculum: [
      {
        sectionTitle: 'Module 1: Foundations of Modern Web',
        lessons: [
          {
            id: 'l1-1',
            title: 'Welcome & Full-Stack Web Architecture Overview',
            duration: '14 min',
            isPreview: true,
            summary: 'Understand modern client-side vs server-side rendering, component-driven UI, and build toolchains.',
          },
          {
            id: 'l1-2',
            title: 'TypeScript for Next.js Developers',
            duration: '22 min',
            isPreview: true,
            summary: 'Type safety, interfaces, generics, and clean code structuring in TypeScript.',
          },
          {
            id: 'l1-3',
            title: 'Tailwind CSS & Responsive Design Masterclass',
            duration: '28 min',
            isPreview: false,
            summary: 'Utility-first styling, dark mode configuration, animations, and fluid mobile-first layouts.',
          },
        ],
      },
      {
        sectionTitle: 'Module 2: Advanced React & State Architecture',
        lessons: [
          {
            id: 'l2-1',
            title: 'Custom Hooks & Context Architecture',
            duration: '25 min',
            isPreview: true,
            summary: 'Building robust state pipelines and global context providers without boilerplate.',
          },
          {
            id: 'l2-2',
            title: 'Client-Side WebAssembly (WASM) Integration',
            duration: '35 min',
            isPreview: false,
            summary: 'Integrating high-speed C/Rust libraries directly in browser for 100% private file transformations.',
          },
        ],
      },
    ],
  },
  {
    id: 'course-ai-02',
    slug: 'python-ai-prompt-engineering-mastery',
    title: 'Python, AI Agents & Applied Generative Engineering',
    description: 'Build intelligent applications with Python, LLMs, function calling, multimodal workflows, and autonomous coding agents.',
    category: 'python-ai',
    categoryLabel: 'AI & Data Science',
    level: 'intermediate',
    duration: '14 Hours',
    lessonsCount: 18,
    instructor: 'Miftah AI Research Lab',
    instructorRole: 'AI & Machine Learning Engineers',
    rating: 4.95,
    reviewsCount: 980,
    thumbnail: '/og-image.png',
    badge: 'Popular',
    featured: true,
    isPublished: true,
    curriculum: [
      {
        sectionTitle: 'Module 1: Generative AI Fundamentals',
        lessons: [
          {
            id: 'ai-1-1',
            title: 'LLM Prompt Engineering & System Architectures',
            duration: '18 min',
            isPreview: true,
            summary: 'Zero-shot, few-shot, Chain-of-Thought, and structured JSON output techniques.',
          },
          {
            id: 'ai-1-2',
            title: 'Building Autonomous Agent Tool Call Loops',
            duration: '30 min',
            isPreview: true,
            summary: 'Connecting AI models to live APIs, terminal execution, and database systems.',
          },
        ],
      },
      {
        sectionTitle: 'Module 2: Multimodal Applications & OCR',
        lessons: [
          {
            id: 'ai-2-1',
            title: 'Vision LLMs & OCR Document Processing',
            duration: '24 min',
            isPreview: false,
            summary: 'Extracting data, tables, and handwritten notes from images with 99.8% precision.',
          },
        ],
      },
    ],
  },
  {
    id: 'course-doc-03',
    slug: 'document-pdf-automation-mastery',
    title: 'Document Engineering & PDF Automation Masterclass',
    description: 'Learn low-level PDF manipulation, programmatic document generation, OCR pipelines, and client-side document security.',
    category: 'document-mastery',
    categoryLabel: 'Document Engineering',
    level: 'beginner',
    duration: '10 Hours',
    lessonsCount: 15,
    instructor: 'Hafiz Jamilurrahman',
    instructorRole: 'Document Systems Specialist',
    rating: 4.88,
    reviewsCount: 650,
    thumbnail: '/og-image.png',
    badge: 'Essential',
    featured: false,
    isPublished: true,
    curriculum: [
      {
        sectionTitle: 'Module 1: PDF Structure & Manipulations',
        lessons: [
          {
            id: 'doc-1-1',
            title: 'Inside the PDF File Format: Pages, Streams & Metadata',
            duration: '16 min',
            isPreview: true,
            summary: 'Understanding vectors, compression streams, and page coordinate spaces.',
          },
          {
            id: 'doc-1-2',
            title: 'Batch Merging, Splitting & Rotating Files with pdf-lib',
            duration: '22 min',
            isPreview: true,
            summary: 'Writing blazing-fast programmatic scripts to handle thousand-page documents.',
          },
        ],
      },
    ],
  },
  {
    id: 'course-sec-04',
    slug: 'cybersecurity-privacy-engineering',
    title: 'Practical Cybersecurity & Zero-Trust Privacy Engineering',
    description: 'Master web application security, OAuth2, JWT verification, cryptographic hashing, and building client-side encrypted systems.',
    category: 'cyber-security',
    categoryLabel: 'Cyber Security',
    level: 'advanced',
    duration: '16 Hours',
    lessonsCount: 20,
    instructor: 'Miftah Security Team',
    instructorRole: 'Certified Ethical Hackers & Security Researchers',
    rating: 4.92,
    reviewsCount: 820,
    thumbnail: '/og-image.png',
    badge: 'Advanced',
    featured: true,
    isPublished: true,
    curriculum: [
      {
        sectionTitle: 'Module 1: Cryptography in the Browser',
        lessons: [
          {
            id: 'sec-1-1',
            title: 'SubtleCrypto API: AES-GCM, RSA & SHA-256 in JavaScript',
            duration: '28 min',
            isPreview: true,
            summary: 'End-to-end client-side encryption without exposing private keys to any server.',
          },
          {
            id: 'sec-1-2',
            title: 'OAuth 2.0, Firebase Custom Claims & Role-Based Access',
            duration: '32 min',
            isPreview: true,
            summary: 'Cryptographically signed JWT authorization tokens and security rules.',
          },
        ],
      },
    ],
  },
  {
    id: 'course-cloud-05',
    slug: 'cloud-devops-serverless-mastery',
    title: 'Cloud DevOps, Firebase & Serverless Architecture',
    description: 'Deploy enterprise-scale apps with GitHub Actions, Firebase Cloud Infrastructure, automated CI/CD pipelines, and microservices.',
    category: 'cloud-devops',
    categoryLabel: 'Cloud & DevOps',
    level: 'intermediate',
    duration: '12 Hours',
    lessonsCount: 16,
    instructor: 'Cloud Operations Team',
    instructorRole: 'Cloud Infrastructure Engineers',
    rating: 4.85,
    reviewsCount: 540,
    thumbnail: '/og-image.png',
    badge: 'Pro',
    featured: false,
    isPublished: true,
    curriculum: [
      {
        sectionTitle: 'Module 1: CI/CD & Production Deployments',
        lessons: [
          {
            id: 'cld-1-1',
            title: 'Zero-Downtime Static & Serverless Deployments',
            duration: '20 min',
            isPreview: true,
            summary: 'Configuring GitHub Actions, custom domains, and edge caching.',
          },
        ],
      },
    ],
  },
];
