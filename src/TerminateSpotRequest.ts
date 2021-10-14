import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import EC2 from "aws-sdk/clients/ec2";

const RESPONSES = {
  SUCCESS: (content: string) => ({
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(content),
  }),
  FAILURE: (error: unknown) => ({
    statusCode: 500,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(error),
  }),
};

export const handler: APIGatewayProxyHandlerV2 = async () => {
  const ec2 = new EC2();

  const getInstance = async (request: EC2.SpotInstanceRequest) => {
    if (!request.InstanceId) return;
    const instance = await ec2.describeInstances({ InstanceIds: [request.InstanceId] }).promise();
    return instance?.Reservations?.[0];
  };

  try {
    const { SpotInstanceRequests } = await ec2.describeSpotInstanceRequests().promise();
    if (SpotInstanceRequests === undefined) throw new Error("Error getting Spot Instance Requests");
    if (SpotInstanceRequests.length === 0) return RESPONSES.SUCCESS("No Spot Instance Requests to delete");

    const cancellationArray = await Promise.allSettled(
      SpotInstanceRequests.map(async (request) => {
        const spotInstanceRequestId = request?.SpotInstanceRequestId;
        // check if there is a SpotInstanceRequestId
        if (!spotInstanceRequestId) {
          console.log(`\t[${spotInstanceRequestId}]: No spotInstanceRequestId so exiting`);
          return 0;
        }

        // check if the request is already cancelled
        if (request.State == "cancelled") {
          console.log(`\t[${spotInstanceRequestId}]: already cancelled so exiting`);
          return 0;
        }

        const instanceCreatedByRequest = await getInstance(request);
        const instanceTags = instanceCreatedByRequest?.Instances?.[0]?.Tags;

        // check if attached instance have a Name tag (keep it!)
        if (instanceTags?.find((tag) => tag.Key === "Name")) {
          console.log(`\t[${spotInstanceRequestId}]: Attached instance have a Name tag so exiting`);
          return 0;
        }

        // else destroy the spot request (and instance if existing)
        const instanceId = instanceCreatedByRequest?.Instances?.[0]?.InstanceId;
        console.log(
          `\tCancel spot request [${spotInstanceRequestId}] and terminate linked instance ${instanceId}`
        );

        await ec2.cancelSpotInstanceRequests({ SpotInstanceRequestIds: [spotInstanceRequestId] }).promise();
        if (instanceId) {
          await ec2.terminateInstances({ InstanceIds: [instanceId] }).promise();
        }
        return 1;
      })
    );

    const totalRequestsCancelled = cancellationArray
      .filter(({ status }) => status === "fulfilled")
      .map((c) => <PromiseFulfilledResult<any>>c)
      .map((c) => c.value);

    const total = totalRequestsCancelled.reduce((prev, curr) => prev + curr);
    const result = `${total} spot request${total ? "" : "s"} cancelled.`;
    console.log(result);

    return RESPONSES.SUCCESS(JSON.stringify(result));
  } catch (error) {
    return RESPONSES.FAILURE(error);
  }
};
