import { expect, test } from "vitest";
import { MessageBuffer } from "../src/message-buffer";
import { Message } from "../src/protocol";

import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

test("parse entire message", () => {
  const sentMsg = {
    x: 42,
    jsonrpc: "2.0",
  };

  const msgBuf = new MessageBuffer();
  const out = msgBuf.receiveData(makeMessage(sentMsg));
  expect(out).toEqual(sentMsg);
});

test("parse two messages in a row", () => {
  const msgBuf = new MessageBuffer();
  const msg1 = { x: 0, jsonrpc: "2.0" };
  const msg2 = { x: 1, jsonrpc: "2.0" };

  msgBuf.receiveData(makeMessage(msg1));
  const out2 = msgBuf.receiveData(makeMessage(msg2));
  expect(out2).toEqual(msg2);
});

test("parse a message split in two chunks", () => {
  const msgBuf = new MessageBuffer();

  const msgBug = makeMessage({ x: 0, jsonrpc: "2.0" });

  const splitIndex = Buffer.from("Content-Length: 100\r\n\r\n").length;

  const m1 = msgBug.subarray(0, splitIndex);
  expect(msgBuf.receiveData(m1)).toEqual(undefined);

  const m2 = msgBug.subarray(splitIndex + 1);
  expect(msgBuf.receiveData(m2)).toEqual(undefined);
});

function makeMessage<T extends Message>(message: T): Buffer {
  const serializedMessage = JSON.stringify(message);

  const len = Buffer.byteLength(serializedMessage, "utf-8");

  return Buffer.from(`Content-Length: ${len}\r\n\r\n${serializedMessage}`);
}
