import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface JwtPayload {
  sub: string; // JWT spec requires string, but represents user id (number)
  username: string;
  email?: string;
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    @InjectDataSource('databaseConnection') private dataSource: DataSource
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      // Convert string sub to number for database query
      const userId = parseInt(payload.sub, 10);
      if (isNaN(userId)) {
        throw new UnauthorizedException('Invalid user ID in token');
      }
      const userFromDb = await this.dataSource.query(
        'SELECT id, username, email, permissions, last_login_at FROM users WHERE id = $1',
        [userId]
      );

      if (!userFromDb || userFromDb.length === 0) {
        this.logger.warn(`User ${payload.sub} not found in database`);
        throw new UnauthorizedException('User no longer exists');
      }

      const dbUser = userFromDb[0];

      // Handle permissions - PostgreSQL text[] returns as comma-separated string
      let permissions: string[] = [];
      if (dbUser.permissions) {
        if (Array.isArray(dbUser.permissions)) {
          permissions = dbUser.permissions;
        } else if (typeof dbUser.permissions === 'string') {
          // Parse comma-separated string: "reviews:create,reviews:read"
          permissions = dbUser.permissions.split(',').map(p => p.trim()).filter(p => p);
        }
      }

      // Return user with CURRENT permissions from database (not from token)
      return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        permissions: permissions,
      };

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Database error during user validation:', error.message);
      throw new UnauthorizedException('Could not validate user');
    }
  }
}
