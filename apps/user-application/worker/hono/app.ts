import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/worker/trpc/router";
import { createContext } from "@/worker/trpc/context";
import { getAuth } from "@repo/data-ops/auth";
import { createMiddleware } from "hono/factory";
import { getDb } from "@repo/data-ops/database";
export const App = new Hono<{
  Bindings: ServiceBindings;
  Variables: { userId: string };
}>();

const authMiddleware = createMiddleware(async (c, next) => {
  const auth = getAuthInstance(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const userId = session.user.id;
  c.set("userId", userId);
  await next();
});
App.all("/trpc/*", authMiddleware, async (c) => {
  const userId = c.get("userId");
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () =>
      createContext({
        req: c.req.raw,
        env: c.env,
        workerCtx: c.executionCtx,
        userId,
      }),
  });
});
const getAuthInstance = (env: Env) => {
  const db = getDb();
  console.log(db);
  const auth = getAuth(
    {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    {
      stripeApiKey: env.STRIPE_API_KEY,
      stripeWebhookSecret: "",
      plans: [
        { 
            name: "basic", priceId: env.STRIPE_PRODUCT_BASIC 
        },
        { 
            name: "pro", priceId: env.STRIPE_PRODUCT_PRO 
        },
        { 
            name: "enterprise", priceId: env.STRIPE_PRODUCT_ENTERPRISE 
        },
      ],
    },
    db
  );
  return auth;
};
App.get("/click-socket", async (c) => {
  const headers = new Headers(c.req.raw.headers);
  const userId = c.get("userId");
  headers.set("account-id", userId);
  const proxiedRequest = new Request(c.req.raw, { headers });
  return c.env.BACKEND_SERVICE.fetch(proxiedRequest);
});

App.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = getAuthInstance(c.env);
  return auth.handler(c.req.raw);
});
