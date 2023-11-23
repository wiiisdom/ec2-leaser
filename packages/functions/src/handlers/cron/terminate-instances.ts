import {
  DescribeInstancesCommand,
  EC2Client,
  TerminateInstancesCommand,
  Instance,
} from '@aws-sdk/client-ec2';
import debug from 'debug';

const MAX_DAYS = 6;
const info = debug('ec2-leaser');
const today = new Date();

const client = new EC2Client({});

export const handler = async () => {
  let terminatedInstances = 0;

  const data = await client.send(
    new DescribeInstancesCommand({
      Filters: [
        {
          Name: 'instance-state-name',
          Values: ['running', 'stopped'],
        },
        {
          Name: 'tag:Ec2LeaserDuration',
          Values: ['*'],
        },
      ],
    })
  );
  for (const reservation of data.Reservations ?? []) {
    for (const instance of reservation.Instances ?? []) {
      const isTerminated = await checkInstance(instance);
      if (isTerminated) {
        terminatedInstances++;
      }
    }
  }

  return `${terminatedInstances} instances terminated.`;
};

const checkInstance = async (instance: Instance) => {
  info(`Will check ec2 ${instance.InstanceId} last started on ${instance.LaunchTime}`);
  if (instance.LaunchTime === undefined) {
    // no launch date, skipping !
    return false;
  }
  if (addDays(instance.LaunchTime, getDays(instance)) < today) {
    info(`Will terminate ec2 ${instance.InstanceId} last started on ${instance.LaunchTime}`);
    if (instance.InstanceId) {
      await client.send(
        new TerminateInstancesCommand({
          InstanceIds: [instance.InstanceId],
        })
      );
      info(`Instance ${instance.InstanceId} terminated.`);
      return true;
    }
  }
  return false;
};

/**
 *
 * @param date
 * @param days
 * @returns Date
 */
function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const getDays = (instance: Instance) => {
  let out = MAX_DAYS;
  const days = instance.Tags?.filter(e => e.Key === 'Ec2LeaserDuration');
  if (days?.length === 1 && days[0].Value) {
    out = +days[0]?.Value;
  }
  return out;
};
