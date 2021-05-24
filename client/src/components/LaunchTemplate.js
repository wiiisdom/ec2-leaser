import { useEffect, useState } from 'react';

import { API } from 'aws-amplify';

const LaunchTemplate = ({
  launchTemplate,
  selectedLaunchTemplate,
  setLaunchTemplate
}) => {
  const [description, setDescription] = useState('Loading...');

  useEffect(() => {
    API.post('main', '/description', {
      body: {
        instanceId: launchTemplate.id
      }
    })
      .then(data => {
        setDescription(data.description);
      })
      .catch(err => {
        setDescription('no description available.');
      });
  });
  if (
    selectedLaunchTemplate &&
    selectedLaunchTemplate.id === launchTemplate.id
  ) {
    return (
      <div
        className="p-2 md:w-1/2 xl:w-1/3"
        onClick={() => setLaunchTemplate(null)}
      >
        <div className="p-4 bg-yellow-500 border border-gray-200 rounded-lg">
          <LaunchTemplateContent
            launchTemplate={launchTemplate}
            description={description}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="p-2 md:w-1/2 xl:w-1/3"
        onClick={() => setLaunchTemplate(launchTemplate)}
      >
        <div className="p-4 border border-gray-200 rounded-lg">
          <LaunchTemplateContent
            launchTemplate={launchTemplate}
            description={description}
          />
        </div>
      </div>
    );
  }
};

const LaunchTemplateContent = ({ launchTemplate, description }) => {
  return (
    <div className="h-24">
      <h2 className="title-font mb-2 text-gray-900 text-lg font-medium">
        {launchTemplate.name}
      </h2>
      <p className="text-base leading-relaxed">{description}</p>
    </div>
  );
};

export default LaunchTemplate;
