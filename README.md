# Steam-Landscape

Welcome to Steam-Landscape!
This repo provides is public database of Steam data, including a list of all games on Steam, detailed information on each game, and tag information for each game. Additionally, we also have a basic yearly tag distribution data to help analyze trends over a year.

## Database

Our database is a SQLite database located at /database/small.db. You can access it using your preferred SQLite database client.

## Data Initialization

If you want to collect data from scratch, we've provided several scripts to help you. You can use the following scripts to initialize the database:

initDatabaseTables: sets up the database tables
initBaseGameDatabase: adds all games to the database
initSteamGameDatabase: adds detailed information about each game
initSteamTagDatabase: adds tag information for each game
Please note that collecting all data from scratch may take some time.

We hope you find this repository useful!
