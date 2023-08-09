import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './interfaces/jwt.payload';
import { ILoginResponse } from './interfaces/login.response';
import { CreateUserDto, UpdateAuthDto, RegisterUserDTO, LoginDTO } from './dto'

@Injectable()
export class AuthService {

  constructor(@InjectModel( User.name ) private userModel: Model<User>,  private jwtService: JwtService){
    
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto)
    try{
      const { password, ...userData} = createUserDto;

      //encrypt password
      const newUser = new this.userModel({
        password: bcrypt.hashSync(password, 10),
        ...userData
      });

      //save user
      await newUser.save();
      const {password: _, ...user} = newUser.toJSON();

      return user;
    }catch(error){
      if(error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async register(registerDTO: RegisterUserDTO): Promise<ILoginResponse>{
    const user = await this.create(registerDTO);
    
    return {
      user: user,
      token: await this.getJWT({id: user._id})
    };
  }

  async login(loginDTO: LoginDTO):Promise<ILoginResponse>{
    const {email, password} = loginDTO;

    const user = await this.userModel.findOne({email});

    if(!user){
      throw new UnauthorizedException('Not valid email!');
    }

    if(!bcrypt.compareSync( password, user.password)){
      throw new UnauthorizedException('Not valid password!')
    }

    const {password:_, ...rest} = user.toJSON();

    return {
      user: rest,
      token: await this.getJWT({id: user.id}),
    }
  }

  async findUserById(id: string){
    const user = await this.userModel.findById(id);
    const {password, ...rest} = user.toJSON();
    return rest;
  }

  async renueToken(user: User): Promise<ILoginResponse>{
    return {
      user,
      token: await this.getJWT({id: user._id})
    }
  }

  async getJWT(payload: JWTPayload){
    console.log('jwt')
    const token =  await this.jwtService.signAsync(payload);
    console.log('token: ',token)
    return token;
  }
}
