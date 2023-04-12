import getInfra from "../infra/getInfrastructure";
import { Services } from "./services";

let services: Services;

export function getServices() {
  if (!services) {
    const infra = getInfra();
    services = new Services(infra);
  }
  return services;
}
