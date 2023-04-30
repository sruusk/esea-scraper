/* eslint-disable object-shorthand */
import Hero from '@ulixee/hero';
import SteamID from 'steamid';
import {PlayerOutput, PlayerProfile} from './player-types';
import {EseaScraper} from './index';

async function fetch(hero: Omit<Hero, 'then'>, url: string): Promise<any> {
  const fetchResponse = await hero.fetch(url);
  // Check for page error
  const statusCode = await fetchResponse.status;
  if (statusCode !== 200) {
    throw new Error(`${url} returned a non-200 response: ${statusCode}`);
  }
  return fetchResponse.json();
}

function getStat(
  stats: [any],
  parseFunc: typeof parseInt | typeof parseFloat,
  statName: string
): number {
  // eslint-disable-next-line no-restricted-syntax
  for (const stat of stats) {
    if (stat.name === statName) {
      return parseFunc(stat.value, 10);
    }
  }
  throw new Error(`No ${statName} stat found`);
}

async function getPlayerProfile(hero: Omit<Hero, 'then'>, steamId64: string): Promise<PlayerProfile> {
  const steamId = new SteamID(steamId64).getSteam2RenderedID(true).replace('STEAM_', '');

  const userSearchUrl = `https://play.esea.net/api/search?query=${steamId}&index=users`;
  const userResponse = await fetch(hero, userSearchUrl);

  const userProfile = userResponse.data[0];
  return {
    alias: userProfile.title,
    id: userProfile.link.replace('/users/', ''),
    link: userProfile.link,
  };
}

export async function getPlayer(
  this: EseaScraper,
  eseaProfileId: string | bigint
): Promise<PlayerOutput> {
  const hero = await this.createHero();
  try {
    const origin = 'https://play.esea.net/api';

    this.debug(`Going to ${origin}`);
    const originResponse = await hero.goto(origin, { timeoutMs: this.timeout });
    const { statusCode } = originResponse.response;
    if (statusCode !== 200) {
      // Check for cloudflare challenge
      const title = hero.document.querySelector('title');
      if (title !== undefined && (await title.textContent) === 'Attention Required! | Cloudflare') {
        throw new Error(`play.esea.net returned a non-200 response: ${statusCode}
        Received cloudflare challenge. This is likely caused by an untrusted IP.`);
      }
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(`play.esea.net returned a non-200 response: ${statusCode}`);
    }

    // Check if the input is a SteamID64 and if so, get the ESEA profile ID from it
    if(/^7656119\d{10}$/.test(eseaProfileId.toString()))
      eseaProfileId = (await getPlayerProfile(hero, eseaProfileId.toString())).id;

    const userUrl = `${origin}/users/${eseaProfileId}`;
    const profileUrl = `${origin}/users/${eseaProfileId}/profile`;
    const statsUrl = `${origin}/users/${eseaProfileId}/stats?filters[type_scopes]=pug&filters[period_types]=career`;
    const lastMatchUrl = `${origin}/users/${eseaProfileId}/matches?page_size=1`;

    this.debug(`Fetching ${userUrl}`);
    const userResponse = await fetch(hero, userUrl);

    this.debug(`Fetching ${profileUrl}`);
    const profileResponse = await fetch(hero, profileUrl);

    this.debug(`Fetching ${statsUrl}`);
    const statsResponse = await fetch(hero, statsUrl);

    const user = userResponse.data;
    const profile = profileResponse.data;
    const stats = statsResponse.data.server_stats;

    if (stats.record === undefined) {
      await hero.close();
      return {
        summary: {
          age: user.age,
          alias: user.alias,
          avatar_url: user.avatar_full_url,
          banType: user.ban,
          id: user.id,
          name: user.name,
          twitch_username: user.twitch_username,
          tier: user.tier,
        },
      };
    }

    const wins = parseInt(stats.record.win, 10);
    const losses = parseInt(stats.record.loss, 10);
    const ties = parseInt(stats.record.tie, 10);
    const totalGames = wins + losses + ties;
    const kills = getStat(stats.stats, parseInt, 'all.frags');
    const deaths = getStat(stats.stats, parseInt, 'all.deaths');
    const kd = kills / deaths;
    this.debug(`kills: ${kills}, deaths: ${deaths}, kd: ${kd}`);

    this.debug(`Fetching ${lastMatchUrl}`);
    const lastMatchResponse = await fetch(hero, lastMatchUrl);
    const lastGameDate =
      lastMatchResponse.data.length > 0 ? lastMatchResponse.data[0].completed_at : undefined;

    await hero.close();

    return {
      summary: {
        age: user.age,
        alias: user.alias,
        avatar_url: user.avatar_full_url,
        banType: user.ban ? user.ban : undefined,
        id: user.id,
        name: user.name,
        twitch_username: user.twitch_username ?? undefined,
        tier: user.tier,
      },
      stats: {
        killDeathRatio: parseFloat(kd.toFixed(2)),
        wins: wins,
        kills: kills,
        deaths: deaths,
        rank: !profile.rank.placement_matches_remaining ? profile.rank.current.rank : undefined,
        mmr: !profile.rank.placement_matches_remaining
          ? parseInt(profile.rank.current.mmr, 10)
          : undefined,
        matches: totalGames,
        headshotRate: getStat(stats.stats, parseFloat, 'all.hs_percentage'),
        averageDamageRound: getStat(stats.stats, parseFloat, 'all.adr'),
        lastGameDate: lastGameDate,
      },
    };
  } catch (err) {
    await hero.close();
    throw err;
  }
}

export async function getPlayerFromSteamId64(
  this: EseaScraper,
  steamId64: string
): Promise<PlayerProfile> {
  const hero = await this.createHero();
  try {
    const origin = 'https://play.esea.net/api';

    this.debug(`Going to ${origin}`);
    const originResponse = await hero.goto(origin, { timeoutMs: this.timeout });
    const { statusCode } = originResponse.response;
    if (statusCode !== 200) {
      // Check for cloudflare challenge
      const title = hero.document.querySelector('title');
      if (title && (await title.textContent) === 'Attention Required! | Cloudflare') {
        throw new Error(`play.esea.net returned a non-200 response: ${statusCode}
        Received cloudflare challenge. This is likely caused by an untrusted IP.`);
      }
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(`play.esea.net returned a non-200 response: ${statusCode}`);
    }

    const playerProfile = await getPlayerProfile(hero, steamId64);

    await hero.close();

    return playerProfile;
  } catch (err) {
    await hero.close();
    throw err;
  }
}
