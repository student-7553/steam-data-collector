# Steam-Data-Collector
  
This repository is designed to make Steam data easily collectablel. The repo already provides some basic steam data, such as full list of all games, detailed information on each game, tag information on each game, and basic yearly tag distribution data. 

## Database

The SQLite database located at /database/small.db. 

## Data Initialization

If you want to collect data from scratch, this repo provides several scripts to help you. You can use the following scripts to initialize the database:

initDatabaseTables: sets up the database tables

initBaseGameDatabase: adds all games to the database

initSteamGameDatabase: adds detailed information about each game

initSteamTagDatabase: adds tag information for each game

Please note that collecting/scraping all the data from scratch may take some time.

## Personal Insight

Tags that performed well compared to their peer:

- Open World, Sandbox, Crafting, Co-op, Open World Survival Craft

- Beautiful (aka High Quality)

Popular tags that didn't perform well as their peers:

- Free to Play

- Linear

- Tabletop

- Logic

- Conversation

Tags that should be avoid like the plague:

- 2D Fighter

- Abstract

Some sample data (sorted: recommendation total desc)

Tag | Game count | Recommendation total | averageUSDPrice
--- | --- | --- | ---
Indie |	10408 |	1381790 |	600.0608186010776
Single player |	7337 |	1248329 |	547.4368270410259
Action |	4365 |	949580 |	531.1567010309277
Early Access |	1354 |	745438 |	619.7570162481529
Adventure |	4296 |	725749 |	571.9266759776539
Simulation |	2102 |	688972 |	711.016650808754
Open World |	588 |	598448 |	669.1139455782311
Sandbox |	474 |	579156 |	771.4894514767934
First-Person |	1215 |	535331 |	547.6740740740735
Strategy |	2746 |	529994 |	808.6241806263656


