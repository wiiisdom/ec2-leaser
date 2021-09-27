import { memo } from 'react';
import { useQuery } from 'react-query';
import { fetchDescription, fetchPolicy } from '../API';

const LaunchTemplate = memo(({ id, name, selected, setLaunchTemplate }) => {
  const { data, isLoading, error } = useQuery(
    ['template', id],
    () => fetchDescription(id),
    fetchPolicy
  );

  const onClick = () =>
    selected ? setLaunchTemplate(null) : setLaunchTemplate({ id, name });

  if (error) console.log(error);

  return (
    <LaunchTemplateContent
      name={name}
      description={
        isLoading
          ? 'Loading...'
          : data?.description ?? 'No description available'
      }
      selected={selected}
      onClick={onClick}
    />
  );
});

const LaunchTemplateContent = ({ name, description, onClick, selected }) => {
  return (
    <div className="p-2 md:w-1/2 xl:w-1/3">
      <div
        className={`p-4 border border-gray-200 rounded-lg cursor-pointer ${
          selected ? 'bg-yellow-500' : ''
        }`}
        onClick={onClick}
      >
        <div className="h-24">
          <h2 className="title-font mb-2 text-gray-900 text-lg font-medium">
            {name}
          </h2>
          <p className="text-base leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default LaunchTemplate;
