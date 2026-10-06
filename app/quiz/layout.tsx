import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Quizzes & Skill Tests',
  description: 'Test your software engineering, cybersecurity, and digital document skills with interactive quizzes and digital badges.',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
