/* eslint-disable camelcase */

export enum BanType {
  VAC = 'VAC',
  OVERWATCH = 'Overwatch',
}

export interface PlayerSummary {
  age: number;
  alias: string;
  avatar_url: string;
  banType?: BanType | undefined;
  name: string;
}

export interface PlayerStats {
  killDeathRatio: number;
  rank: string | undefined;
  mmr: number | undefined;
  wins: number;
  matches: number;
  headshotRate: number;
  averageDamageRound: number;
}

export interface PlayerOutput {
  summary: PlayerSummary;
  stats?: PlayerStats;
}
