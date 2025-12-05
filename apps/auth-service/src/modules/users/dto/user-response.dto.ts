export class UserResponseDto {
  id!: string;
  username!: string;
  email!: string;
  permissions!: string[];
  isActive!: boolean;
  createdAt!: Date;
  lastLoginAt?: Date;
}
