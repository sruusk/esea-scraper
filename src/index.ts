import debug, { Debugger } from 'debug';
import Hero, { IHeroCreateOptions } from '@ulixee/hero';
import PQueue from 'p-queue';
import type Core from '@ulixee/hero-core';
import { getPlayer, getPlayerFromSteamId64 } from './player';
import LocalHero from './local-hero';

export * from './player-types';

export interface ScraperOptions {
  /**
   * The default timeout for web scraping events
   * @default 120000
   */
  timeout?: number;

  /**
   * Any overrides you directly want to set on the Hero instance
   */
  heroOverrides?: IHeroCreateOptions;

  /**
   * If true, a Hero core will run locally, rather than using a configured remote core
   * @default true
   */
  useLocalHero?: boolean;

  /**
   * The number of requests that can be run concurrently. Any extra will be queued.
   * @default 10
   */
  concurrency?: number;

  /**
   * A custom logger, if you don't want to use [debug](https://www.npmjs.com/package/debug)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: (...args: any[]) => void;
}
export class EseaScraper {
  protected heroOptions: IHeroCreateOptions;

  protected debug: Debugger = debug('esea-scraper');

  protected timeout = 2 * 60 * 1000;

  protected queue: PQueue;

  private useLocalHero = true;

  private Core?: typeof Core;

  private heroCore?: typeof import('@ulixee/hero-core');

  constructor(options?: ScraperOptions) {
    this.heroOptions = {
      // https://ulixee.org/docs/hero/overview/configuration#blocked-resources
      // Blocking 'All' should work, since we are only looking for JSON responses from the API
      blockedResourceTypes: ['All'],
      ...options?.heroOverrides,
    };
    this.timeout = options?.timeout ?? this.timeout;
    this.debug = (options?.logger as Debugger) ?? this.debug;
    this.queue = new PQueue({ concurrency: options?.concurrency ?? 10 });
    this.useLocalHero = options?.useLocalHero ?? this.useLocalHero;

    this.queue.on('add', () => {
      if (this.queue.size) {
        this.debug(`${this.queue.size} requests are currently waiting`);
      }
    });
  }

  public async shutdown(): Promise<void> {
    if (this.Core) {
      this.debug('Shutting down core');
      await this.Core.shutdown();
      this.Core = undefined;
    }
  }

  protected async createHero(): Promise<Hero> {
    try {
      this.heroCore = this.heroCore ?? (await import('@ulixee/hero-core')); // If this doesn't throw, we can create a local Hero
      if (this.heroCore && this.useLocalHero) {
        const localHero = LocalHero.create(this.heroOptions);
        this.Core = LocalHero.Core;
        return localHero;
      }
    } catch {
      // continue
    }
    return new Hero(this.heroOptions);
  }

  public getPlayer(...args: Parameters<typeof getPlayer>): ReturnType<typeof getPlayer> {
    return this.queue.add(() => getPlayer.bind(this)(...args));
  }

  public getPlayerFromSteamId64(
    ...args: Parameters<typeof getPlayerFromSteamId64>
  ): ReturnType<typeof getPlayerFromSteamId64> {
    return this.queue.add(() => getPlayerFromSteamId64.bind(this)(...args));
  }
}
