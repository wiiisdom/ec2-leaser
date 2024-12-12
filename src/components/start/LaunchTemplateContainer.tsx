import { LaunchTemplateType } from '../../models/LaunchTemplate';
import LaunchTemplate from './LaunchTemplate';

const LaunchTemplateContainer = ({
  data,
  search,
  selectedLaunchTemplateId,
  setLaunchTemplate
}: {
  data: LaunchTemplateType[];
  search: string;
  selectedLaunchTemplateId: string | null;
  setLaunchTemplate: Function;
}) => {
  return (
    <div className="flex flex-wrap -m-4">
      {data
        ?.filter(
          lt =>
            lt.name.toLowerCase().includes(search.toLowerCase()) ||
            lt.id === selectedLaunchTemplateId
        )
        .map(({ id, name }) => {
          const selected = selectedLaunchTemplateId === id;
          return (
            <LaunchTemplate
              key={id}
              id={id}
              name={name}
              selected={selected}
              setLaunchTemplate={setLaunchTemplate}
            />
          );
        })}
    </div>
  );
};

export default LaunchTemplateContainer;
