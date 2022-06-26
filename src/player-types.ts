/* eslint-disable camelcase */

export enum BanType {
  VAC = 'VAC',
  OVERWATCH = 'Overwatch',
}

export interface PlayerSummary {
  eseaUserName: string;
  eseaPictureUrl: string;
  lastGameDate: Date | undefined;
  banType?: BanType | undefined;
  banDate?: Date | undefined;
}

export interface PlayerStats {
  killDeathRatio: number;
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
