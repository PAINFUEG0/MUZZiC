import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";

import type { MessagePayload } from "../../shared/types/utils";

const app = express();
const server = createServer(app);

app.get("/", (_, res) => res.sendStatus(200));

const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => ws.on("message", (message) => console.log("Received message:", message)));

export const api = {
  get port() {
    return (server.address() as any)?.port;
  },
  broadcast(message: MessagePayload) {
    wss.clients.forEach((client) => client.send(JSON.stringify(message)));
  },
  startServer() {
    return new Promise((resolve) => server.listen(0, () => resolve(null)));
  },
};
