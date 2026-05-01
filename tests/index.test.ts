import { expect, test, describe, beforeEach } from "bun:test";
import { ToolRegistry } from "../src/registry.js";
import { DiscoveryEngine } from "../src/discovery.js";
import { ToolDefinition } from "../src/types.js";

describe("ToolRegistry", () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  test("should register a new tool", () => {
    const tool: ToolDefinition = {
      id: "test-id",
      name: "Test Tool",
      version: { major: 1, minor: 0, patch: 0 },
      description: "A test tool",
      author: "Retsumdk",
      capabilities: [],
      endpoint: "http://test",
      authType: "none",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    registry.register(tool);
    const results = registry.discover({ namePattern: "Test" });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Test Tool");
  });

  test("should find tools by capability", () => {
    const tool: ToolDefinition = {
      id: "search-id",
      name: "Searcher",
      version: { major: 1, minor: 0, patch: 0 },
      description: "Search",
      author: "Retsumdk",
      capabilities: [{ name: "web_search", description: "desc", parameters: {}, returns: {} }],
      endpoint: "http://test",
      authType: "none",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    registry.register(tool);
    const results = registry.discover({ capabilities: ["web_search"] });
    expect(results.length).toBe(1);
  });

  test("should prevent downgrading versions", () => {
    const toolv1: ToolDefinition = {
      id: "locked-id",
      name: "Locked",
      version: { major: 2, minor: 0, patch: 0 },
      description: "desc",
      author: "Retsumdk",
      capabilities: [],
      endpoint: "http://test",
      authType: "none",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const toolv0: ToolDefinition = {
      id: "locked-id",
      name: "Locked",
      version: { major: 1, minor: 0, patch: 0 },
      description: "desc",
      author: "Retsumdk",
      capabilities: [],
      endpoint: "http://test",
      authType: "none",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    registry.register(toolv1);
    expect(() => registry.register(toolv0)).toThrow();
  });
});

describe("DiscoveryEngine", () => {
  test("should calculate matching scores", () => {
    const cap = { name: "image_gen", description: "Generates high quality images", parameters: {}, returns: {} };
    const score = DiscoveryEngine.calculateScore("image", cap);
    expect(score).toBeGreaterThan(0);
  });

  test("should perform semantic matching", () => {
    const tools: ToolDefinition[] = [
      {
        id: "1",
        name: "Weather Bot",
        version: { major: 1, minor: 0, patch: 0 },
        description: "Check temperature and rain",
        author: "Retsumdk",
        capabilities: [],
        endpoint: "http://test",
        authType: "none",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const results = DiscoveryEngine.semanticMatch(tools, "rain bot");
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Weather Bot");
  });
});
