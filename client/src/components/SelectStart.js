const SelectStart = ({ selectedLaunchTemplate, title, handleStart }) => {
  const readyToLaunch = selectedLaunchTemplate && title !== '';

  if (readyToLaunch) {
    return (
      <button
        onClick={handleStart}
        className="py-2 w-56 text-white text-lg bg-yellow-500 hover:bg-yellow-600 border-0 rounded focus:outline-none"
      >
        Start it!
      </button>
    );
  } else {
    return (
      <button
        disabled
        className="py-2 w-56 text-white text-lg bg-yellow-300 border-0 rounded cursor-default"
      >
        Can't start now...
      </button>
    );
  }
};

export default SelectStart;
