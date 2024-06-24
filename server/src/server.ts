import { write } from "./log";
import { MessageBuffer } from "./message-buffer";
import * as dec from "ts-decode";

const msgBuf = new MessageBuffer();

function initialize(): object {
  return {
    capabilities: {},
    serverInfo: {
      name: "lsp-from-scratch",
      version: "0.0.1",
    },
  };
}

const requestMsgParser = dec.object({
  method: dec.string.required,
  id: dec.number.optional,
});

type RespondMethod = (msg: unknown) => object;

const methods: Record<string, RespondMethod> = {
  initialize,
};

process.stdin.on("data", (chunk) => {
  const receivedMsg = msgBuf.receiveData(chunk);
  write({ receivedMsg });

  if (receivedMsg === undefined) {
    return;
  }

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

  process.stdout.write(`Content-Length: ${len}\r\n\r\n${outMsg}`);
});
