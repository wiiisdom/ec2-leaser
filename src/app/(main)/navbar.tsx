import { signOut } from '@/auth';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { Resource } from 'sst';

const Navbar = () => {
  return (
    <header className="body-font text-gray-600">
      <div className="container flex flex-col flex-wrap items-center mx-auto p-5 md:flex-row md:justify-between">
        <div className="flex items-center justify-between">
          <Link
            className="title-font flex items-center mb-4 text-gray-900 font-medium md:mb-0"
            href="/"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="p-2 w-10 h-10 text-white bg-yellow-500 rounded-full"
            >
              <path
                fillRule="evenodd"
                d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>

            <span className="ml-3 text-xl">EC2 Leaser</span>
          </Link>
          <div className="ml-5 flex gap-4">
            <Link href="/">Start new instance</Link>
            {Resource.App.stage === 'demo' && (
              <>
                <Link href="/instances/snapshot">Snapshot instance</Link>
                <Link href="/instances/restore">Restore instance</Link>
              </>
            )}
          </div>
        </div>

        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/signin' });
          }}
        >
          <Button data-testid="logout" type="submit">
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Navbar;
