import Spinner from '../common/Spinner';
import { InstanceInfo } from '@/models/Instance';

type StartResultProps = {
  starting: boolean;
  instanceInfo?: InstanceInfo;
  error?: string;
};

const StartResult = (props: StartResultProps) => {
  return (
    <section className="body-font text-gray-600">
      <div className="container mx-auto px-5 py-12">
        <div className="flex flex-col flex-wrap mb-4 w-full">
          <h1
            data-testid="result"
            className="title-font mb-2 text-gray-900 text-2xl font-medium sm:text-3xl"
          >
            Result
          </h1>
          <div className="flex items-center justify-center">
            {props.starting && <Spinner />}
          </div>
          {props.error && (
            <div className="text-yellow-800 text-lg font-semibold rounded-sm">
              {props.error}
            </div>
          )}
          {props.instanceInfo && (
            <div className="text-green-800 text-lg font-semibold rounded-sm">
              Instance started ({props.instanceInfo.instanceId})!{' '}
              <a
                className="underline font-bold"
                target="_blank"
                rel="noreferrer"
                href={`https://console.aws.amazon.com/ec2/v2/home?#Instances:search=${props.instanceInfo.instanceId}`}
              >
                Direct AWS Console link
              </a>
              . The private IP address of the instance is:{' '}
              <strong>{props.instanceInfo.privateIp}</strong>.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StartResult;
