import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { infer as zodInfer } from 'zod';

import { FormSchema } from '@/schemas/FormSchema';
import { FormInstance } from '../common/FormInstance';
import { callLegacyApi } from '@/api';
import { useUser } from '@/contexts/UserContext';

const RestoreInstanceContent = () => {
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
        '/ec2/restore',
        'POST',
        values
      );
      setMessage(`Restoring the instance ID ${result.instanceId}`);
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
        description="This is the instance ID you want to restore. It will work only
                  if it has been snapshot'ed before."
      />
      {message && <p>{message}</p>}
    </div>
  );
};

export default RestoreInstanceContent;
