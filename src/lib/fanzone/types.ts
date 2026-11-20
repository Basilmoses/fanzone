export type Category = "Premier League" | "Champions League" | "World Cup" | "AFCON" | "Legends" | "Clubs" | "International";
export interface Question { id: string; category: Category; q: string; options: string[]; answer: number; }
export interface Player { id: string; name: string; avatar: string; country: string; points: number; wins: number; accuracy: number; level: number; online?: boolean; }
export interface Tournament { id: string; name: string; category: Category | "Mixed"; entry: string; prize: string; participants: number; max: number; endsAt: number; rules: string[]; }
export interface Txn { id: string; type: "deposit" | "withdraw" | "reward" | "entry"; label: string; amount: number; date: number; }
export interface Activity { id: string; text: string; date: number; points?: number; }
