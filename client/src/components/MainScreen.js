import { useState } from 'react';
import Header from './HeaderComponent';

import SelectSpotInstance from './SelectSpotInstance';
import SelectLaunchTemplate from './SelectLaunchTemplate';
import SelectTitle from './SelectTitle';

import { API } from 'aws-amplify';
import Spinner from 'react-svg-spinner';
import SelectConstCenter from './SelectConstCenter';

const MainScreen = ({ user }) => {
  const [selectedLaunchTemplate, setLaunchTemplate] = useState(null);
  const [costCenter, setCostCenter] = useState(null);
  const [title, setTitle] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const [instanceId, setInstanceId] = useState(null);
  const [spotInstance, setSpotInstance] = useState(true);

  const handleSetLaunchTemplate = launchTemplate => {
    if (launchTemplate) {
      const orignalName = `ec2-leaser-${launchTemplate.name}-${user}`;
      const cleanName = orignalName
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-');
      setTitle(launchTemplate ? cleanName : '');
    }
    setLaunchTemplate(launchTemplate);
  };

  const handleStart = () => {
    setInstanceId();
    setError();
    // show spinner
    setStarting(true);

    const body = {
      instanceId: selectedLaunchTemplate.id,
      title,
      user,
      spotInstance,
      costCenter
    };

    API.post('main', '/start', { body })
      .then(data => {
        setStarting(false);
        setInstanceId(data.instanceId);
        handleSetLaunchTemplate(null);
        setTitle(null);
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
        selectedLaunchTemplate={selectedLaunchTemplate}
        handleSetLaunchTemplate={handleSetLaunchTemplate}
      />
      <SelectSpotInstance
        spotInstance={spotInstance}
        setSpotInstance={setSpotInstance}
      />
      <SelectConstCenter
        setCostCenter={setCostCenter}
        costCenter={costCenter}
      />
      <SelectTitle
        setTitle={setTitle}
        title={title}
        selectedLaunchTemplate={selectedLaunchTemplate}
        handleStart={handleStart}
      />
      <section className="body-font text-gray-600">
        <div className="container mx-auto px-5 py-12">
          <div className="flex flex-col flex-wrap mb-4 w-full">
            <h1 className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl">
              Result
            </h1>
            <div className="flex items-center justify-center">
              {starting && <Spinner size="48" color="lightgrey" />}
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
