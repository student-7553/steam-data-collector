import getInfra from "../infra/getInfrastructure";
import { getServices } from "../services/getServices";

const services = getServices();
const infra = getInfra();

export async function recentGames(offset: number, size: number) {
  await infra.sqliteDatbase.connectDb();
  const steamRecentGames = await infra.sqliteDatbase.getRecentGames(
    offset,
    size,
  );
  return steamRecentGames;
}
