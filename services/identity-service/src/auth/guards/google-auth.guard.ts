import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ query?: { intent?: string } }>();
    const intent = request?.query?.intent === 'register' ? 'register' : 'login';

    return {
      scope: ['email', 'profile'],
      state: intent,
      session: false,
    };
  }
}
