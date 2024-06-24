import { write } from "./log";
import { MessageBuffer } from "./message-buffer";
import * as dec from "ts-decode";

const msgBuf = new MessageBuffer();

const initialize: RespondMethod = () => ({
  capabilities: {
    completionProvider: {},
  },
  serverInfo: {
    name: "lsp-from-scratch",
    version: "0.0.1",
  },
});

const completion: RespondMethod = () => ({
  isIncomplete: false,
  items: [{ label: "l1" }, { label: "l2" }, { label: "l3" }],
});

const requestMsgParser = dec.object({
  method: dec.string.required,
  id: dec.number.optional,
});

type RespondMethod = (msg: unknown) => object;

const methods: Record<string, RespondMethod> = {
  initialize,
  "textDocument/completion": completion,
};

process.stdin.on("data", (chunk) => {
  const receivedMsg = msgBuf.receiveData(chunk);
  if (receivedMsg === undefined) {
    return;
  }

  write("received", receivedMsg);

  const result = requestMsgParser.decode(receivedMsg);
  if (result.error) {
    return;
  }

  const parsedRequestMsg = result.value;

  const method = methods[parsedRequestMsg.method];
  if (method === undefined || parsedRequestMsg.id === undefined) {
    // TODO handle err
    return;
  }

  const outMsg = JSON.stringify({
    id: parsedRequestMsg.id,
    result: method(parsedRequestMsg),
  });

  const len = Buffer.byteLength(outMsg, "utf-8");

  write("sent", outMsg);
  process.stdout.write(`Content-Length: ${len}\r\n\r\n${outMsg}`);
});
