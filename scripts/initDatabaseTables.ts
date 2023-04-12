import getInfra from "../infra/getInfrastructure";

const infra = getInfra();

async function initDatabaseTables() {
  await infra.sqliteDatbase.connectDb();
  await infra.sqliteDatbase.ensureBaseTables();
}

initDatabaseTables();
