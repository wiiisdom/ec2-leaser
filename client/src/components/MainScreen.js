import { API } from 'aws-amplify';
import { useEffect, useState } from 'react';
import Header from './Header';
import LaunchTemplate from './LaunchTemplate';

const MainScreen = ({ user }) => {
  const [launchTemplates, setLaunchTemplates] = useState([]);
  useEffect(() => {
    API.get('main', '/list')
      .then(data => setLaunchTemplates(data))
      .catch(err => console.error(err));
  });
  return (
    <>
      <Header />
      <section className="body-font text-gray-600">
        <div className="container mx-auto px-5 py-12">
          <div className="flex flex-col flex-wrap items-center mb-4 w-full text-center">
            <h1 className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl">
              Choose your template
            </h1>
            <p className="w-full text-gray-500 leading-relaxed lg:w-1/2">
              Click on the desired <i>Launch Template</i> you want to start.
            </p>
          </div>
          <div className="flex flex-wrap -m-4">
            {launchTemplates.map((launchTemplate, key) => (
              <LaunchTemplate key={key} launchTemplate={launchTemplate} />
            ))}
          </div>
        </div>
      </section>

      <section class="body-font text-gray-600">
        <div class="container mx-auto px-5">
          <div class="flex flex-col mb-12 w-full text-center">
            <h1 class="title-font mb-4 text-gray-900 text-2xl font-medium sm:text-3xl">
              Master Cleanse Reliac Heirloom
            </h1>
            <p class="mx-auto text-base leading-relaxed lg:w-2/3">
              Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical
              gentrify, subway tile poke farm-to-table. Franzen you probably
              haven't heard of them man bun deep.
            </p>
          </div>
          <div class="flex flex-col items-end mx-auto px-8 w-full space-y-4 sm:flex-row sm:px-0 sm:space-x-4 sm:space-y-0 lg:w-2/3">
            <div class="relative flex-grow w-full">
              <label for="email" class="text-gray-600 text-sm leading-7">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                class="px-3 py-1 w-full text-gray-700 text-base leading-8 bg-gray-100 focus:bg-transparent bg-opacity-50 border border-gray-300 focus:border-yellow-500 rounded outline-none transition-colors duration-200 ease-in-out focus:ring-yellow-200 focus:ring-2"
              />
            </div>
            <button class="px-8 py-2 text-white text-lg bg-yellow-500 hover:bg-yellow-600 border-0 rounded focus:outline-none">
              Button
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainScreen;
