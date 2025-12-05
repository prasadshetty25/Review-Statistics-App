import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  permissions: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    this.logger.log(`Registering new user: ${registerDto.username}`);

    // Check if user already exists
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user with default permissions
    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash: hashedPassword,
      permissions: registerDto.permissions || ['reviews:read', 'reviews:create'],
    });

    // Generate token
    return this.generateTokenResponse(user);
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    this.logger.log(`Login attempt for user: ${loginDto.username}`);

    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    this.logger.log(`User logged in successfully: ${user.username}`);
    return this.generateTokenResponse(user);
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          permissions: user.permissions,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid or expired token',
      };
    }
  }

  /**
   * Generate JWT token response
   */
  private async generateTokenResponse(user: any): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      permissions: user.permissions,
    };

    const expiresIn = this.configService.get<string>('jwt.expiresIn');
    const access_token = this.jwtService.sign(payload);

    // Convert expiresIn to seconds
    const expiresInSeconds = this.parseExpiresIn(expiresIn);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: expiresInSeconds,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        permissions: user.permissions,
      },
    };
  }

  /**
   * Parse expires_in string to seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // Default 24 hours

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 86400;
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare passwords
   */
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
