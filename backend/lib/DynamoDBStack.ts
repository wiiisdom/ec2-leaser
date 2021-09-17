import * as sst from "@serverless-stack/resources";

export default class DynamoDBTable extends sst.Stack {
  public table: sst.Table;

  constructor(scope: sst.App, id: string) {
    super(scope, id);

    this.table = new sst.Table(this, "dynamodb-cost-center-list", {
      fields: {
        id: sst.TableFieldType.NUMBER,
        name: sst.TableFieldType.STRING,
        description: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "id" },
    });
  }
}
