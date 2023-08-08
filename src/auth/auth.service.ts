import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {

  constructor(@InjectModel( User.name ) private userModel: Model<User>){
    
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try{
      const { password, ...userData} = createUserDto;

      const newUser = new this.userModel({
        password: bcrypt.hashSync(password, 10),
        ...userData
      });

      //encrypt password

      //save user

      await newUser.save();
      const {password: _, ...user} = newUser.toJSON();

      return user;
    }catch(error){
      if(error === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async login(loginDTO: LoginDTO){
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
      ...rest,
      token: 'ABCDE123'
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
