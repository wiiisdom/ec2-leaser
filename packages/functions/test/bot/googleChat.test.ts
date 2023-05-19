import { extractInstanceId, getSlashCommand } from "src/bot/googleChat";
import { describe, it, expect } from "vitest";

describe("googleChat tests", () => {
  it("getSlashCommand must return the correct slash command id", () => {
    const slashCommand = getSlashCommand({
      message: {
        annotations: [
          {
            slashCommand: {
              commandId: "2"
            }
          }
        ]
      }
    });

    expect(slashCommand).toBe(2);
  });

  it("getSlashCommand must return null if no slash command is found v1", () => {
    const slashCommand = getSlashCommand({
      message: {
        annotations: [{}]
      }
    });

    expect(slashCommand).toBe(null);
  });
  it("getSlashCommand must return null if no slash command is found v2", () => {
    const slashCommand = getSlashCommand({
      message: {
        annotations: []
      }
    });

    expect(slashCommand).toBe(null);
  });
  it("getSlashCommand must return null if no slash command is found v3", () => {
    const slashCommand = getSlashCommand({
      message: {}
    });

    expect(slashCommand).toBe(null);
  });

  it("extractInstanceId must return the correct instance id", () => {
    const instanceId = extractInstanceId("/snapshot i-0d5575b0c489171ed");
    expect(instanceId).toBe("i-0d5575b0c489171ed");
  });

  it("extractInstanceId must return the correct instance id with extract space", () => {
    const instanceId = extractInstanceId("/snapshot i-0d5575b0c489171ed ");
    expect(instanceId).toBe("i-0d5575b0c489171ed");
  });

  it("extractInstanceId must return null if undefined text provided", () => {
    const instanceId = extractInstanceId(undefined);
    expect(instanceId).toBe(null);
  });

  it("extractInstanceId must return null if null text provided", () => {
    const instanceId = extractInstanceId(null);
    expect(instanceId).toBe(null);
  });
});
