import { Message } from "./protocol";

export class MessageBuffer {
  private buffer = "";

  receiveData(chunk: Buffer): Message | undefined {
    this.buffer += chunk;

    const headerMatch = this.buffer.match(
      /Content-Length: (?<len>\d+)\r\n\r\n/
    );
    const lenMatch = headerMatch?.groups?.len;

    if (headerMatch == null || lenMatch === undefined) {
      return;
    }

    // TODO take starting index
    const startingIndex = headerMatch.index!;
    const matchedHeader = headerMatch[0];

    const messageStart = startingIndex + matchedHeader.length;
    const msg = this.buffer.slice(messageStart);

    const messageLen = parseInt(lenMatch, 10);

    if (messageLen > msg.length) {
      return;
    }

    this.buffer = "";
    const parsedMsg = JSON.parse(msg);
    return parsedMsg;
  }
}
