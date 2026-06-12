import fs from "node:fs";
import express from "express";
import { resolve } from "node:path";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import { MessagePayload } from "../shared/types/utils";

const app = express();
const server = createServer(app);
if (!fs.existsSync("./.thumbnails")) fs.mkdirSync("./.thumbnails");

app.get("/", (_, res) => res.sendStatus(200));

app.get("/thumb/:id", (req, res) => {
  const { id } = req.params;
  const thumbPath = resolve(".", ".thumbnails", `${id}.jpg`);
  const defaultThumbnailPath = resolve(".", "public", "logo.png");
  res.sendFile(fs.existsSync(thumbPath) ? thumbPath : defaultThumbnailPath, { dotfiles: "allow" });
});

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
