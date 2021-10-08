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
        if (!spotInstanceRequestId) return 0;
        const instanceCreatedByRequest = await getInstance(request);
        const instanceTags = instanceCreatedByRequest?.Instances?.[0]?.Tags;

        if (instanceTags?.find((tag) => tag.Key === "Name")) return 0;

        const instanceId = instanceCreatedByRequest?.Instances?.[0]?.InstanceId;
        if (!instanceId) return 0;

        await ec2.terminateInstances({ InstanceIds: [instanceId] }).promise();
        await ec2.cancelSpotInstanceRequests({ SpotInstanceRequestIds: [spotInstanceRequestId] }).promise();
        return 1;
      })
    );

    const totalRequestsCancelled = cancellationArray
      .filter(({ status }) => status === "fulfilled")
      .map((c) => <PromiseFulfilledResult<any>>c)
      .map((c) => c.value);

    const total = totalRequestsCancelled.reduce((prev, curr) => prev + curr);

    return RESPONSES.SUCCESS(JSON.stringify(`${total} spot request${total ? "" : "s"} cancelled.`));
  } catch (error) {
    return RESPONSES.FAILURE(error);
  }
};
