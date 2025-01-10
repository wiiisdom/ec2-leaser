import type { Metadata } from 'next';
import '@/index.css';

export const metadata: Metadata = {
  title: 'EC2 Leaser'
};

export default function RootLayout({
  children
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
