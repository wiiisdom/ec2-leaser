import { useEffect, useState } from 'react';
import Header from './Header';

import SelectSpotInstance from './SelectSpotInstance';
import SelectLaunchTemplate from './SelectLaunchTemplate';
import SelectTitle from './SelectTitle';

import { API } from 'aws-amplify';
import Spinner from './Spinner';
import SelectCostCenter from './SelectCostCenter';
import SelectSchedule from './SelectSchedule';
import { UserType } from '../models/User';
import { LaunchTemplateType } from '../models/LaunchTemplate';

const MainScreen = ({ user }: { user: UserType }) => {
  const [selectedLaunchTemplate, setLaunchTemplate] =
    useState<LaunchTemplateType | null>(null);
  const [costCenter, setCostCenter] = useState(null);
  const [title, setTitle] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [isSpotInstance, setIsSpotInstance] = useState(
    import.meta.env.VITE_DEFAULT_SPOT === '1'
  );
  const [schedule, setSchedule] = useState('');

  useEffect(() => {
    if (selectedLaunchTemplate?.name) {
      const originalName = `ec2-leaser-${selectedLaunchTemplate.name}-${user.name}`;
      const cleanName = originalName
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-');
      setTitle(selectedLaunchTemplate?.name ? cleanName : '');
    } else {
      setTitle('');
    }
  }, [selectedLaunchTemplate?.name, user]);

  const handleStart = () => {
    if (selectedLaunchTemplate === null) {
      return;
    }
    setInstanceId('');
    setError('');
    // show spinner
    setStarting(true);

    const body = {
      instanceId: selectedLaunchTemplate.id,
      owner: user.email,
      title,
      isSpotInstance,
      costCenter,
      schedule
    };

    API.post('main', '/start', { body })
      .then(data => {
        setStarting(false);
        setInstanceId(data.instanceId);
        setLaunchTemplate(null);
        setTitle('');
      })
      .catch(err => {
        setStarting(false);
        setError(err.response.data.message);
      });
  };

  return (
    <>
      <Header />
      <SelectLaunchTemplate
        selectedLaunchTemplateId={selectedLaunchTemplate?.id ?? null}
        setLaunchTemplate={setLaunchTemplate}
      />
      <SelectSpotInstance
        isSpotInstance={isSpotInstance}
        setIsSpotInstance={setIsSpotInstance}
      />
      <SelectCostCenter setCostCenter={setCostCenter} costCenter={costCenter} />
      <SelectSchedule setSchedule={setSchedule} schedule={schedule} />
      <SelectTitle
        setTitle={setTitle}
        title={title}
        disabled={!selectedLaunchTemplate || title === '' || !costCenter}
        handleStart={handleStart}
      />
      <section className="body-font text-gray-600">
        <div className="container mx-auto px-5 py-12">
          <div className="flex flex-col flex-wrap mb-4 w-full">
            <h1 className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl">
              Result
            </h1>
            <div className="flex items-center justify-center">
              {starting && <Spinner />}
            </div>
            {error && (
              <div className="text-yellow-800 text-lg font-semibold rounded-sm">
                {error}
              </div>
            )}
            {instanceId && (
              <div className="text-green-800 text-lg font-semibold rounded-sm">
                Instance started ({instanceId})!{' '}
                <a
                  className="underline font-bold"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://console.aws.amazon.com/ec2/v2/home?#Instances:search=${instanceId}`}
                >
                  Direct AWS Console link
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default MainScreen;
