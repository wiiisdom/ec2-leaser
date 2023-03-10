import { API } from 'aws-amplify';
import { useState, useEffect } from 'react';
import Spinner from 'react-svg-spinner';

const SelectSchedule = ({ schedule, setSchedule }) => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    try {
      async function fetchSchedules() {
        const data = await API.get('main', '/schedules');
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setSchedules(sortedData);

        // adds lille as default selection
        setSchedule(sortedData[0].name);
      }
      fetchSchedules();
    } catch (error) {
      throw new Error(error);
    }
  }, [setSchedule]);

  const optionsRender = schedules.map(schedule => (
    <option value={schedule.name} key={schedule.name}>
      {schedule.name} - {schedule.description}
    </option>
  ));

  return (
    <section className="body-font text-gray-600">
      <div className="container mx-auto pb-8 pt-4 px-5">
        <div className="flex flex-col flex-wrap mb-4 w-full">
          <h1 className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl">
            Select Schedule
          </h1>
          <p className="w-full text-gray-500 leading-relaxed">
            Select the schedule the EC2 instance should be running on.
          </p>
          {schedules.length ? (
            <select
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              className="mt-4 px-3 py-1 w-full text-gray-700 text-base leading-8 bg-gray-100 focus:bg-transparent bg-opacity-50 border border-gray-300 focus:border-yellow-500 rounded outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-yellow-200 lg:w-max"
            >
              {optionsRender}
            </select>
          ) : (
            <div className="flex items-center justify-center">
              <Spinner size="48" color="lightgrey" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SelectSchedule;
