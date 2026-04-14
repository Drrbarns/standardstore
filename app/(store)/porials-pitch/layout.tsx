import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Porials Pitch',
  description: 'Exhibition product highlights — display pricing for Porials items.',
};

export default function PorialsPitchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
