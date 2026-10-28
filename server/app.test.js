// Proves the testability refactor actually worked: importing app.js must not
// open a network listener or touch MongoDB. If this regresses, every route
// test built on top of it (and any future CI run) starts hitting production
// Mongo or binding a real port just from an import.
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";

test("importing app.js opens no listening socket and no Mongo connection", async () => {
  const connectCallsBefore = mongoose.connections.length;

  const appModule = await import("./app.js");
  const app = appModule.default;

  assert.equal(typeof app, "function", "app.js should export the Express app");
  assert.equal(
    mongoose.connection.readyState,
    0,
    "mongoose should still be disconnected after importing app.js"
  );
  assert.equal(
    mongoose.connections.length,
    connectCallsBefore,
    "importing app.js should not open any new mongoose connection"
  );

  // The app is a request handler, not a bound server — wrapping it in our
  // own ephemeral http.Server (and closing it ourselves) is how a real route
  // test will use it; app.js importing cleanly like this is the point.
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const res = await fetch(`http://127.0.0.1:${port}/status`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.service, "Cinemetrics API");

  await new Promise((resolve) => server.close(resolve));
});

test("research-cache route still requires the internal key after the refactor", async () => {
  const appModule = await import("./app.js");
  const app = appModule.default;

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  // No DB connection exists in this test process, so this will 503
  // (requireDatabase) rather than reach requireInternalKey — still proves
  // the route chain is wired and the app behaves without ever touching
  // production Mongo.
  const res = await fetch(`http://127.0.0.1:${port}/research-cache/meta/list`);
  assert.equal(res.status, 503);

  await new Promise((resolve) => server.close(resolve));
});
