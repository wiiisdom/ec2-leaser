import { MouseEventHandler, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { callApi, fetchPolicy } from '@/api';
import { useUser } from '@/contexts/UserContext';

const LaunchTemplate = memo(
  ({
    id,
    name,
    selected,
    setLaunchTemplate
  }: {
    id: string;
    name: string;
    selected: boolean;
    setLaunchTemplate: Function;
  }) => {
    const user = useUser();
    const { data, isLoading, error } = useQuery({
      queryKey: ['template', id],
      queryFn: () =>
        callApi(user.token, '/description', 'POST', { instanceId: id }),
      ...fetchPolicy
    });
    const onClick = () =>
      selected ? setLaunchTemplate(null) : setLaunchTemplate({ id, name });

    if (error) {
      throw new Error(error as string);
    }

    return (
      <LaunchTemplateContent
        name={name}
        description={
          isLoading
            ? 'Loading...'
            : data?.description ?? 'No description available'
        }
        selected={selected}
        onClick={onClick}
      />
    );
  }
);

const LaunchTemplateContent = ({
  name,
  description,
  onClick,
  selected
}: {
  name: string;
  description: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  selected: boolean;
}) => {
  return (
    <div className="p-2 md:w-1/2 xl:w-1/3">
      <div
        className={`p-4 border border-gray-200 rounded-lg cursor-pointer ${
          selected ? 'bg-yellow-500' : ''
        }`}
        onClick={onClick}
      >
        <div className="h-24">
          <h2
            data-testid="template-name"
            className="title-font mb-2 text-gray-900 text-lg font-medium"
          >
            {name}
          </h2>
          <p className="text-base leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default LaunchTemplate;
