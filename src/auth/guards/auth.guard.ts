import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from '../interfaces/jwt.payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtService: JwtService, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    //console.log(request)

    if (!token) {
      throw new UnauthorizedException('Valid token expected');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(
        token,{ secret: process.env.JWT_SEED });
      
      const user = await this.authService.findUserById(payload.id);
      if(!user) throw new UnauthorizedException('User does not exist!');
      if(!user.isActive) throw new UnauthorizedException('User is not active!');

      //console.log({ payload })

      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    console.log('Valid token!');
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}