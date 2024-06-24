import { write } from "./log";
import { MessageBuffer } from "./message-buffer";
import { Message } from "./protocol";

const msgBuf = new MessageBuffer();

process.stdin.on("data", (chunk) => {
  write(chunk.toString());
  const out = msgBuf.receiveData(chunk);
});
