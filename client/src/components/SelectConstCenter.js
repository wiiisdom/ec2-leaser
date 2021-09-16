const SelectConstCenter = () => {
  return (
    <section className="body-font text-gray-600">
      <div className="container mx-auto px-5 py-12">
        <div className="flex flex-col flex-wrap mb-4 w-full">
          <h1 className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl">
            Select CostCenter
          </h1>
          <p className="w-full text-gray-500 leading-relaxed lg:w-1/2">
            Select the tag to apply to the EC2 instance on AWS.This should be
            set based on the project related to the instance.
          </p>
          <div className="relative flex-grow w-full">
            <select>
              <option value={1}>one</option>
              <option value={2}>two</option>
              <option value={3}>three</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SelectConstCenter;
