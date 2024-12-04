import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { infer as zodInfer } from 'zod';

import { FormSchema } from '@/schemas/FormSchema';
import { FormInstance } from '../common/FormInstance';
import { callLegacyApi } from '@/api';
import { useUser } from '@/contexts/UserContext';

const SnapshotInstanceContent = () => {
  const user = useUser();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const form = useForm<zodInfer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      instanceId: ''
    }
  });
  const onSubmit = async (values: zodInfer<typeof FormSchema>) => {
    setLoading(true);
    try {
      const result = await callLegacyApi(
        user.token,
        '/ec2/snapshot',
        'POST',
        values
      );
      setMessage(
        `Saving a snapshot under the snapshot ID ${result.snapshotId}`
      );
    } catch (e) {
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage('Unknown error');
      }
    }
    setLoading(false);
  };
  return (
    <div className="container">
      <FormInstance
        form={form}
        onSubmit={onSubmit}
        loading={loading}
        description="This is the instance ID you want to snapshot. Only one backup is stored per instance ID (if exist, previous will be deleted)."
      />
      {message && <p>{message}</p>}
    </div>
  );
};

export default SnapshotInstanceContent;
