import { z } from 'zod';

const MIN_INSTANCE_ID_LENGTH = 17;
const MAX_INSTANCE_ID_LENGTH = 25;

export const FormSchema = z.object({
  instanceId: z
    .string()
    .min(MIN_INSTANCE_ID_LENGTH)
    .max(MAX_INSTANCE_ID_LENGTH)
    .startsWith('i-')
});
