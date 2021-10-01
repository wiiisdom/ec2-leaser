import React from 'react';

const SelectSpotInstance = ({ isSpotInstance, setIsSpotInstance }) => {
  return (
    <section className="body-font text-gray-600">
      <div className="container mx-auto pb-8 pt-4 px-5">
        <div className="flex flex-col flex-wrap mb-4 w-full">
          <h1 className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl">
            Define instance type{' '}
          </h1>
          <p className="w-full text-gray-500 leading-relaxed">
            Choose if you want your instance to be a spot instance or to have
            standard priority.{' '}
            <span className="text-yellow-600">
              <i>By default, the instance type is set to "Spot".</i>
            </span>
          </p>
          <div className="relative flex-grow w-full">
            <input
              type="checkbox"
              id="spotInstance"
              name="spotInstance"
              className="ml-4 mt-4"
              defaultChecked={isSpotInstance}
              onChange={() => setIsSpotInstance(prev => !prev)}
            />
            <label htmlFor="spotInstance" className="ml-2 text-gray-500">
              Spot instance
            </label>
            {isSpotInstance && <WarningBanner />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SelectSpotInstance;

const WarningBanner = () => (
  <div className="px-8 py-2">
    <div className="relative px-4 py-2 h-full text-center text-gray-700 bg-yellow-200 bg-opacity-75 rounded-lg overflow-hidden">
      You will start a spot instance. It’s cheaper (up to 90% cost reduction)
      but AWS can reclaim the capacity at any time, and the instance will
      shutdown.
      <br />
      Don’t use it for critical workload. More information{' '}
      <a
        href="https://aws.amazon.com/ec2/spot/"
        className="text-blue-600 hover:text-blue-800 visited:text-purple-600 underline"
      >
        here
      </a>
      .
    </div>
  </div>
);
