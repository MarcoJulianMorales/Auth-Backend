import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import {CreateUserDto, UpdateAuthDto, LoginDTO, RegisterUserDTO} from './dto'
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginDTO: LoginDTO){
    return this.authService.login(loginDTO);
  }

  @Post('register')
  register(@Body() registerUserDTO: RegisterUserDTO){
    return this.authService.register(registerUserDTO);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll( @Request() request: Request) {
    // const user = request['user']
    // return user;
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() req){
    const user: User = req['user'];
    return this.authService.renueToken(user);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
