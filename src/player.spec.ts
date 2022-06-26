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
      '2746569'
    ];

    const results = await Promise.all(
      steamIDs.map(async (steamId) => {
        const resp = await scraper.getPlayer(steamId);
        expect(resp.summary).toMatchObject({
          steamId64: expect.any(String),
          steamProfileUrl: expect.any(String),
          steamPictureUrl: expect.any(String),
        });
        return resp;
      })
    );
    expect(results).toHaveLength(steamIDs.length);
  });

  it('should throw on invalid get', async () => {
    await expect(scraper.getPlayer('208493849384')).rejects.toThrow(
      'play.esea.net returned a non-200 response: 404'
    );
  });
});
