/**
 * agent-tool-registry - Dynamic AI agent tool discovery and registration hub
 * Attribution: Retsumdk
 */

export interface ToolCapability {
  name: string;
  description: string;
  parameters: Record<string, any>;
  returns: Record<string, any>;
}

export interface ToolVersion {
  major: number;
  minor: number;
  patch: number;
  label?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  version: ToolVersion;
  description: string;
  author: string;
  capabilities: ToolCapability[];
  endpoint: string;
  authType: 'none' | 'apiKey' | 'oauth2' | 'bearer';
  status: 'active' | 'deprecated' | 'retired';
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscoveryQuery {
  capabilities?: string[];
  namePattern?: string;
  minVersion?: Partial<ToolVersion>;
  status?: ToolDefinition['status'];
}

export interface RegistryStats {
  totalTools: number;
  activeTools: number;
  uniqueCapabilities: number;
  versionCount: Record<string, number>;
}
