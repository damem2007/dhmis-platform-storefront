import type { Metadata } from 'next';
import '../src/platform-home.css';

export const metadata: Metadata = { title: 'DHMIS', description: 'Dental clinic management for connected practices.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
