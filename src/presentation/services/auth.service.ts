import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { JWTSeed } from "../../config/jwt-seed";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";
import { EmailService } from "./email.service";

const jwtAdapter = new JwtAdapter(new JWTSeed());

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(regsiterUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: regsiterUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(regsiterUserDto);

      //*   encriptar el password
      user.password = bcryptAdapter.hash(regsiterUserDto.password);
      await user.save();

      //*   generar un JWT, para mantener la autenticacion del usuario.
      const token = await jwtAdapter.generateToken({
        id: user.id,
      });
      if (!token) throw CustomError.internalServer("Error while creating JWT");

      //*   Enviar un email de confirmacion.
      await this.sendEmailValidationLink(user.email);

      const { password, ...userEntity } = UserEntity.fromObj(user);

      return {
        user: userEntity,
        token,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await UserModel.findOne({ email: loginUserDto.email });
    if (!user) throw CustomError.badRequest("email or password is not valid");

    const isMatching = bcryptAdapter.compare(
      loginUserDto.password,
      user.password
    );
    if (!(isMatching === true))
      throw CustomError.badRequest("email or password is not valid");

    //*debido al Type Coercion de javascript en la comparación if ( !isMatching) {} resultaría falso (y nos devolvería el usuario autenticado) incluso si no recibimos un booleano "true", por ejemplo, nos devolvería falso si recibimos un string (not empty), una promesa no resuelta, un array (incluso vacío), un número, etc.
    //* ! [] --> false
    //* ! 'true' --> false
    //* !Promise --> false
    //* !1 --> false
    //* Pienso que para más seguridad , yo haría la comparación de esta forma, usando un strict equality operator:

    const { password, ...userEntity } = UserEntity.fromObj(user);

    const token = await jwtAdapter.generateToken({
      id: user.id,
    });
    if (!token) throw CustomError.internalServer("Error while creating JWT");

    return {
      user: userEntity,
      token,
    };
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await jwtAdapter.generateToken({ email });
    if (!token) throw CustomError.internalServer("Error getting token");

    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;
    const html = `
      <h1>validate your email</h1>
      <p>Click on the following link to validate your email</p>
      <a href="${link}">Validate your email: ${email}</a>
    `;

    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    };

    const isSet = await this.emailService.sendEmail(options);
    if (!isSet) throw CustomError.internalServer("Error sending email");

    return true;
  };

  public validateEmail = async (token: string) => {
    const payload = await jwtAdapter.validateToken(token);
    if( !payload ) throw CustomError.unauthorized("Invalid token");

    const { email } = payload as { email: string };
    if( !email ) throw CustomError.internalServer("Email not in token");

    const user = await UserModel.findOne({ email });
    if( !user ) throw CustomError.internalServer("Email not exist");

    user.emailValidated = true;
    await user.save();

    return true;
  };
}
