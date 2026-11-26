import { describe, expect, it } from "vitest";

import { ConfigError, validateReferenceConfig } from "@/lib/config";

const validConfig = {
  title: "Langfuse MCP Servers",
  description: "Langfuse MCP reference generated at runtime.",
  servers: [
    {
      id: "langfuse-cloud",
      name: "Langfuse Cloud MCP",
      url: "https://cloud.langfuse.com/api/public/mcp",
      auth: {
        type: "basic",
        publicKeyEnv: "LANGFUSE_PUBLIC_KEY",
        secretKeyEnv: "LANGFUSE_SECRET_KEY",
      },
    },
    {
      id: "langfuse-docs",
      name: "Langfuse Docs MCP",
      url: "https://langfuse.com/api/mcp",
      auth: { type: "none" },
    },
  ],
};

describe("validateReferenceConfig", () => {
  it("loads a valid config and normalizes missing variants", () => {
    const config = validateReferenceConfig(validConfig, {
      LANGFUSE_PUBLIC_KEY: "pk",
      LANGFUSE_SECRET_KEY: "sk",
    });

    expect(config.title).toBe("Langfuse MCP Servers");
    expect(config.description).toBe("Langfuse MCP reference generated at runtime.");
    expect(config.servers).toHaveLength(2);
    expect(config.servers[0].variants).toEqual([]);
  });

  it("rejects duplicate server ids", () => {
    expect(() =>
      validateReferenceConfig(
        {
          title: validConfig.title,
          description: validConfig.description,
          servers: [validConfig.servers[1], validConfig.servers[1]],
        },
        {},
      ),
    ).toThrow(ConfigError);
  });

  it("rejects unsupported auth types", () => {
    expect(() =>
      validateReferenceConfig(
        {
          title: validConfig.title,
          description: validConfig.description,
          servers: [
            {
              ...validConfig.servers[1],
              auth: { type: "bearer" },
            },
          ],
        },
        {},
      ),
    ).toThrow('config.servers[0].auth.type must be "none" or "basic"');
  });

  it("fails when basic auth env vars are missing", () => {
    expect(() => validateReferenceConfig(validConfig, {})).toThrow(
      "langfuse-cloud requires missing build environment variable(s)",
    );
  });

  it("validates only selected server credentials", () => {
    const config = validateReferenceConfig(validConfig, {}, { serverIds: ["langfuse-docs"] });
    expect(config.servers).toHaveLength(1);
    expect(config.servers[0].id).toBe("langfuse-docs");
  });
});
