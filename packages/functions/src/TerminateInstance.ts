import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import EC2 from 'aws-sdk/clients/ec2';
import debug from 'debug';

const MAX_DAYS = 6;
export const handler: APIGatewayProxyHandlerV2 = async () => {
  const info = debug('app:info');
  const ec2 = new EC2();

  const today = new Date();
  let terminatedInstances = 0;

  const filter = {
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
  };
  try {
    const data = await ec2.describeInstances(filter).promise();
    data.Reservations?.forEach(reservation => {
      reservation.Instances?.forEach(async instance => {
        info('Will check ec2 ' + instance.InstanceId + ' last started on ' + instance.LaunchTime);
        if (instance.LaunchTime === undefined) {
          // no launch date, skipping !
        } else if (addDays(instance.LaunchTime, getDays(instance)) < today) {
          info(
            'Will terminate ec2 ' + instance.InstanceId + ' last started on ' + instance.LaunchTime
          );
          if (instance.InstanceId) {
            const params = {
              InstanceIds: [instance.InstanceId],
            };
            await ec2.terminateInstances(params).promise();
            info('Instance ' + instance.InstanceId + ' terminated.');
            terminatedInstances++;
          }
        }
      });
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(`${terminatedInstances} instances terminated.`),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(error),
    };
  }
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

const getDays = (instance: EC2.Instance) => {
  let out = MAX_DAYS;
  const days = instance.Tags?.filter(e => e.Key === 'Ec2LeaserDuration');
  if (days?.length === 1 && days[0].Value) {
    out = +days[0]?.Value;
  }
  return out;
};
