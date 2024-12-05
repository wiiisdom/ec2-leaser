import { useEffect, useState } from 'react';

import SelectLaunchTemplate from './SelectLaunchTemplate';
import SelectTitle from './SelectTitle';

import SelectCostCenter from './SelectCostCenter';
import SelectSchedule from './SelectSchedule';
import { LaunchTemplateType } from '../../models/LaunchTemplate';
import { useUser } from '@/contexts/UserContext';
import { callApi } from '@/api';
import StartResult from './StartResult';
import { InstanceInfo } from '@/models/Instance';
import { StartInstanceInput } from '@/lib/ec2Utils';

const StartInstanceContent = () => {
  const user = useUser();
  const [selectedLaunchTemplate, setSelectedLaunchTemplate] =
    useState<LaunchTemplateType | null>(null);
  const [costCenter, setCostCenter] = useState('');
  const [title, setTitle] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [instanceInfo, setInstanceInfo] = useState<InstanceInfo>();
  const [schedule, setSchedule] = useState('');

  useEffect(() => {
    if (selectedLaunchTemplate?.name) {
      const originalName = `ec2-leaser-${selectedLaunchTemplate.name}-${user.userId}`;
      const cleanName = originalName
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-');
      setTitle(selectedLaunchTemplate?.name ? cleanName : '');
    } else {
      setTitle('');
    }
  }, [selectedLaunchTemplate?.name, user.userId]);

  const handleStart = () => {
    if (selectedLaunchTemplate === null) {
      return;
    }
    setInstanceInfo(undefined);
    setError('');
    // show spinner
    setStarting(true);

    const body: StartInstanceInput = {
      launchTemplateId: selectedLaunchTemplate.id,
      owner: user.userId,
      title,
      costCenter,
      schedule
    };

    callApi<InstanceInfo>(user.token, '/api/instances', 'POST', body)
      .then(data => {
        setStarting(false);
        setInstanceInfo(data);
        setSelectedLaunchTemplate(null);
        setTitle('');
      })
      .catch(err => {
        setStarting(false);
        setError(err.message);
      });
  };

  return (
    <>
      <SelectLaunchTemplate
        selectedLaunchTemplateId={selectedLaunchTemplate?.id ?? null}
        setLaunchTemplate={setSelectedLaunchTemplate}
      />
      <SelectCostCenter setCostCenter={setCostCenter} costCenter={costCenter} />
      <SelectSchedule setSchedule={setSchedule} schedule={schedule} />
      <SelectTitle
        setTitle={setTitle}
        title={title}
        disabled={!selectedLaunchTemplate || title === '' || !costCenter}
        handleStart={handleStart}
      />
      <StartResult
        instanceInfo={instanceInfo}
        starting={starting}
        error={error}
      />
    </>
  );
};

export default StartInstanceContent;
