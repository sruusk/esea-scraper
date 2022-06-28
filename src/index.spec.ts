/* eslint-disable no-console */
import { EseaScraper } from './index';
import { PlayerOutput } from './player-types';

jest.setTimeout(5 * 60 * 1000);
describe('The scraper class', () => {
  it('should be extendable', async () => {
    class Extended extends EseaScraper {
      public async getPlayer(...args: Parameters<EseaScraper['getPlayer']>): Promise<PlayerOutput> {
        const resp = await super.getPlayer(...args);
        console.log(resp);
        return resp;
      }
    }

    const extendedScraper = new Extended();
    const resp = await extendedScraper.getPlayer('2570455');
    expect(resp).toBeDefined();
    await extendedScraper.shutdown();
  });
});
