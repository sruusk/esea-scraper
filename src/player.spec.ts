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
    const steamIDs = [
      '2742648',
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
      steamIDs.map(async (steamId) => {
        const resp = await scraper.getPlayer(steamId);
        expect(resp.summary).toMatchObject({
          age: expect.any(Number),
          alias: expect.any(String),
          id: expect.any(Number),
        });
        return resp;
      })
    );
    expect(results).toHaveLength(steamIDs.length);
  });

  it('should throw on invalid get', async () => {
    await expect(scraper.getPlayer('208493849384/adw/')).rejects.toThrow(
      'https://play.esea.net/api/users/208493849384/adw/ returned a non-200 response: 404'
    );
  });
});
