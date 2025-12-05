import { Controller, Get, Param, Patch, Body, Logger, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users
   * GET /users
   */
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all users');
    return this.usersService.findAll();
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto | null> {
    this.logger.log(`Fetching user: ${id}`);
    const user = await this.usersService.findById(id);

    if (!user) {
      return null;
    }

    // Remove sensitive data
    const { passwordHash, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }

  /**
   * Update user permissions
   * PATCH /users/:id/permissions
   */
  @Patch(':id/permissions')
  async updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionsDto: UpdatePermissionsDto
  ): Promise<UserResponseDto> {
    this.logger.log(`Updating permissions for user: ${id}`);
    const user = await this.usersService.updatePermissions(id, updatePermissionsDto.permissions);

    // Remove sensitive data
    const { passwordHash, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }
}
