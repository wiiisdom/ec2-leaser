import { auth } from '@/auth';
import Navbar from '@/app/(main)/navbar';
import { SessionProvider } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default async function MainLayout({
  children
}: {
  readonly children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    // redirect to signin page
    redirect('/signin');
  }
  return (
    <SessionProvider>
      <Navbar />
      {children}
    </SessionProvider>
  );
}
