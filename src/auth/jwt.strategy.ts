import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || 'defaultSecret';
    console.log('JwtStrategy constructor called');
    console.log('JWT Secret being used:', secret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    console.log('JWT Strategy validate called with payload:', payload);

    if (!payload.sub || !payload.email) {
      console.log('Invalid payload:', payload);
      throw new UnauthorizedException('Invalid token payload');
    }

    console.log('JWT validation successful for user:', payload.email);
    return { userId: payload.sub, email: payload.email };
  }
}
