import { regularExps } from "../../../config";

export class RegisterUserDto {
  private constructor(
    public name: string,
    public email: string,
    public password: string
  ) {}

  static create(obj: { [key: string]: any }): [string?, RegisterUserDto?] {
    const { name, email, password } = obj;

    if (!name) return ["Missing name"]; //*Si No se manda el segundo argumento, se toma como undefined.

    if (!email) return ["Missing email"];
    if (!regularExps.email.test(email)) return ["Email is not valid"];

    if (!password) return ["Missing password"];
    if (password.length < 6) return ["Password is not valid"]; //* Evaluar password con expresion regular like email.

    return [undefined, new RegisterUserDto(name, email, password)];
  }
}
