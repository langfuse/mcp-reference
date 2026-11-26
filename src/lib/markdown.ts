import type { GeneratedReference, GeneratedServer, SetupSnippet, ToolReference } from "./types";

const API_STABILITY_CALLOUT_SERVER_ID = "langfuse-cloud";
const API_STABILITY_CALLOUT = [
  "> ⚠️ **API stability**:",
  "> This MCP server is self-describing. Clients should dynamically inspect available tools and schemas rather than assuming a static interface.",
  "> Tool availability and schemas may evolve over time, including the addition, removal, or modification of tools and fields. Clients are expected to tolerate schema changes and refresh capabilities dynamically.",
];

export function generateMarkdown(reference: GeneratedReference): string {
  const lines: string[] = [
    `# ${reference.title}`,
    "",
    `Generated at ${reference.build.generatedAt}.`,
    "",
    reference.description,
    "",
    "This is an hourly regenerated snapshot. It documents configured MCP servers, connection variants, setup snippets, and discovered tools while serving cached output between regenerations.",
    "",
    "## Servers",
    "",
  ];

  for (const server of reference.servers) {
    lines.push(...serverSection(server));
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

function serverSection(server: GeneratedServer): string[] {
  const auth =
    server.auth.type === "none"
      ? "None"
      : `Basic Auth using ${server.auth.publicKeyEnv} and ${server.auth.secretKeyEnv}`;
  const lines = [
    `### ${server.name}`,
    "",
  ];

  if (server.id === API_STABILITY_CALLOUT_SERVER_ID) {
    lines.push(...API_STABILITY_CALLOUT, "");
  }

  lines.push(
    server.description ?? "",
    "",
    `- Server ID: \`${server.id}\``,
    `- Canonical endpoint: \`${server.canonicalUrl}\``,
    `- Authentication: ${auth}`,
    `- Discovered tools: ${server.tools.length}`,
    "",
  );

  if (server.variants.length > 0) {
    lines.push("#### Connection Variants", "", "| Variant | URL |", "| --- | --- |");
    for (const variant of server.variants) {
      lines.push(`| ${escapeTable(variant.label)} | \`${variant.url}\` |`);
    }
    lines.push("");
  }

  lines.push("#### Client Setup", "");
  for (const snippet of server.setupSnippets) {
    lines.push(...snippetSection(snippet));
  }

  lines.push("#### Tools", "");
  if (server.tools.length === 0) {
    lines.push("No tools were advertised by this server during discovery.", "");
  } else {
    for (const tool of server.tools) {
      lines.push(...toolSection(tool));
    }
  }

  if (server.resources.length > 0) {
    lines.push("#### Resources", "");
    for (const resource of server.resources) {
      lines.push(`- \`${resource.uri}\`${resource.name ? ` - ${resource.name}` : ""}`);
    }
    lines.push("");
  }

  if (server.prompts.length > 0) {
    lines.push("#### Prompts", "");
    for (const prompt of server.prompts) {
      lines.push(`- \`${prompt.name}\`${prompt.description ? ` - ${prompt.description}` : ""}`);
    }
    lines.push("");
  }

  return lines;
}

function snippetSection(snippet: SetupSnippet): string[] {
  return [
    `##### ${snippet.client}: ${snippet.title}`,
    "",
    `\`\`\`${snippet.language}`,
    snippet.code,
    "```",
    "",
  ];
}

function toolSection(tool: ToolReference): string[] {
  return [
    `##### \`${tool.name}\``,
    "",
    ...(tool.requiresV4 ? ["[Requires v4](https://langfuse.com/docs/v4)", ""] : []),
    tool.description ?? "No description advertised.",
    "",
    "Input schema:",
    "",
    "```json",
    JSON.stringify(tool.inputSchema, null, 2),
    "```",
    "",
    "Generated example request:",
    "",
    "```json",
    JSON.stringify(tool.exampleRequest, null, 2),
    "```",
    "",
  ];
}

function escapeTable(value: string): string {
  return value.replaceAll("|", "\\|");
}
