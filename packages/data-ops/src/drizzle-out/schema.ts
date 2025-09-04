import { sqliteTable, AnySQLiteColumn, text, numeric, index, real, foreignKey, integer, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const links = sqliteTable("links", {
	linkId: text("link_id").primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	destinations: numeric().notNull(),
	created: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updated: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	name: text().notNull(),
});

export const linkClicks = sqliteTable("link_clicks", {
	id: text().notNull(),
	accountId: text("account_id").notNull(),
	country: text(),
	destination: text().notNull(),
	clickedTime: numeric("clicked_time").notNull(),
	latitude: real(),
	longitude: real(),
},
(table) => [
	index("idx_link_clicks_account_id").on(table.accountId),
]);

export const destinationEvaluations = sqliteTable("destination_evaluations", {
	id: text().primaryKey(),
	linkId: text("link_id").notNull(),
	accountId: text("account_id").notNull(),
	destinationUrl: text("destination_url").notNull(),
	status: text().notNull(),
	reason: text().notNull(),
	createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	index("idx_destination_evaluations_account_time").on(table.accountId, table.createdAt),
]);

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at"),
	refreshTokenExpiresAt: integer("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: integer("expires_at").notNull(),
	token: text().notNull(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	uniqueIndex("session_token_unique").on(table.token),
]);

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified").notNull(),
	image: text(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
},
(table) => [
	uniqueIndex("user_email_unique").on(table.email),
]);

export const verification = sqliteTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: integer("expires_at").notNull(),
	createdAt: integer("created_at"),
	updatedAt: integer("updated_at"),
});

