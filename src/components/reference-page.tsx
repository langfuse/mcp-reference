import {
  Braces,
  ChevronRight,
  Code2,
  FileJson,
  TerminalSquare,
  BookAlert,
} from "lucide-react";

import { AnchorScroll } from "@/components/anchor-scroll";
import { MarkdownActions } from "@/components/markdown-actions";
import { SetupTabs } from "@/components/setup-tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GeneratedReference, GeneratedServer, ToolReference } from "@/lib/types";

const API_STABILITY_CALLOUT_SERVER_ID = "langfuse";

interface ReferencePageProps {
  snapshot: GeneratedReference;
  markdown: string;
}

export function ReferencePage({ snapshot, markdown }: ReferencePageProps) {
  return (
    <div className="grid h-screen grid-rows-[58px_minmax(0,1fr)] overflow-hidden bg-[#f7f7f4] text-[#1b1917] dark:bg-[#080808] dark:text-zinc-50">
      <AnchorScroll />
      <header className="relative z-40 border-b border-zinc-200 bg-[#f7f7f4]/95 backdrop-blur dark:border-zinc-800 dark:bg-[#080808]/95">
        <div className="flex h-[58px] items-center justify-between px-4 lg:px-5">
          <a className="flex items-center gap-3" href="#top">
            <span className="flex items-center">
              <img
                alt="Langfuse Logo"
                className="block h-5 w-auto dark:hidden"
                src="/assets/langfuse-wordart.svg"
              />
              <img
                alt="Langfuse Logo"
                className="hidden h-5 w-auto dark:block"
                src="/assets/langfuse-wordart-white.svg"
              />
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">MCP Server Reference</span>
          </a>
          <div className="flex items-center gap-2">
            <a
              className="hidden h-8 items-center gap-2 rounded-sm border border-zinc-300 bg-[#fbfbf8] px-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 md:inline-flex"
              href="/generated/mcp-reference.json"
            >
              <FileJson className="size-4" />
              JSON
            </a>
            <a
              className="hidden h-8 items-center gap-2 rounded-sm border border-zinc-300 bg-[#fbfbf8] px-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 md:inline-flex"
              href="/generated/mcp-reference.md"
            >
              <Braces className="size-4" />
              Markdown
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        className="relative z-10 grid min-h-0 grid-cols-1 overflow-hidden md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[274px_minmax(0,1fr)]"
        id="top"
      >
        <aside className="hidden min-h-0 overflow-y-auto border-r border-zinc-200 bg-[#eeeeea]/70 dark:border-zinc-800 dark:bg-zinc-950/60 md:block">
          <Sidebar servers={snapshot.servers} />
        </aside>

        <article
          className="min-h-0 min-w-0 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 xl:px-10"
          data-scroll-container
        >
          <div className="mx-auto min-w-0 max-w-[940px]">
            <div className="mb-6 flex justify-end">
              <MarkdownActions markdown={markdown} />
            </div>

            <section className="mb-8 border-b border-zinc-200 pb-8 dark:border-zinc-800">
              <h1 className="text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
                {snapshot.title}
              </h1>
            </section>

            <section className="mb-10">
              <h2 className="sr-only">Available MCP servers</h2>
              <div className="grid border border-zinc-200 bg-[#fbfbf8] dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
                {snapshot.servers.map((server) => (
                  <a
                    className="min-w-0 border-b border-zinc-200 p-4 hover:bg-zinc-100/60 dark:border-zinc-800 dark:hover:bg-zinc-900/60 md:border-b-0 md:border-r md:last:border-r-0"
                    href={`#${server.id}`}
                    key={server.id}
                  >
                    <h3 className="text-lg font-semibold">{server.name}</h3>
                    {server.description ? (
                      <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                        {server.description}
                      </p>
                    ) : null}
                    <p className="mt-3 truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {server.canonicalUrl}
                    </p>
                  </a>
                ))}
              </div>
            </section>

            <details className="mb-8 border border-zinc-200 bg-[#fbfbf8] p-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
              <summary className="cursor-pointer text-sm font-semibold">Server navigation</summary>
              <div className="mt-4 grid gap-5 text-sm">
                {snapshot.servers.map((server) => (
                  <div key={server.id}>
                    <a className="font-semibold" href={`#${server.id}`}>
                      {server.name}
                    </a>
                    <div className="mt-2 grid gap-1 pl-3">
                      {server.tools.map((tool) => (
                        <a
                          className="text-zinc-600 dark:text-zinc-400"
                          href={`#${server.id}-${tool.name}`}
                          key={tool.name}
                        >
                          {tool.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>

            <div className="space-y-12" id="servers">
              {snapshot.servers.map((server, index) => (
                <ServerSection key={server.id} server={server} showSetupAnchor={index === 0} />
              ))}
            </div>
          </div>
        </article>

      </main>
    </div>
  );
}

function Sidebar({ servers }: { servers: GeneratedServer[] }) {
  return (
    <nav className="text-sm">
      <div className="border-b border-zinc-200 p-3 dark:border-zinc-800">
        <p className="mb-2 px-2 font-semibold">Servers</p>
        <div className="space-y-2">
          {servers.map((server) => (
            <div key={server.id}>
              <a className="block px-2 py-1.5 font-medium hover:text-zinc-950 dark:hover:text-zinc-50" href={`#${server.id}`}>
                {server.name}
              </a>
              <div className="space-y-1 pl-4">
                {server.tools.map((tool) => (
                  <a
                    className="block truncate px-2 py-1 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                    href={`#${server.id}-${tool.name}`}
                    key={tool.name}
                  >
                    {tool.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

function ServerSection({
  server,
  showSetupAnchor,
}: {
  server: GeneratedServer;
  showSetupAnchor: boolean;
}) {
  return (
    <section className="scroll-mt-28" id={server.id}>
      <div className="mb-4">
        <h2 className="text-3xl font-semibold tracking-normal">{server.name}</h2>
        {server.description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {server.description}
          </p>
        ) : null}
        <code className="mt-4 block w-full min-w-0 max-w-full overflow-x-auto whitespace-nowrap border border-zinc-200 bg-[#fbfbf8] px-3 py-2 font-mono text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {server.canonicalUrl}
        </code>
      </div>

      {server.id === API_STABILITY_CALLOUT_SERVER_ID ? (
        <div className="my-4" id={`${server.id}-api-stability`}>
          <ApiStabilityCallout />
        </div>
      ) : null}

      {server.variants.length > 0 ? (
        <div className="mb-8 grid border border-zinc-200 bg-[#fbfbf8] dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          {server.variants.map((variant) => (
            <div className="min-w-0 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:border-r sm:[&:nth-child(even)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0" key={variant.label}>
              <p className="text-sm font-semibold">{variant.label}</p>
              <p className="mt-2 break-all font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {variant.url}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-8" id={showSetupAnchor ? "setup" : undefined}>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <TerminalSquare className="size-4" />
          Client setup
        </h3>
        <SetupTabs snippets={server.setupSnippets} />
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Code2 className="size-4" />
          Tools
        </h3>
        <div className="space-y-5">
          {server.tools.map((tool) => (
            <ToolCard key={tool.name} serverId={server.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ApiStabilityCallout() {
  return (
    <div className="border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm leading-6 text-yellow-950 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-50 w-full">
      <p className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <BookAlert className="size-4" />
        API stability
      </p>
      <p className="mt-2">
        This MCP server is self-describing. Clients should dynamically inspect available tools and
        schemas rather than assuming a static interface.
      </p>
      <p className="mt-2">
        Tool availability and schemas may evolve over time, including the addition, removal, or
        modification of tools and fields. Clients are expected to tolerate schema changes and refresh
        capabilities dynamically.
      </p>
    </div>
  );
}

function ToolCard({ serverId, tool }: { serverId: string; tool: ToolReference }) {
  return (
    <Card className="scroll-mt-28 overflow-hidden" id={`${serverId}-${tool.name}`}>
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-mono text-base font-semibold">{tool.name}</h4>
          {tool.requiresV4 ? (
            <a href="https://langfuse.com/docs/v4">
              <Badge className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900">
                Requires v4
              </Badge>
            </a>
          ) : null}
        </div>
        {tool.description ? (
          <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{tool.description}</p>
        ) : null}
      </div>
      <details className="group border-t border-zinc-200 dark:border-zinc-800">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:bg-zinc-900/70 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-2">
            <ChevronRight className="size-4 shrink-0 transition-transform group-open:rotate-90" />
            <span>Input schema and generated request</span>
          </span>
          <span className="shrink-0 text-xs text-zinc-500 group-open:hidden">Expand</span>
          <span className="hidden shrink-0 text-xs text-zinc-500 group-open:inline">Collapse</span>
        </summary>
        <div className="grid bg-zinc-200 dark:bg-zinc-800 xl:grid-cols-2 xl:gap-px">
          <CodePanel label="Input schema" value={JSON.stringify(tool.inputSchema, null, 2)} />
          <CodePanel label="Generated request" value={JSON.stringify(tool.exampleRequest, null, 2)} />
        </div>
      </details>
    </Card>
  );
}

function CodePanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-[#fbfbf8] dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-2 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800">
        {label}
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-5 text-zinc-800 dark:text-zinc-200">
        <code>{value}</code>
      </pre>
    </div>
  );
}
