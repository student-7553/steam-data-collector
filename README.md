# Steam-Data-Collector

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)

This repository is designed to make Steam data easily collectible. The repo provides some basic steam data, such as a full list of all games, detailed information on each game, tag information on each game, and basic yearly tag distribution data.

## Database

The SQLite database is located at `/database/small.db`.

## Getting Started

First, install the dependencies:
```bash
npm install
```

### Data Initialization

If you want to collect data from scratch, this repo provides several scripts to help you. You can use the following scripts to initialize the database:

- `npm run start:table`: Sets up the database tables.
- `npm run start:baseGame`: Adds all base games to the database.
- `npm run start:steamGame`: Fetches and adds detailed information about each game.
- `npm run start:steamTag`: Adds tag information for each game.

> [!WARNING]
> Please note that collecting or scraping all the data from scratch using the Steam API may take some time.

For continuous background fetching, you can use the forever scripts:
- `npm run forever:steamGame`
- `npm run forever:steamTag`

There are also utility scripts in `dataScripts/` and `scripts/` to create yearly tag distributions (e.g., `createYearlyTagDistribution.ts`, `createIndieYearlyTagDistribution.ts`).

## Formatting

To format the codebase with Prettier, run:
```bash
npm run format
```

## Personal Insight

Based on the collected data, here are some interesting insights regarding game tags:

### High-Performing Tags
These tags generally performed better compared to their peers:
- Open World, Sandbox, Crafting, Co-op, Open World Survival Craft
- Beautiful (aka High Quality)

### Underperforming Popular Tags
These are popular tags that didn't perform as well as their peers:
- Free to Play
- Linear
- Tabletop
- Logic
- Conversation

### Tags to Avoid
These tags historically show poor performance:
- 2D Fighter
- Abstract

## Sample Data

*(Sorted: recommendation total desc)*

| Tag | Game count | Recommendation total | Average USD Price |
| --- | --- | --- | --- |
| Indie | 10408 | 1381790 | $6.00 |
| Single player | 7337 | 1248329 | $5.47 |
| Action | 4365 | 949580 | $5.31 |
| Early Access | 1354 | 745438 | $6.20 |
| Adventure | 4296 | 725749 | $5.72 |
| Simulation | 2102 | 688972 | $7.11 |
| Open World | 588 | 598448 | $6.69 |
| Sandbox | 474 | 579156 | $7.71 |
| First-Person | 1215 | 535331 | $5.48 |
| Strategy | 2746 | 529994 | $8.09 |
