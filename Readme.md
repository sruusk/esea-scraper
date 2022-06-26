# esea-scraper

A consumable Node package to scrape data from ESEA.
Due to ESEA not having an API, and being mostly protected by Cloudflare, the best approach is to spin up a headless 
browser to load the page and scrape it.  
[csgostatsgg-scraper](https://www.npmjs.com/package/csgostatsgg-scraper) is working as the base for this project.  
[Ulixee Hero](https://ulixee.org/docs/hero) is used to bypass Cloudflare and manage the DOM scraping.

## Usage

### Install

To start, it's best to run with a local Hero Core, so you should install `@ulixee/hero-core` as a peer dependency:

```shell
npm i csgostatsgg-scraper @ulixee/hero-core
```

Later, if you'd like to use a remote Hero Core, you can remove the `@ulixee/hero-core` peer dependency.
