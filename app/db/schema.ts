import { relations } from 'drizzle-orm';
import { type AnyPgColumn, index, pgTable, primaryKey } from 'drizzle-orm/pg-core';

export const user = pgTable('user', (d) => ({
  id: d
    .text()
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.text(),
  email: d.text().notNull().unique(),
  emailVerified: d.boolean().default(false),
  image: d.text(),
  createdAt: d.timestamp().defaultNow().notNull(),
  updatedAt: d.timestamp().$onUpdate(() => new Date()),
}));

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
}));

export const account = pgTable(
  'account',
  (d) => ({
    id: d
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .text()
      .notNull()
      .references(() => user.id),
    accountId: d.text().notNull(),
    providerId: d.text().notNull(),
    accessToken: d.text(),
    refreshToken: d.text(),
    accessTokenExpiresAt: d.timestamp(),
    refreshTokenExpiresAt: d.timestamp(),
    scope: d.text(),
    idToken: d.text(),
    password: d.text(),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().$onUpdate(() => new Date()),
  }),
  (t) => [index('account_user_id_idx').on(t.userId)],
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const session = pgTable(
  'session',
  (d) => ({
    id: d
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .text()
      .notNull()
      .references(() => user.id),
    token: d.text().notNull().unique(),
    expiresAt: d.timestamp().notNull(),
    ipAddress: d.text(),
    userAgent: d.text(),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().$onUpdate(() => new Date()),
  }),
  (t) => [index('session_user_id_idx').on(t.userId)],
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const verification = pgTable(
  'verification',
  (d) => ({
    id: d
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    identifier: d.text().notNull(),
    value: d.text().notNull(),
    expiresAt: d.timestamp().notNull(),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().$onUpdate(() => new Date()),
  }),
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

export const categories = pgTable(
  'category',
  (d) => ({
    id: d.serial().primaryKey(),
    name: d.text().notNull(),
    slug: d.text().notNull(),
    parentId: d
      .integer()
      .references((): AnyPgColumn => categories.id, { onDelete: 'set null' }),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().$onUpdate(() => new Date()),
  }),
  (t) => [index('category_parent_id_idx').on(t.parentId)],
);

export const models = pgTable(
  'model',
  (d) => ({
    id: d
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text().notNull(),
    description: d.text(),
    fileType: d.text().notNull(),
    fileSize: d.integer().notNull(),
    fileName: d.text().notNull(),
    fileUrl: d.varchar({ length: 2000 }),
    categoryId: d.integer().references(() => categories.id),
    createdAt: d.timestamp().defaultNow().notNull(),
    updatedAt: d.timestamp().$onUpdate(() => new Date()),
  }),
  (t) => [
    index('model_category_id_idx').on(t.categoryId),
    index('model_name_idx').on(t.name),
    index('model_file_type_idx').on(t.fileType),
  ],
);

export const modelTags = pgTable(
  'model_tag',
  (d) => ({
    modelId: d.text().notNull().references(() => models.id, { onDelete: 'cascade' }),
    tag: d.text().notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.modelId, t.tag] }),
    index('model_tag_tag_idx').on(t.tag),
  ],
);

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryParent',
  }),
  children: many(categories, { relationName: 'categoryParent' }),
  models: many(models),
}));

export const modelRelations = relations(models, ({ one, many }) => ({
  category: one(categories, { fields: [models.categoryId], references: [categories.id] }),
  modelTags: many(modelTags),
}));

export const modelTagRelations = relations(modelTags, ({ one }) => ({
  model: one(models, { fields: [modelTags.modelId], references: [models.id] }),
}));