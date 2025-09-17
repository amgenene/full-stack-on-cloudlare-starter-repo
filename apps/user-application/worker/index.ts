import {initDatabase} from "@repo/data-ops/database"
import { App } from "./hono/app";

export default {
  fetch(request, env, ctx) {
    initDatabase(env.DB);
    console.log("Database initialized env??", env.VITE_BASE_HOST);
    return App.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<ServiceBindings>;
