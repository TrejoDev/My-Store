import { envs } from "./envs";

export class JWTSeed {

  public getJWTSeed() {
    return envs.JWT_SEED;
  }
}
