import {
  type Token,
  type InsertToken,
  type Presale,
  type InsertPresale,
  type Participant,
  type InsertParticipant,
  type DashboardStats,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Token operations
  getToken(id: string): Promise<Token | undefined>;
  getAllTokens(): Promise<Token[]>;
  getRecentTokens(limit?: number): Promise<Token[]>;
  getTokensByCreator(creatorAddress: string): Promise<Token[]>;
  createToken(token: InsertToken): Promise<Token>;
  updateToken(id: string, updates: Partial<Token>): Promise<Token | undefined>;

  // Presale operations
  getPresale(id: string): Promise<Presale | undefined>;
  getAllPresales(): Promise<Presale[]>;
  getActivePresales(): Promise<Presale[]>;
  getPresalesByStatus(status: string): Promise<Presale[]>;
  createPresale(presale: InsertPresale): Promise<Presale>;
  updatePresale(id: string, updates: Partial<Presale>): Promise<Presale | undefined>;

  // Participant operations
  getParticipant(id: string): Promise<Participant | undefined>;
  getParticipantsByPresale(presaleId: string): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;

  // Statistics
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private tokens: Map<string, Token>;
  private presales: Map<string, Presale>;
  private participants: Map<string, Participant>;

  constructor() {
    this.tokens = new Map();
    this.presales = new Map();
    this.participants = new Map();

    // Seed with demo data
    this.seedDemoData();
  }

  private seedDemoData() {
    // Create demo tokens
    const demoToken1: Token = {
      id: randomUUID(),
      name: "Privacy Coin",
      symbol: "PRIV",
      totalSupply: "1000000",
      isEncrypted: true,
      contractAddress: "0x" + "1".repeat(40),
      deploymentTxHash: "0x" + "a".repeat(64),
      creatorAddress: "0x" + "2".repeat(40),
      network: "sepolia",
      status: "deployed",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    };

    const demoToken2: Token = {
      id: randomUUID(),
      name: "Secure Token",
      symbol: "SCRT",
      totalSupply: "500000",
      isEncrypted: true,
      contractAddress: "0x" + "3".repeat(40),
      deploymentTxHash: "0x" + "b".repeat(64),
      creatorAddress: "0x" + "4".repeat(40),
      network: "sepolia",
      status: "deployed",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    };

    this.tokens.set(demoToken1.id, demoToken1);
    this.tokens.set(demoToken2.id, demoToken2);

    // Create demo presales
    const now = new Date();
    const demoPresale1: Presale = {
      id: randomUUID(),
      tokenId: demoToken1.id,
      tokenName: demoToken1.name,
      tokenSymbol: demoToken1.symbol,
      pricePerToken: "0.001",
      hardCap: "100",
      softCap: "10",
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Ends in 5 days
      contractAddress: "0x" + "5".repeat(40),
      ownerAddress: "0x" + "2".repeat(40),
      totalRaised: "25.5",
      participantCount: 12,
      status: "active",
      isEncrypted: true,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    };

    const demoPresale2: Presale = {
      id: randomUUID(),
      tokenId: demoToken2.id,
      tokenName: demoToken2.name,
      tokenSymbol: demoToken2.symbol,
      pricePerToken: "0.002",
      hardCap: "50",
      softCap: "5",
      startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Starts tomorrow
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // Ends in 10 days
      contractAddress: "0x" + "6".repeat(40),
      ownerAddress: "0x" + "4".repeat(40),
      totalRaised: "0",
      participantCount: 0,
      status: "upcoming",
      isEncrypted: true,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    };

    this.presales.set(demoPresale1.id, demoPresale1);
    this.presales.set(demoPresale2.id, demoPresale2);
  }

  // Token operations
  async getToken(id: string): Promise<Token | undefined> {
    return this.tokens.get(id);
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getRecentTokens(limit: number = 5): Promise<Token[]> {
    const tokens = await this.getAllTokens();
    return tokens.slice(0, limit);
  }

  async getTokensByCreator(creatorAddress: string): Promise<Token[]> {
    return Array.from(this.tokens.values())
      .filter((token) => token.creatorAddress.toLowerCase() === creatorAddress.toLowerCase())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = randomUUID();
    const token: Token = {
      ...insertToken,
      id,
      createdAt: new Date(),
    };
    this.tokens.set(id, token);
    return token;
  }

  async updateToken(id: string, updates: Partial<Token>): Promise<Token | undefined> {
    const token = this.tokens.get(id);
    if (!token) return undefined;

    const updatedToken = { ...token, ...updates };
    this.tokens.set(id, updatedToken);
    return updatedToken;
  }

  // Presale operations
  async getPresale(id: string): Promise<Presale | undefined> {
    return this.presales.get(id);
  }

  async getAllPresales(): Promise<Presale[]> {
    return Array.from(this.presales.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getActivePresales(): Promise<Presale[]> {
    return Array.from(this.presales.values())
      .filter((presale) => presale.status === "active")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPresalesByStatus(status: string): Promise<Presale[]> {
    return Array.from(this.presales.values())
      .filter((presale) => presale.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPresale(insertPresale: InsertPresale): Promise<Presale> {
    const id = randomUUID();
    const presale: Presale = {
      ...insertPresale,
      id,
      totalRaised: "0",
      participantCount: 0,
      createdAt: new Date(),
    };
    this.presales.set(id, presale);
    return presale;
  }

  async updatePresale(id: string, updates: Partial<Presale>): Promise<Presale | undefined> {
    const presale = this.presales.get(id);
    if (!presale) return undefined;

    const updatedPresale = { ...presale, ...updates };
    this.presales.set(id, updatedPresale);
    return updatedPresale;
  }

  // Participant operations
  async getParticipant(id: string): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantsByPresale(presaleId: string): Promise<Participant[]> {
    return Array.from(this.participants.values())
      .filter((p) => p.presaleId === presaleId)
      .sort((a, b) => b.contributedAt.getTime() - a.contributedAt.getTime());
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = randomUUID();
    const participant: Participant = {
      ...insertParticipant,
      id,
      contributedAt: new Date(),
    };
    this.participants.set(id, participant);

    // Update presale stats
    const presale = await this.getPresale(insertParticipant.presaleId);
    if (presale) {
      const newTotalRaised = (
        parseFloat(presale.totalRaised) + parseFloat(insertParticipant.contributionAmount)
      ).toString();
      
      await this.updatePresale(presale.id, {
        totalRaised: newTotalRaised,
        participantCount: presale.participantCount + 1,
      });
    }

    return participant;
  }

  // Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const tokens = await this.getAllTokens();
    const presales = await this.getAllPresales();
    const activePresales = presales.filter((p) => p.status === "active");
    const participants = Array.from(this.participants.values());

    const totalValueLocked = presales.reduce(
      (sum, presale) => sum + parseFloat(presale.totalRaised),
      0
    );

    return {
      totalTokens: tokens.length,
      activePresales: activePresales.length,
      totalTransactions: tokens.length + participants.length,
      totalValueLocked: totalValueLocked.toFixed(2),
    };
  }
}

export const storage = new MemStorage();
