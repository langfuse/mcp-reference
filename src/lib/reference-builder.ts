import referenceConfig from "../../mcp-reference.config.json";

import { validateReferenceConfig } from "./config";
import { discoverMcpServer } from "./discovery-client";
import { generateMarkdown } from "./markdown";
import { buildSetupSnippets } from "./setup-snippets";
import type { GeneratedReference, GeneratedServer, ServerConfig } from "./types";

const V4_ONLY_TOOL_NAMES = new Set([
  "getMetricsSchema",
  "getMonitor",
  "getObservation",
  "getObservationFieldSchema",
  "getObservationFilterSchema",
  "getObservationFilterValues",
  "listExperimentItems",
  "listExperiments",
  "listMonitors",
  "listObservations",
  "queryMetrics",
]);

type Env = Record<string, string | undefined>;
type DiscoveryOptions = Parameters<typeof discoverMcpServer>[1];
type DiscoveryResult = Awaited<ReturnType<typeof discoverMcpServer>>;
type DiscoverMcpServer = (
  server: ServerConfig,
  options?: DiscoveryOptions,
) => Promise<DiscoveryResult>;

interface BuildReferenceOptions {
  config?: unknown;
  discover?: DiscoverMcpServer;
  env?: Env;
  now?: () => Date;
  onDiscoverStart?: (server: ServerConfig) => void;
  serverIds?: string[];
}

export interface ReferenceArtifacts {
  snapshot: GeneratedReference;
  markdown: string;
}

export async function buildReferenceArtifacts(
  options: BuildReferenceOptions = {},
): Promise<ReferenceArtifacts> {
  const snapshot = await buildReferenceSnapshot(options);
  return {
    snapshot,
    markdown: generateMarkdown(snapshot),
  };
}

export async function buildReferenceSnapshot(
  options: BuildReferenceOptions = {},
): Promise<GeneratedReference> {
  const env = options.env ?? process.env;
  const serverIds = options.serverIds ?? serverIdsFromEnv(env);
  const config = validateReferenceConfig(options.config ?? referenceConfig, env, { serverIds });
  const discover = options.discover ?? discoverMcpServer;

  const servers: GeneratedServer[] = [];
  for (const server of config.servers) {
    options.onDiscoverStart?.(server);
    const discovered = await discover(server, {
      headers: authHeaders(server, env),
    });

    servers.push({
      id: server.id,
      name: server.name,
      description: server.description,
      canonicalUrl: server.url,
      auth: server.auth,
      variants: server.variants,
      setupSnippets: buildSetupSnippets(server),
      ...discovered,
      tools: discovered.tools.map((tool) => ({
        ...tool,
        ...(server.id === "langfuse-cloud" && V4_ONLY_TOOL_NAMES.has(tool.name)
          ? { requiresV4: true }
          : {}),
      })),
    });
  }

  return {
    schemaVersion: "1.0",
    title: config.title,
    description: config.description,
    build: {
      generatedAt: (options.now ?? (() => new Date()))().toISOString(),
      generator: "src/lib/reference-builder.ts",
      sourceConfig: "mcp-reference.config.json",
      serverCount: servers.length,
      toolCount: servers.reduce((total, server) => total + server.tools.length, 0),
    },
    servers,
  };
}

export function authHeaders(server: ServerConfig, env: Env = process.env): Record<string, string> {
  if (server.auth.type === "none") {
    return {};
  }

  const publicKey = env[server.auth.publicKeyEnv];
  const secretKey = env[server.auth.secretKeyEnv];
  if (!publicKey || !secretKey) {
    throw new Error(`Missing credentials for ${server.id}`);
  }

  return {
    Authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`,
  };
}

function serverIdsFromEnv(env: Env): string[] | undefined {
  const raw = env.MCP_REFERENCE_SERVER_IDS;
  if (!raw) {
    return undefined;
  }

  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : undefined;
}
