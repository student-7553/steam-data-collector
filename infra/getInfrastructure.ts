import Infrastructure from "./infrastructure";

function initlizeInfra(): Infrastructure {
  if (!!infra) {
    return infra;
  }
  const newInfra = new Infrastructure();
  return newInfra;
}

let infra: Infrastructure;

function getInfra(): Infrastructure {
  if (!!infra) {
    return infra;
  }
  infra = initlizeInfra();
  return infra;
}

export default getInfra;
