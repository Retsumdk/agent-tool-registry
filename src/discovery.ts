/**
 * agent-tool-registry - Advanced Discovery Logic
 * Attribution: Retsumdk
 */

import { ToolDefinition, ToolCapability } from "./types.js";

export class DiscoveryEngine {
  /**
   * Calculate compatibility score between a requested capability and a tool's capability
   */
  public static calculateScore(requested: string, available: ToolCapability): number {
    const nameMatch = available.name.toLowerCase().includes(requested.toLowerCase()) ? 0.5 : 0;
    const descMatch = available.description.toLowerCase().includes(requested.toLowerCase()) ? 0.3 : 0;
    
    // Fuzzy matching could be added here
    return nameMatch + descMatch;
  }

  /**
   * Find tools that best match a set of semantic requirements
   */
  public static semanticMatch(tools: ToolDefinition[], requirements: string): ToolDefinition[] {
    const keywords = requirements.toLowerCase().split(/\s+/);
    
    return tools
      .map(tool => {
        let score = 0;
        const searchSpace = `${tool.name} ${tool.description} ${tool.capabilities.map(c => `${c.name} ${c.description}`).join(' ')}`.toLowerCase();
        
        keywords.forEach(word => {
          if (searchSpace.includes(word)) score += 1;
        });
        
        return { tool, score };
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.tool);
  }

  /**
   * Validate if a tool meets a specific parameter schema requirement
   */
  public static validateSchemaCompatibility(tool: ToolDefinition, requiredParams: string[]): boolean {
    const allAvailableParams = tool.capabilities.flatMap(c => Object.keys(c.parameters));
    return requiredParams.every(p => allAvailableParams.includes(p));
  }
}
