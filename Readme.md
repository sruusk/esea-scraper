[![CodeQL](https://github.com/Apina-32/esea-scraper/actions/workflows/codeql.yml/badge.svg)](https://github.com/Apina-32/esea-scraper/actions/workflows/codeql.yml)

# esea-scraper

A consumable Node package to scrape data from ESEA.
Due to ESEAs API being protected by Cloudflare, the best approach is to spin up a headless
browser and scrape the API.  
[csgostatsgg-scraper](https://www.npmjs.com/package/csgostatsgg-scraper) is working as the base for this project.  
[Ulixee Hero](https://ulixee.org/docs/hero) is used to bypass Cloudflare and CORS.

## Usage

### Install

To start, it's best to run with a local Hero Core, so you should install `@ulixee/hero-core` as a peer dependency:

```shell
npm i esea-scraper @ulixee/hero-core
```

Later, if you'd like to use a remote Hero Core, you can remove the `@ulixee/hero-core` peer dependency.

### Example Usage

- Typescript:

```js
import { EseaScraper } from 'esea-scraper';

const esea = new EseaScraper();
await esea.getPlayer('2570455');
```

- Javascript:

```js
const eseaScraper = require('esea-scraper');
const esea = new eseaScraper.EseaScraper();
await esea.getPlayer('2570455');
```

## Development

To contribute to the repo, you should install the dependencies of the project.

```
npm i
```

In order to verify your code works, you should make a relevant test for it, and check your tests pass using the following command:

```
npm run test
```
