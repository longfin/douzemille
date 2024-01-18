#!/usr/bin/env -S deno run --allow-env --allow-net

import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { Application, Router, Status } from "https://deno.land/x/oak/mod.ts";

const VERSION = "0.0.1";

const mainCommand = new Command()
  .name("douzemille")
  .version(VERSION)
  .description("A tiny ActivityPub implementation for single user only.")
  .option("-d, --domain <domain:string>", "The unique domain in the network.", {
    required: true,
  })
  .option("-p, --port <port:number>", "The TCP port to listen.", {
    default: 8080,
  })
  .option("-u, --username <username:string>", "The name of user", {
    required: true,
  })
  .action(async ({ domain, port, username }) => {
    const router = new Router();
    router.get("/users/:username", (ctx) => {
      if (ctx.params.username !== username) {
        ctx.throw(Status.NotFound, "User not found");
      }

      const response = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": `https://${domain}/users/${username}`,
        "inbox": `https://${domain}/users/${username}/inbox`,
        "outbox": `https://${domain}/users/${username}/outbox`,
        "type": "Person",
        "name": username,
      };

      ctx.response.headers.set("Content-Type", "application/activity+json");
      ctx.response.body = response;
    });

    const app = new Application();
    app.use(router.routes());
    app.use(router.allowedMethods());

    await app.listen({ port });
  });

mainCommand.parse(Deno.args);
