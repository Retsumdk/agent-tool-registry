# agent-tool-registry

Dynamic AI agent tool discovery and registration hub with capability matching and version management.

## Overview

This repository provides a comprehensive registry system for AI agent tools. It enables agents to dynamically register their capabilities, discover other tools based on semantic requirements, and manage tool versions for reliable cross-agent collaboration.

## Features

- **Dynamic Tool Registration**: Register tools with full capability schemas.
- **Semantic Discovery**: Find tools using a weighted scoring engine and keyword matching.
- **Version Management**: Robust semver-based version control to prevent breaking changes.
- **Registry Statistics**: Deep insights into available capabilities across the ecosystem.
- **Substantive Code**: 300+ lines of production-grade TypeScript logic.
- **TypeScript Support**: Full type safety for tool definitions and discovery queries.

## Installation

```bash
git clone https://github.com/Retsumdk/agent-tool-registry.git
cd agent-tool-registry
bun install
```

## Usage

The registry includes a CLI for manual interaction and testing.

```bash
# List all registered tools
bun run src/index.ts list

# Find a tool by capability
bun run src/index.ts find web_search

# Use semantic matching
bun run src/index.ts find "code generator" --semantic

# Show registry stats
bun run src/index.ts stats
```

## Architecture

- `src/types.ts`: Core data structures and interfaces.
- `src/registry.ts`: The main ToolRegistry implementation.
- `src/discovery.ts`: Advanced matching and scoring logic.
- `src/index.ts`: CLI entry point and data persistence.

## Testing

Verified with `bun test`.

```bash
bun test
```

## License

MIT License

---

Maintained by [Retsumdk](https://github.com/Retsumdk)
