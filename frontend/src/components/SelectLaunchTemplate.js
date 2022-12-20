import { useState } from 'react';
import Spinner from 'react-svg-spinner';
import LaunchTemplate from './LaunchTemplate';
import { useQuery } from 'react-query';
import { fetchList, fetchPolicy } from '../API';

const SelectLaunchTemplate = ({
  selectedLaunchTemplateId,
  setLaunchTemplate
}) => {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useQuery(
    'launchTemplates',
    fetchList,
    fetchPolicy
  );

  if (error) throw new Error(error);

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
        {isLoading && (
          <div className="flex items-center justify-center">
            <Spinner size="48" color="lightgrey" />
          </div>
        )}
        <div className="flex flex-wrap -m-4">
          {data &&
            data
              .filter(
                lt =>
                  lt.name.toLowerCase().includes(search.toLowerCase()) ||
                  lt === selectedLaunchTemplateId
              )
              .map(({ id, name }) => {
                const selected = selectedLaunchTemplateId === id;
                return (
                  <LaunchTemplate
                    key={id}
                    id={id}
                    name={name}
                    selected={selected}
                    setLaunchTemplate={setLaunchTemplate}
                  />
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default SelectLaunchTemplate;
