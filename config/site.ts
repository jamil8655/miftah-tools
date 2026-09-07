export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  slogan: string;
  links: {
    github: string;
    docs: string;
    privacy: string;
    terms: string;
  };
  contact: {
    email: string;
    support: string;
  };
  stats: {
    totalTools: string;
    usersCount: string;
    conversionsCount: string;
    clientSideRatio: string;
  };
}

export const siteConfig: SiteConfig = {
  name: 'Miftah Tools',
  shortName: 'Miftah',
  tagline: 'The Master Key to 220+ Private Document & Productivity Utilities.',
  description:
    'Convert, compress, edit, calculate, code and manage your files with 100% private client-side processing.',
  url: 'https://jamil8655.github.io/nexora-tools/',
  ogImage: '/icon-512.png',
  slogan: 'Your All-in-One Master Key for Digital Mastery & Workflow Automation.',
  links: {
    github: 'https://github.com/jamil8655/nexora-tools',
    docs: '/tools',
    privacy: '/privacy',
    terms: '/terms',
  },
  contact: {
    email: 'contact@miftahtools.app',
    support: 'support@miftahtools.app',
  },
  stats: {
    totalTools: '220+',
    usersCount: '350K+',
    conversionsCount: '2.5M+',
    clientSideRatio: '99.8%',
  },
};
