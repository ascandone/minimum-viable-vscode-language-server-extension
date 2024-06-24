import { RequestMessage } from "../protocol";

export type ServerCapabilities = Record<string, string>;

export type InitializeResult = {
  capabilities: ServerCapabilities;

  serverInfo?: {
    name: string;
    version?: string;
  };
};

export function initialize(message: RequestMessage): InitializeResult {
  return {
    capabilities: {},
    serverInfo: {
      name: "lsp-from-scratch",
      version: "0.0.1",
    },
  };
}
