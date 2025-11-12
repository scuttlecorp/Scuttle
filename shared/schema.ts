import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Token schema for confidential ERC-20 tokens
export const tokens = pgTable("tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  totalSupply: text("total_supply").notNull(), // Stored as string to handle large numbers
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  contractAddress: text("contract_address"),
  deploymentTxHash: text("deployment_tx_hash"),
  creatorAddress: text("creator_address").notNull(),
  network: text("network").notNull().default("sepolia"),
  status: text("status").notNull().default("draft"), // draft, deploying, deployed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Presale schema for token presales
export const presales = pgTable("presales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenId: varchar("token_id").notNull(),
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  pricePerToken: text("price_per_token").notNull(), // In ETH, stored as string
  hardCap: text("hard_cap").notNull(), // Maximum tokens to sell
  softCap: text("soft_cap"), // Minimum tokens to sell
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  contractAddress: text("contract_address"),
  ownerAddress: text("owner_address").notNull(),
  totalRaised: text("total_raised").notNull().default("0"),
  participantCount: integer("participant_count").notNull().default(0),
  status: text("status").notNull().default("upcoming"), // upcoming, active, ended, finalized, cancelled
  isEncrypted: boolean("is_encrypted").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Participant schema for presale contributions
export const participants = pgTable("participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  presaleId: varchar("presale_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  contributionAmount: text("contribution_amount").notNull(), // In ETH
  tokenAmount: text("token_amount").notNull(), // Tokens allocated
  transactionHash: text("transaction_hash"),
  contributedAt: timestamp("contributed_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
}).extend({
  totalSupply: z.string().regex(/^\d+$/, "Total supply must be a positive number"),
  creatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").optional(),
});

export const insertPresaleSchema = createInsertSchema(presales).omit({
  id: true,
  createdAt: true,
  totalRaised: true,
  participantCount: true,
}).extend({
  pricePerToken: z.string().regex(/^\d+\.?\d*$/, "Price must be a valid number"),
  hardCap: z.string().regex(/^\d+$/, "Hard cap must be a positive number"),
  softCap: z.string().regex(/^\d+$/, "Soft cap must be a positive number").optional(),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  contributedAt: true,
}).extend({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  contributionAmount: z.string().regex(/^\d+\.?\d*$/, "Contribution must be a valid number"),
  tokenAmount: z.string().regex(/^\d+\.?\d*$/, "Token amount must be a valid number"),
});

// TypeScript types
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;

export type InsertPresale = z.infer<typeof insertPresaleSchema>;
export type Presale = typeof presales.$inferSelect;

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

// Dashboard statistics type
export interface DashboardStats {
  totalTokens: number;
  activePresales: number;
  totalTransactions: number;
  totalValueLocked: string;
}
