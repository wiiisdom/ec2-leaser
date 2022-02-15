import SelectStart from './SelectStart';

const SelectTitle = ({ title, setTitle, handleStart, disabled }) => {
  const setCleanTitle = value => {
    if (value) {
      setTitle(value.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'));
    }
  };

  return (
    <section className="body-font text-gray-600">
      <div className="container mx-auto px-5">
        <div className="flex flex-col mb-6 w-full">
          <h1 className="title-font mb-4 text-gray-900 text-2xl font-medium sm:text-3xl">
            Add a title
          </h1>
          <p className="text-base leading-relaxed lg:w-2/3">
            Customize the name of the instance that will be started
          </p>
        </div>
        <div className="flex flex-col items-end mx-auto px-8 w-full space-y-4 sm:flex-row sm:px-0 sm:space-x-4 sm:space-y-0 lg:w-2/3">
          <div className="relative flex-grow w-full">
            <label htmlFor="name" className="text-gray-600 text-sm leading-7">
              Instance Name
            </label>
            <input
              type="name"
              id="name"
              name="name"
              value={title}
              onChange={e => setCleanTitle(e.target.value)}
              className="px-3 py-1 w-full text-gray-700 text-base leading-8 bg-gray-100 focus:bg-transparent bg-opacity-50 border border-gray-300 focus:border-yellow-500 rounded outline-none transition-colors duration-200 ease-in-out focus:ring-yellow-200 focus:ring-2"
            />
          </div>
          <SelectStart disabled={disabled} handleStart={handleStart} />
        </div>
      </div>
    </section>
  );
};

export default SelectTitle;
