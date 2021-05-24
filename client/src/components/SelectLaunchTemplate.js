import { useEffect, useState } from 'react';

import Spinner from 'react-svg-spinner';
import { API } from 'aws-amplify';

import LaunchTemplate from './LaunchTemplate';

const SelectLaunchTemplate = ({
  selectedLaunchTemplate,
  handleSetLaunchTemplate
}) => {
  const [launchTemplates, setLaunchTemplates] = useState(null);
  const [search, setSearch] = useState('');

  // grab launch templates from API
  useEffect(() => {
    API.get('main', '/list')
      .then(data => setLaunchTemplates(data))
      .catch(err => console.error(err));
  }, []);

  const templates = (
    <div className="flex flex-wrap -m-4">
      {launchTemplates &&
        launchTemplates
          .filter(
            lt =>
              lt.name.toLowerCase().includes(search.toLowerCase()) ||
              lt === selectedLaunchTemplate
          )
          .map((launchTemplate, key) => (
            <LaunchTemplate
              key={key}
              launchTemplate={launchTemplate}
              selectedLaunchTemplate={selectedLaunchTemplate}
              setLaunchTemplate={handleSetLaunchTemplate}
            />
          ))}
    </div>
  );

  return (
    <section className="body-font text-gray-600">
      <div className="container mx-auto px-5 py-12">
        <div className="flex flex-col flex-wrap mb-4 w-full">
          <h1 className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl">
            Choose your template
          </h1>
          <p className="w-full text-gray-500 leading-relaxed lg:w-1/2">
            Click on the desired <i>launch template</i> you want to start.
          </p>
          <div className="relative flex-grow w-full">
            <input
              type="text"
              id="search"
              name="search"
              placeholder="search..."
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1 w-full text-gray-700 text-base leading-8 bg-gray-100 focus:bg-transparent bg-opacity-50 border border-gray-300 focus:border-yellow-500 rounded outline-none transition-colors duration-200 ease-in-out focus:ring-yellow-200 focus:ring-2"
            />
          </div>
        </div>
        {launchTemplates ? (
          templates
        ) : (
          <div className="flex items-center justify-center">
            <Spinner size="48" color="lightgrey" />
          </div>
        )}
      </div>
    </section>
  );
};

export default SelectLaunchTemplate;
