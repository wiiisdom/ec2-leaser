import { API } from 'aws-amplify';
import { useQuery } from 'react-query';

const fetchDescription = id =>
  API.post('main', '/description', {
    body: {
      instanceId: id
    }
  });

const LaunchTemplate = ({
  id,
  name,
  selectedLaunchTemplate,
  setLaunchTemplate
}) => {
  const { data, isLoading, error } = useQuery(
    ['template', id],
    () => fetchDescription(id),
    { cacheTime: 5 * 60 * 1000, retry: 2, staleTime: 5 * 59 * 1000 }
  );

  if (error) console.log(error);
  // if (
  //   selectedLaunchTemplate &&
  //   selectedLaunchTemplate.id === id
  // ) {
  //   return (
  //     <div
  //       className="p-2 md:w-1/2 xl:w-1/3"
  //       onClick={() => setLaunchTemplate(null)}
  //     >
  //       <div className="p-4 bg-yellow-500 border border-gray-200 rounded-lg">
  //         <LaunchTemplateContent
  //           launchTemplate={launchTemplate}
  //           description={launchTemplate.description}
  //         />
  //       </div>
  //     </div>
  //   );
  // } else {
  return (
    <div
      className="p-2 md:w-1/2 xl:w-1/3"
      onClick={() => setLaunchTemplate({ id, name })}
    >
      <div className="p-4 border border-gray-200 rounded-lg">
        <LaunchTemplateContent
          name={name}
          description={
            isLoading
              ? 'Loading...'
              : data?.description ?? 'No description available'
          }
        />
      </div>
    </div>
  );
};

const LaunchTemplateContent = ({ name, description }) => {
  return (
    <div className="h-24">
      <h2 className="title-font mb-2 text-gray-900 text-lg font-medium">
        {name}
      </h2>
      <p className="text-base leading-relaxed">{description}</p>
    </div>
  );
};

// const MemoizedLaunchTemplate = memo(LaunchTemplate);
export default LaunchTemplate;
