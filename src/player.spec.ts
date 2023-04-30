/* eslint-disable no-console */
import { EseaScraper } from './index';

jest.setTimeout(5 * 60 * 1000);
describe('The player scrapers', () => {
  let scraper: EseaScraper;

  beforeAll(async () => {
    scraper = new EseaScraper({ logger: console.log });
  });

  afterAll(async () => {
    await scraper.shutdown();
  });

  it('should return handle 10 simultaneous requests (status command)', async () => {
    const eseaIDs = [
      '974465',
      '2746569',
      '440390',
      '2742648',
      '2570455',
      '2572609',
      '751769',
      '2487672',
      '2573516',
      '2738955',
    ];

    const results = await Promise.all(
      eseaIDs.map(async (eseaId) => {
        const resp = await scraper.getPlayer(eseaId);
        expect(resp.summary).toMatchObject({
          age: expect.any(Number),
          alias: expect.any(String),
          id: expect.any(Number),
        });
        return resp;
      })
    );
    expect(results).toHaveLength(eseaIDs.length);
  });

  it('should throw on invalid get', async () => {
    await expect(scraper.getPlayer('208493849384/adw/')).rejects.toThrow(
      'https://play.esea.net/api/users/208493849384/adw/ returned a non-200 response: 404'
    );
  });

  it('should return all statistics', async () => {
    const response = await scraper.getPlayer('440390');
    expect(response.summary).toMatchObject({
      age: expect.any(Number),
      alias: expect.any(String),
      id: expect.any(Number),
      tier: expect.any(String),
    });
    expect(response.stats).toMatchObject({
      killDeathRatio: expect.any(Number),
      kills: expect.any(Number),
      deaths: expect.any(Number),
      wins: expect.any(Number),
      rank: expect.any(String),
      mmr: expect.any(Number),
      lastGameDate: expect.any(String),
      matches: expect.any(Number),
      headshotRate: expect.any(Number),
      averageDamageRound: expect.any(Number),
    });
  });

  it('should return esea profile for valid steamid', async () => {
    const response = await scraper.getPlayerFromSteamId64('76561198162880095');

    expect(response).toMatchObject({
      alias: expect.stringMatching('shoobie'),
      id: expect.stringMatching('1205171'),
      link: expect.stringMatching('/users/1205171'),
    });
  });

  it('should return error for invalid steamid', async () => {
    let err;
    let err2;

    try {
      await scraper.getPlayerFromSteamId64('Invalid Steam Id');
    } catch (error) {
      err = error;
    }

    try {
      await scraper.getPlayerFromSteamId64('99999999999999999');
    } catch (error) {
      err2 = error;
    }

    expect(err).toBeInstanceOf(Error);
    expect(err2).toBeInstanceOf(Error);
  });
});
