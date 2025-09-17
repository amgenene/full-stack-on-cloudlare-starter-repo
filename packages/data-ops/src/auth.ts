import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/database";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { account, session, subscription, user, verification } from "@/drizzle-out/auth-schema";


let auth: ReturnType<typeof betterAuth>;

type StripeConfig = {
  stripeWebhookSecret: string;
  plans: any[];
  stripeApiKey?: string
};



export function createBetterAuth(
    database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
    stripeConfig?: StripeConfig,
    google?: { clientId: string; clientSecret: string },
  ): ReturnType<typeof betterAuth> {
    return betterAuth({
      database,
      emailAndPassword: {
        enabled: false,
      },
      socialProviders: {
        google: {
          clientId: google?.clientId ?? "",
          clientSecret: google?.clientSecret ?? "",
        },
      },
      plugins: [
        stripe({
          stripeClient: new Stripe(
            stripeConfig?.stripeApiKey || process.env.STRIPE_KEY!,
            {
              apiVersion: "2025-08-27.basil",
            },
          ),
          stripeWebhookSecret:
          stripeConfig?.stripeWebhookSecret ??
          process.env.STRIPE_WEBHOOK_SECRET!,
          createCustomerOnSignUp: true,
          subscription: {
            enabled: true,
            plans: stripeConfig?.plans ?? [],
          },
        })
      ]
    });
  }


export function getAuth(
  google: { clientId: string; clientSecret: string },
  stripe: StripeConfig,
  db: ReturnType<typeof getDb>,

): ReturnType<typeof betterAuth> {
    if (auth) return auth;
  
    auth = createBetterAuth(
      drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
          user,
          session,
          account,
          verification,
          subscription

        }
      }),
      stripe,
      google,
    );
    return auth;
}
