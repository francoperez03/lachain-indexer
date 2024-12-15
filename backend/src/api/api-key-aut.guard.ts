import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  private readonly validApiKeys = ['YOUR_API_KEY'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['api-key'] || request.headers['x-api-key'];

    if (!apiKey || !this.validApiKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invafdkey');
    }

    return true;
  }
}
