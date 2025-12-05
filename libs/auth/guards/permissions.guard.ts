import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Check for required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const user = request.user;

    // If permissions are required but no user, deny access
    if (!user) {
      this.logger.error('Permission check failed: No user found in request');
      throw new ForbiddenException('User authentication required');
    }

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      user?.permissions?.includes(permission)
    );

    if (!hasPermission) {
      this.logger.warn(`Permission denied for user ${user.username}: missing [${requiredPermissions.join(', ')}]`);
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}
