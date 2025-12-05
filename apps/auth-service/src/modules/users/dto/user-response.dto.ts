export class UserResponseDto {
  id!: number;
  username!: string;
  email!: string;
  permissions!: string[];
  isActive!: boolean;
  createdAt!: Date;
  lastLoginAt?: Date;
}
