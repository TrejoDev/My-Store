import jwt from "jsonwebtoken";
import { JWTSeed } from "./jwt-seed";

// const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {
  constructor(public readonly seed: JWTSeed) {}

  generateToken = async (payload: any, duration: string = "2h") => {
    return new Promise((resolve) => {
      jwt.sign( payload, this.seed.getJWTSeed(), { expiresIn: duration }, (error, token) => {
          if (error) return resolve(null);

          resolve(token);
        }
      );
    });
  };

  validateToken = <T>(token: string ): Promise< T | null> => {
    return new Promise ((resolve) => {
      jwt.verify( token, this.seed.getJWTSeed(), ( (error, decoded) => {
          if (error) return resolve(null);

          resolve(decoded as T);
        })
      );
    });
  }

}
