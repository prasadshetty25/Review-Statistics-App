export class TokenResponseDto {
  access_token!: string;
  token_type: string = 'Bearer';
  expires_in!: number;
  user!: {
    id: string;
    username: string;
    email: string;
    permissions: string[];
  };
}
