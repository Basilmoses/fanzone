type FanZoneUser = {
  id: string;
  displayName: string;
  email: string;
};

type FanZoneD1Result<T = unknown> = {
  results: T[];
  success: boolean;
  meta: { changes: number; last_row_id?: number };
};

interface FanZoneD1Statement {
  bind(...values: unknown[]): FanZoneD1Statement;
  all<T = Record<string, unknown>>(): Promise<FanZoneD1Result<T>>;
  first<T = Record<string, unknown>>(columnName?: string): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<FanZoneD1Result<T>>;
}

interface FanZoneD1Database {
  prepare(query: string): FanZoneD1Statement;
  batch<T = unknown>(statements: FanZoneD1Statement[]): Promise<FanZoneD1Result<T>[]>;
}

declare global {
  namespace App {
    interface Locals {
      user: FanZoneUser | null;
    }

    interface Platform {
      env: {
        DB?: FanZoneD1Database;
      };
    }
  }
}

export {};
