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
  id: string;
  name: string;
  twitch_username: string;
  tier: string;
}

export interface PlayerStats {
  killDeathRatio: number;
  kills: number;
  deaths: number;
  rank: string | undefined;
  mmr: number | undefined;
  lastGameDate: string | undefined;
  wins: number;
  matches: number;
  headshotRate: number;
  averageDamageRound: number;
}

export interface PlayerOutput {
  summary: PlayerSummary;
  stats?: PlayerStats;
}
