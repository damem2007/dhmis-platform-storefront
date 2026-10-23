import type { Metadata } from 'next';
import '../src/platform-home.css';

export const metadata: Metadata = {
  title: 'DHMIS · Connected dental care platform',
  description: 'Cloud practice management for charting, treatment planning, patient engagement and billing.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
