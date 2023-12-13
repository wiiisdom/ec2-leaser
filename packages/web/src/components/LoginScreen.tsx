import { Button } from './ui/button';

const LoginScreen = () => {
  return (
    <section className="body-font text-gray-600">
      <div className="container flex flex-col items-center mx-auto px-5 py-24 md:flex-row">
        <div className="mb-10 w-5/6 md:mb-0 md:w-1/2 lg:w-full lg:max-w-lg">
          <img
            className="rounded object-cover object-center"
            alt="hero"
            src="/peak.jpeg"
          />
        </div>
        <div className="flex flex-col items-center text-center md:items-start md:pl-16 md:w-1/2 md:text-left lg:flex-grow lg:pl-24">
          <h1 className="title-font mb-4 text-gray-900 text-3xl font-medium sm:text-4xl">
            EC2 Leaser
          </h1>
          <p className="mb-8 leading-relaxed">
            Simple tool to help you start temporary EC2 instance with automatic
            terminate after a fixed duration.
            <br />
            Start by providing your enterprise account.
          </p>
          <div className="flex justify-center">
            <div className="m-1">
              <a
                data-testid="azure-login"
                href={`${import.meta.env.VITE_API}/auth/azure/authorize`}
              >
                <Button>Login with Azure</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginScreen;
