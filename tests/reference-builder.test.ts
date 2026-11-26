import { describe, expect, it, vi } from "vitest";

import { buildReferenceArtifacts } from "@/lib/reference-builder";
import type { ServerConfig } from "@/lib/types";
import type { discoverMcpServer } from "@/lib/discovery-client";

type DiscoveryOptions = Parameters<typeof discoverMcpServer>[1];

const config = {
  title: "Langfuse MCP Servers",
  description: "Runtime generated MCP reference.",
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

describe("buildReferenceArtifacts", () => {
  it("discovers configured servers and returns snapshot plus markdown", async () => {
    const discover = vi.fn(async (server: ServerConfig, options?: DiscoveryOptions) => ({
      discovery: {
        discoveredAt: "2026-05-18T10:00:00.000Z",
        protocolVersion: "2025-06-18",
        capabilities: { tools: {} },
      },
      tools: [
        {
          name: server.id === "langfuse-cloud" ? "listObservations" : "search",
          inputSchema: { type: "object" },
          exampleRequest: {
            jsonrpc: "2.0",
            method: "tools/call",
            params: {
              name: server.id === "langfuse-cloud" ? "listObservations" : "search",
              arguments: {},
            },
          },
        },
      ],
      resources: [],
      prompts: [],
      headers: options?.headers,
    }));

    const { snapshot, markdown } = await buildReferenceArtifacts({
      config,
      discover,
      env: {
        LANGFUSE_PUBLIC_KEY: "public-key",
        LANGFUSE_SECRET_KEY: "supersecret",
      },
      now: () => new Date("2026-05-18T12:00:00.000Z"),
    });

    expect(snapshot.build).toMatchObject({
      generatedAt: "2026-05-18T12:00:00.000Z",
      serverCount: 2,
      toolCount: 2,
      sourceConfig: "mcp-reference.config.json",
    });
    expect(snapshot.servers.map((server) => server.id)).toEqual([
      "langfuse-cloud",
      "langfuse-docs",
    ]);
    expect(snapshot.servers[0].tools[0].requiresV4).toBe(true);
    expect(snapshot.servers[1].tools[0].requiresV4).toBeUndefined();
    expect(markdown).toContain("[Requires v4](https://langfuse.com/docs/v4)");
    expect(markdown).toContain("This is an hourly regenerated snapshot.");
    expect(JSON.stringify(snapshot)).not.toContain("supersecret");

    expect(discover).toHaveBeenCalledTimes(2);
    expect(discover.mock.calls[0][1]?.headers).toEqual({
      Authorization: `Basic ${Buffer.from("public-key:supersecret").toString("base64")}`,
    });
    expect(discover.mock.calls[1][1]?.headers).toEqual({});
  });

  it("can select servers from MCP_REFERENCE_SERVER_IDS for unauthenticated local runs", async () => {
    const discover = vi.fn(async (server: ServerConfig) => ({
      discovery: { discoveredAt: "2026-05-18T10:00:00.000Z" },
      tools: [
        {
          name: `${server.id}-tool`,
          inputSchema: { type: "object" },
          exampleRequest: {
            jsonrpc: "2.0",
            method: "tools/call",
            params: { name: `${server.id}-tool`, arguments: {} },
          },
        },
      ],
      resources: [],
      prompts: [],
    }));

    const { snapshot } = await buildReferenceArtifacts({
      config,
      discover,
      env: {
        MCP_REFERENCE_SERVER_IDS: "langfuse-docs",
      },
      now: () => new Date("2026-05-18T12:00:00.000Z"),
    });

    expect(snapshot.servers.map((server) => server.id)).toEqual(["langfuse-docs"]);
    expect(discover).toHaveBeenCalledTimes(1);
  });
});
