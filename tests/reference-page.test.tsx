import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReferencePage } from "@/components/reference-page";
import type { GeneratedReference } from "@/lib/types";

describe("ReferencePage", () => {
  it("renders server navigation, setup snippets, tool schemas, and header artifact buttons", () => {
    render(<ReferencePage markdown="# Ref" snapshot={reference} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Generated Test MCP Reference",
      }),
    ).toBeTruthy();
    expect(screen.getAllByText("Langfuse MCP server").length).toBeGreaterThan(0);
    expect(screen.getByText("API stability")).toBeTruthy();
    expect(screen.getByText(/Clients should dynamically inspect available tools and schemas/)).toBeTruthy();
    expect(screen.getByText("Cursor mcp.json")).toBeTruthy();
    expect(screen.getAllByText("search").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Requires v4" }).getAttribute("href")).toBe(
      "https://langfuse.com/docs/v4",
    );
    expect(
      screen
        .getAllByRole("link", { name: /JSON/i })
        .some(
          (link) =>
            link.getAttribute("href") === "/generated/mcp-reference.json",
        ),
    ).toBe(true);
  });
});

const reference: GeneratedReference = {
  schemaVersion: "1.0",
  title: "Generated Test MCP Reference",
  description: "Generated test description.",
  build: {
    generatedAt: "2026-05-15T12:00:00.000Z",
    generator: "test",
    sourceConfig: "mcp-reference.config.json",
    serverCount: 1,
    toolCount: 1,
  },
  servers: [
    {
      id: "langfuse",
      name: "Langfuse MCP server",
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
          inputSchema: {
            type: "object",
            properties: { query: { type: "string" } },
          },
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
