import SteamID from 'steamid';
import * as chrono from 'chrono-node';
import Hero from '@ulixee/hero';
import {BanType, PlayerOutput,} from './player-types';
import {EseaScraper} from './index';
import { setTimeout } from 'timers/promises';

function booleanToInt(boolean?: boolean): number | undefined {
  if (boolean === true) return 1;
  if (boolean === false) return 0;
  return boolean;
}

function parsePercent(string: string, radix?: number): number {
  return parseInt(string, radix) / 100;
}

async function parseNumber(
  hero: Omit<Hero, 'then'>,
  parseFunc: typeof parseInt | typeof parseFloat,
  selector: string
): Promise<number | undefined> {
  const elem = hero.document.querySelector(selector);
  if (!(await elem.$exists)) return undefined;
  return parseFunc(await elem.innerText, 10);
}

async function parseMatches(hero: Omit<Hero, 'then'>, wins: number): Promise<number> {
  let losses = await parseNumber(hero, parseInt, '.cuKliN');
  let ties = await parseNumber(hero, parseInt, '.hRjBLV');
  if(wins === undefined || losses === undefined || ties === undefined) {
    losses = 0;
    ties = 0;
  }
  return wins + losses + ties;
}

function parseStat(stats: any, statIndex: number): number {
  const stat = stats[statIndex];
  return parseInt(stat.textContent, 10);
}

function parseEseaDate(dateString: string): Date {
  // 11/18/2021
  return chrono.parseDate(dateString);
}

export async function getPlayer(
  this: EseaScraper,
  eseaProfileId: string | bigint
): Promise<PlayerOutput> {
  const hero = await this.createHero();
  try {
    let statsUrl = `https://play.esea.net/users/${eseaProfileId}/stats?filters[type_scopes]=pug&filters[period_types]=career`;

    this.debug(`Going to ${statsUrl}`);
    const gotoResp = await hero.goto(statsUrl, { timeoutMs: this.timeout });

    // Check for page error
    const { statusCode } = gotoResp.response;
    if (statusCode !== 200) {
      throw new Error(`play.esea.net returned a non-200 response: ${statusCode}`);
    }

    await this.debug(await hero.document.documentElement.querySelector('body').innerHTML);
    await setTimeout(10000);
    const eseaUserName = await hero.document.querySelector('.eNlNUK').title;
    const eseaPictureUrl = await hero.document.querySelector('.bnPUMF').src;

    let wins = await parseNumber(hero, parseInt, '.kqhCcR');
    this.debug(`wins: ${wins}`)
    if(wins === undefined) wins = 0;
    const matches = await parseMatches(hero, wins);
    this.debug(`matches: ${matches}`)

    const lastGameAndBanElem = hero.document.querySelector('.fAkqrh');
    let lastGameString: string | undefined;
    if ((await lastGameAndBanElem.$exists) && (await lastGameAndBanElem.firstChild.$exists)) {
      lastGameString = (await lastGameAndBanElem.firstChild.textContent)?.trim() as string;
    }

    this.debug(`lastGameString: ${lastGameString}`);
    let lastGameDate: Date | undefined;
    if (lastGameString) {
      lastGameDate = parseEseaDate(lastGameString);
    }

    let banString;
    let banType: BanType | undefined;
    let banDate: Date | undefined;

    let errorMessage: string | undefined;
    if (matches === 0) {
      errorMessage = "No matches found";
    }

    if (errorMessage) {
      this.debug(errorMessage);
      await hero.close();
      return {
        summary: {
          eseaUserName,
          eseaPictureUrl,
          lastGameDate,
          banType,
          banDate,
        },
      };
    }

    const statsElem = hero.document.querySelector('.eiQngx').querySelectorAll('.jcipWc');
    const killDeathRatio = parseStat(statsElem, 0) / parseStat(statsElem, 2);
    const headshotRate = parseStat(statsElem, 11);
    const averageDamageRound = parseStat(statsElem, 12);


    // Get MMR
    let mmr: number | undefined;
    let profileUrl = `https://play.esea.net/users/${eseaProfileId}`;

    this.debug(`Going to ${profileUrl}`);
    const response = await hero.goto(statsUrl, { timeoutMs: this.timeout });

    // Check for page error
    const profileStatusCode = response.response.statusCode
    if (profileStatusCode !== 200) {
      throw new Error(`play.esea.net returned a non-200 response: ${profileStatusCode}`);
    }
    mmr = await parseNumber(hero, parseInt, '.jICdBM');

    await hero.close();
    return {
      summary: {
        eseaUserName,
        eseaPictureUrl,
        lastGameDate,
        banType,
        banDate,
      },
      stats: {
        killDeathRatio,
        wins,
        mmr,
        matches,
        headshotRate,
        averageDamageRound
      }
    };
  } catch (err) {
    await hero.close();
    throw err;
  }
}
