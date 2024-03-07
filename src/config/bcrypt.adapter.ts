import { compareSync, genSaltSync, hashSync } from "bcryptjs";

export const bcryptAdapter = {
  hash: (password: string) => {
    const salt = genSaltSync();

    return hashSync(password.toString(), salt);
  },

  compare: (password: string, hashed: string) => {
    return compareSync(password.toString(), hashed);
  },
};
