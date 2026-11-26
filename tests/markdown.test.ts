import { describe, expect, it } from "vitest";

import { generateMarkdown } from "@/lib/markdown";
import type { GeneratedReference } from "@/lib/types";

describe("generateMarkdown", () => {
  it("includes server metadata, variants, snippets, tools, schemas, and examples", () => {
    const markdown = generateMarkdown(reference);

    expect(markdown).toContain("# Langfuse MCP Servers");
    expect(markdown).toContain("Generated reference description.");
    expect(markdown).toContain("### Langfuse Docs MCP");
    expect(markdown).toContain("> ⚠️ **API stability**:");
    expect(markdown).toContain("Clients should dynamically inspect available tools and schemas");
    expect(markdown).toContain("https://langfuse.com/api/mcp");
    expect(markdown).toContain("| Cloud EU |");
    expect(markdown).toContain("##### Cursor: Cursor mcp.json");
    expect(markdown).toContain("##### `search`");
    expect(markdown).toContain("[Requires v4](https://langfuse.com/docs/v4)");
    expect(markdown).toContain('"method": "tools/call"');
  });
});

const reference: GeneratedReference = {
  schemaVersion: "1.0",
  title: "Langfuse MCP Servers",
  description: "Generated reference description.",
  build: {
    generatedAt: "2026-05-15T12:00:00.000Z",
    generator: "test",
    sourceConfig: "mcp-reference.config.json",
    serverCount: 1,
    toolCount: 1,
  },
  servers: [
    {
      id: "langfuse-cloud",
      name: "Langfuse Cloud MCP",
      description: "Cloud server",
      canonicalUrl: "https://cloud.langfuse.com/api/public/mcp",
      auth: {
        type: "basic",
        publicKeyEnv: "LANGFUSE_PUBLIC_KEY",
        secretKeyEnv: "LANGFUSE_SECRET_KEY",
      },
      variants: [],
      discovery: { discoveredAt: "2026-05-15T12:00:00.000Z" },
      resources: [],
      prompts: [],
      setupSnippets: [
        {
          id: "cursor",
          client: "Cursor",
          title: "Cursor mcp.json",
          language: "json",
          code: "{}",
        },
      ],
      tools: [
        {
          name: "search",
          requiresV4: true,
          description: "Search docs",
          inputSchema: { type: "object", properties: { query: { type: "string" } } },
          exampleRequest: {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: { name: "search", arguments: { query: "string" } },
          },
        },
      ],
    },
    {
      id: "langfuse-docs",
      name: "Langfuse Docs MCP",
      canonicalUrl: "https://langfuse.com/api/mcp",
      auth: { type: "none" },
      variants: [{ label: "Cloud EU", url: "https://cloud.langfuse.com/api/public/mcp" }],
      discovery: { discoveredAt: "2026-05-15T12:00:00.000Z" },
      resources: [],
      prompts: [],
      setupSnippets: [
        {
          id: "cursor",
          client: "Cursor",
          title: "Cursor mcp.json",
          language: "json",
          code: "{}",
        },
      ],
      tools: [
        {
          name: "search",
          description: "Search docs",
          inputSchema: { type: "object", properties: { query: { type: "string" } } },
          exampleRequest: {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: { name: "search", arguments: { query: "string" } },
          },
        },
      ],
    },
  ],
};
