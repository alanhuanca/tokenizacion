import { JwtAdapter, bcryptAdapter } from '../../config';
import { CardModel, UserModel } from '../../data';
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from '../../domain';
import { createClient } from 'redis';

export class AuthService {

  // DI
  constructor() { }


  public async registerUser(registerUserDto: RegisterUserDto) {

    const client = await createClient()
      .on('error', err => console.log('Redis Client Error', err))
      .connect();

    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) {
      let data = await client.get(registerUserDto.email);
      await client.disconnect();
      return JSON.parse(data ?? '');
    }

    try {
      const user = new UserModel(registerUserDto);

      // Encriptar la contraseña
      user.password = bcryptAdapter.hash(registerUserDto.password);

      await user.save();
      // JWT <---- para mantener la autenticación del usuario

      // Email de confirmación

      const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });
      if (!token) throw CustomError.internalServer('Error while creating JWT');


      const { password, ...userEntity } = UserEntity.fromObject(user);
      await client.set(registerUserDto.email, JSON.stringify({
        user: userEntity,
        token: token
      }));
      await client.disconnect();

      return {
        user: userEntity,
        token: token
      };

    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }

  }


  public async loginUser(loginUserDto: LoginUserDto) {

    const user = await UserModel.findOne({ email: loginUserDto.email });
    if (!user) throw CustomError.badRequest('Email not exist');

    const isMatching = bcryptAdapter.compare(loginUserDto.password, user.password);
    if (!isMatching) throw CustomError.badRequest('Password is not valid');


    const { password, ...userEntity } = UserEntity.fromObject(user);

    const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });
    if (!token) throw CustomError.internalServer('Error while creating JWT');

    return {
      user: userEntity,
      token: token,
    }



  }
  public validateEmail = async (token: string) => {

    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.unauthorized('Invalid token');

    if (payload==='jwt expired'){
      throw CustomError.unauthorized('Token expired');
    }

    const { email, exp } = payload as { email: string , exp: any};
    if (!email) throw CustomError.internalServer('Email not in token');

    if(!exp)throw CustomError.internalServer('Exp not in token');

    const user = await UserModel.findOne({ email });
    if (!user) throw CustomError.internalServer('Email not exists');

    user.emailValidated = true;
    await user.save();

    return true;
  }

  public validateToken = async (token: string) => {

    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.unauthorized('Invalid token');

    if (payload==='jwt expired'){
      throw CustomError.unauthorized('Token expired');
    }

    const { card_number, exp,expiration_month,expiration_year,email } = payload as { 
      card_number: number , 
      exp: any,
      expiration_month: string,
      expiration_year: string,
      email: string
    };

    if (!card_number) throw CustomError.internalServer('card number not in token');

    if(!exp)throw CustomError.internalServer('Exp not in token');

    let card = await CardModel.findOne({ card_number });
    if (!card) throw CustomError.internalServer('card number not exists');
    
    return {
      card_number,
      expiration_month,
      expiration_year,
      email
    };
  }

}