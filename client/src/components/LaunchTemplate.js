const LaunchTemplate = ({ launchTemplate }) => {
  return (
    <div className="p-4 md:w-1/2 xl:w-1/3">
      <div className="p-6 border border-gray-200 rounded-lg">
        <h2 className="title-font mb-2 text-gray-900 text-lg font-medium">
          {launchTemplate.name}
        </h2>
        <p className="text-base leading-relaxed">
          Put the description here when we have it.
        </p>
      </div>
    </div>
  );
};

export default LaunchTemplate;
