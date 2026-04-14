import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { GoogleProfileInput } from '../types/google-profile.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') ?? '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ??
        'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GoogleProfileInput {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase() ?? '';

    return {
      email,
      name: profile.name?.givenName?.trim() ?? '',
      surname: profile.name?.familyName?.trim() ?? '',
    };
  }
}
