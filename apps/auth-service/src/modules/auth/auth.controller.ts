import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    this.logger.log(`Registration request for: ${registerDto.username}`);
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    this.logger.log(`Login request for: ${loginDto.username}`);
    return this.authService.login(loginDto);
  }

  /**
   * Validate JWT token
   * POST /auth/validate
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    this.logger.log('Token validation request');
    return this.authService.validateToken(validateTokenDto.token);
  }

  /**
   * Validate JWT token from Authorization header
   * GET /auth/verify
   */
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Headers('authorization') authorization: string) {
    this.logger.log('Token verification request');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return {
        valid: false,
        error: 'No token provided',
      };
    }

    const token = authorization.substring(7);
    return this.authService.validateToken(token);
  }

  /**
   * Get service info
   * GET /auth/info
   */
  @Get('info')
  getInfo() {
    return {
      service: 'Auth Service',
      version: '1.0.0',
      endpoints: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        validate: 'POST /auth/validate',
        verify: 'GET /auth/verify',
      },
    };
  }
}
