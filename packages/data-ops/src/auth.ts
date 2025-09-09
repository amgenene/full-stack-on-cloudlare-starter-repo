import {betterAuth} from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import {getDb} from "@/db/database"
import {account, session, user, verification} from "@/drizzle-out/auth-schema";

let auth: ReturnType<typeof betterAuth>;

export function createBetterAuth(
    database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
    google?: {clientId: string; clientSecret: string}
): ReturnType<typeof betterAuth>{
    return betterAuth({
        database,
        emailAndPassword: {
            enabled: false
        },
        socialProviders: {
            google: {
                clientId: google?.clientId ?? "",
                clientSecret: google?.clientSecret ?? "",
                prompt: "select_account",
                accessType: "offline", 
            },
        },
        trustedOrigins: ['http://localhost:3000', 'https://data-service-stage.alazar-genene.workers.dev'],
        basePath: `https://data-service-stage.alazar-genene.workers.dev/api/auth`

    });
}

export function getAuth(google: {clientId: string; clientSecret: string}): ReturnType<typeof betterAuth> {
    if (auth) return auth;
    const db = getDb();
    auth = createBetterAuth(drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
            user,
            session,
            account,
            verification,

        },
    }),
    google,

);
return auth;
}