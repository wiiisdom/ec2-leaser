import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { infer as zodInfer } from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormSchema } from '@/schemas/FormSchema';

interface FormInstanceProps {
  form: UseFormReturn<{ instanceId: string }>;
  onSubmit: (values: zodInfer<typeof FormSchema>) => void;
  loading: boolean;
  description: string;
}

export const FormInstance = (props: FormInstanceProps) => {
  return (
    <Form {...props.form}>
      <form
        onSubmit={props.form.handleSubmit(props.onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={props.form.control}
          name="instanceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instance ID</FormLabel>
              <FormControl>
                <Input placeholder="i-06d1...." {...field} />
              </FormControl>
              <FormDescription>{props.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {props.loading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Submit</Button>
        )}
      </form>
    </Form>
  );
};
