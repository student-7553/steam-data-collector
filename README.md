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

