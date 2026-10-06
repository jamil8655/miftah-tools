import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Courses & Developer Learning Paths',
  description: 'Free open practical curriculums in full-stack web development, Python & AI engineering, document engineering, and cybersecurity.',
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
