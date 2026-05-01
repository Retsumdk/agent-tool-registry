/**
 * agent-tool-registry - Registry Implementation
 * Attribution: Retsumdk
 */

import { 
  ToolDefinition, 
  ToolVersion, 
  DiscoveryQuery, 
  RegistryStats 
} from "./types.js";

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {}

  /**
   * Register a new tool or update an existing one
   */
  public register(tool: ToolDefinition): void {
    if (!tool.id) {
      tool.id = crypto.randomUUID();
    }
    
    // Version check for updates
    const existing = this.tools.get(tool.id);
    if (existing) {
      if (this.compareVersions(tool.version, existing.version) < 0) {
        throw new Error(`Cannot downgrade tool ${tool.name} from ${this.versionToString(existing.version)} to ${this.versionToString(tool.version)}`);
      }
    }

    tool.updatedAt = new Date();
    this.tools.set(tool.id, { ...tool });
  }

  /**
   * Find tools matching a discovery query
   */
  public discover(query: DiscoveryQuery): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(tool => {
      // Capability matching
      if (query.capabilities && query.capabilities.length > 0) {
        const toolCaps = tool.capabilities.map(c => c.name.toLowerCase());
        const hasAll = query.capabilities.every(cap => toolCaps.includes(cap.toLowerCase()));
        if (!hasAll) return false;
      }

      // Name pattern matching
      if (query.namePattern) {
        const regex = new RegExp(query.namePattern, 'i');
        if (!regex.test(tool.name)) return false;
      }

      // Status matching
      if (query.status && tool.status !== query.status) {
        return false;
      }

      // Version matching
      if (query.minVersion) {
        if (this.compareVersions(tool.version, query.minVersion as ToolVersion) < 0) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * De-register or retire a tool
   */
  public retire(id: string): boolean {
    const tool = this.tools.get(id);
    if (tool) {
      tool.status = 'retired';
      tool.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get registry statistics
   */
  public getStats(): RegistryStats {
    const tools = Array.from(this.tools.values());
    const stats: RegistryStats = {
      totalTools: tools.length,
      activeTools: tools.filter(t => t.status === 'active').length,
      uniqueCapabilities: new Set(tools.flatMap(t => t.capabilities.map(c => c.name))).size,
      versionCount: {}
    };

    tools.forEach(t => {
      const v = `${t.version.major}.x`;
      stats.versionCount[v] = (stats.versionCount[v] || 0) + 1;
    });

    return stats;
  }

  /**
   * Version comparison utility
   */
  private compareVersions(v1: ToolVersion, v2: ToolVersion): number {
    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== (v2.minor || 0)) return v1.minor - (v2.minor || 0);
    if (v1.patch !== (v2.patch || 0)) return v1.patch - (v2.patch || 0);
    return 0;
  }

  /**
   * Helper to format version as string
   */
  private versionToString(v: ToolVersion): string {
    return `${v.major}.${v.minor}.${v.patch}${v.label ? `-${v.label}` : ''}`;
  }

  /**
   * Export tools to JSON
   */
  public export(): string {
    return JSON.stringify(Array.from(this.tools.values()), null, 2);
  }

  /**
   * Import tools from JSON
   */
  public import(data: string): void {
    const imported = JSON.parse(data);
    if (Array.isArray(imported)) {
      imported.forEach(t => {
        // Hydrate dates
        t.createdAt = new Date(t.createdAt);
        t.updatedAt = new Date(t.updatedAt);
        this.register(t);
      });
    }
  }
}
