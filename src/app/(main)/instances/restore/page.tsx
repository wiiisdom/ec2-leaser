'use client';
import { callApi } from '@/api';
import { FormInstance } from '@/components/common/FormInstance';
import { FormSchema } from '@/schemas/FormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { infer as zodInfer } from 'zod';

export default function RestoreInstancePage() {
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
      const result = await callApi<{
        instanceId: string;
      }>(`/api/instances/${values.instanceId}/restore`, 'POST');
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
}
