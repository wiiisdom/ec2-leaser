import { API } from 'aws-amplify';
import { useState, useEffect } from 'react';
import Spinner from './../common/Spinner';
import { CostCenterType } from '../../models/CostCenter';

const SelectCostCenter = ({
  costCenter,
  setCostCenter
}: {
  costCenter: CostCenterType | null;
  setCostCenter: Function;
}) => {
  const [costCenters, setCostCenters] = useState<CostCenterType[]>([]);

  useEffect(() => {
    const fetchCostCenters = async () => {
      const data = (await API.get(
        'main',
        '/costcenters',
        {}
      )) as CostCenterType[];
      data.sort((a: CostCenterType, b: CostCenterType) =>
        a.name.localeCompare(b.name)
      );
      setCostCenters(data);
    };
    fetchCostCenters().catch(() => {
      // comment for sonar
    });
  }, []);

  const optionsRender = costCenters.map(cc => (
    <option value={cc.name} key={cc.name}>
      {cc.name} - {cc.description}
    </option>
  ));
  if (!costCenter) {
    optionsRender.unshift(<option value="" key=""></option>);
  }
  return (
    <section className="body-font text-gray-600">
      <div className="container mx-auto pb-8 pt-4 px-5">
        <div className="flex flex-col flex-wrap mb-4 w-full">
          <h1 className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl">
            Select Cost Center
          </h1>
          <p className="w-full text-gray-500 leading-relaxed">
            Select the tag to apply to the EC2 instance on AWS. This should be
            set based on the project the instance is used for.
          </p>
          {costCenters.length ? (
            <select
              onChange={e => setCostCenter(e.target.value)}
              className="mt-4 px-3 py-1 w-full text-gray-700 text-base leading-8 bg-gray-100 focus:bg-transparent bg-opacity-50 border border-gray-300 focus:border-yellow-500 rounded outline-none transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-yellow-200 lg:w-max"
            >
              {optionsRender}
            </select>
          ) : (
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SelectCostCenter;
