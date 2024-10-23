import '@/app/ui/global.css';
import { Irish_Grover } from 'next/font/google'

const irishGrover = Irish_Grover({
  weight: '400',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={irishGrover.className}>{children}</body>
    </html>
  );
}
