export type Message = {
  jsonrpc: string;
};

export type RequestMessage = Message & {
  id: number | string;
  method: unknown[] | object;
};
