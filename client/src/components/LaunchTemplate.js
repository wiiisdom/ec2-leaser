const LaunchTemplate = ({
  launchTemplate,
  selectedLaunchTemplate,
  setLaunchTemplate
}) => {
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
            description={launchTemplate.description}
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
            description={launchTemplate.description}
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
