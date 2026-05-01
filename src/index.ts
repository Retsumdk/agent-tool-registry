#!/usr/bin/env bun
/**
 * agent-tool-registry - Dynamic AI agent tool discovery and registration hub
 * Attribution: Retsumdk
 */

import { Command } from "commander";
import { ToolRegistry } from "./registry.js";
import { DiscoveryEngine } from "./discovery.js";
import { ToolDefinition } from "./types.js";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const registry = new ToolRegistry();
const DB_PATH = join(process.cwd(), "registry.json");

/**
 * Load initial data if it exists
 */
function loadData() {
  if (existsSync(DB_PATH)) {
    try {
      const data = readFileSync(DB_PATH, "utf-8");
      registry.import(data);
      console.log(`[Registry] Loaded tools from ${DB_PATH}`);
    } catch (e) {
      console.error(`[Registry] Error loading data: ${e}`);
    }
  } else {
    console.log(`[Registry] Initializing empty registry.`);
    seedSampleData();
  }
}

/**
 * Save data to disk
 */
function saveData() {
  try {
    writeFileSync(DB_PATH, registry.export(), "utf-8");
    console.log(`[Registry] Data saved to ${DB_PATH}`);
  } catch (e) {
    console.error(`[Registry] Error saving data: ${e}`);
  }
}

/**
 * Seed the registry with high-quality sample tools
 */
function seedSampleData() {
  const sampleTools: ToolDefinition[] = [
    {
      id: crypto.randomUUID(),
      name: "Search-Master-3000",
      version: { major: 1, minor: 2, patch: 0 },
      description: "Advanced web search tool with semantic retrieval and filtering",
      author: "Retsumdk",
      capabilities: [
        {
          name: "web_search",
          description: "Search the public internet",
          parameters: { query: "string", limit: "number" },
          returns: { results: "array" }
        }
      ],
      endpoint: "https://api.retsumdk.ai/search",
      authType: "apiKey",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: crypto.randomUUID(),
      name: "Code-Architect",
      version: { major: 2, minor: 0, patch: 5 },
      description: "Automated code generation and refactoring agent tool",
      author: "Retsumdk",
      capabilities: [
        {
          name: "generate_code",
          description: "Generate substantive code based on prompt",
          parameters: { prompt: "string", language: "string" },
          returns: { code: "string" }
        },
        {
          name: "refactor",
          description: "Refactor existing code for efficiency",
          parameters: { code: "string" },
          returns: { refactored: "string" }
        }
      ],
      endpoint: "https://api.retsumdk.ai/code",
      authType: "oauth2",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  sampleTools.forEach(t => registry.register(t));
  saveData();
}

const program = new Command();
program
  .name("agent-tool-registry")
  .description("Dynamic AI agent tool discovery and registration hub")
  .version("1.0.0");

program
  .command("list")
  .description("List all registered tools")
  .option("-j, --json", "Output in JSON format")
  .action((opts) => {
    loadData();
    const stats = registry.getStats();
    
    if (opts.json) {
      console.log(registry.export());
      return;
    }

    console.log("\n=== Registered Agent Tools ===");
    console.log(`Total: ${stats.totalTools} | Active: ${stats.activeTools}`);
    console.log("------------------------------");
    
    registry.discover({}).forEach(t => {
      console.log(`[${t.status.toUpperCase()}] ${t.name} v${t.version.major}.${t.version.minor}.${t.version.patch}`);
      console.log(`  ID: ${t.id}`);
      console.log(`  Caps: ${t.capabilities.map(c => c.name).join(", ")}`);
      console.log("");
    });
  });

program
  .command("find")
  .description("Find tools by capability or keyword")
  .argument("<query>", "Capability or semantic requirement")
  .option("-s, --semantic", "Use semantic matching engine")
  .action((query, opts) => {
    loadData();
    let results: ToolDefinition[];

    if (opts.semantic) {
      results = DiscoveryEngine.semanticMatch(registry.discover({}), query);
    } else {
      results = registry.discover({ capabilities: [query] });
    }

    console.log(`\nFound ${results.length} matching tools for '${query}':`);
    results.forEach(t => {
      console.log(`- ${t.name} (Score matching logic applied)`);
    });
  });

program
  .command("register")
  .description("Register a new tool (interactive simulation)")
  .option("-n, --name <name>", "Tool name")
  .option("-d, --desc <description>", "Description")
  .action((opts) => {
    if (!opts.name || !opts.desc) {
      console.log("Error: Name and Description are required for registration.");
      return;
    }
    loadData();
    const newTool: ToolDefinition = {
      id: crypto.randomUUID(),
      name: opts.name,
      version: { major: 1, minor: 0, patch: 0 },
      description: opts.desc,
      author: "Retsumdk",
      capabilities: [],
      endpoint: "https://localhost/dev",
      authType: "none",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    registry.register(newTool);
    saveData();
    console.log(`Successfully registered ${opts.name}`);
  });

program
  .command("stats")
  .description("Show registry statistics")
  .action(() => {
    loadData();
    const stats = registry.getStats();
    console.log("\n=== Registry Statistics ===");
    console.log(`Total Tools: ${stats.totalTools}`);
    console.log(`Active Tools: ${stats.activeTools}`);
    console.log(`Unique Capabilities: ${stats.uniqueCapabilities}`);
    console.log("Version Distribution:");
    Object.entries(stats.versionCount).forEach(([v, count]) => {
      console.log(`  ${v}: ${count}`);
    });
  });

program.parse(process.argv);

// If no arguments provided, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
