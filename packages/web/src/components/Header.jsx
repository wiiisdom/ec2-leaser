import { Auth } from 'aws-amplify';

const Header = () => {
  const handleSignOut = () => {
    Auth.signOut();
  };

  return (
    <header className="body-font text-gray-600">
      <div className="container flex flex-col flex-wrap items-center mx-auto p-5 md:flex-row md:justify-between">
        <a
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
        </a>
        <button
          className="inline-flex items-center mt-4 px-3 py-1 text-base bg-gray-100 hover:bg-gray-200 border-0 rounded focus:outline-none md:mt-0"
          onClick={handleSignOut}
        >
          Sign out
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="ml-1 w-4 h-4"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
