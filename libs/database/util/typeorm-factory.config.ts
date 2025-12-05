import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

export const createTypeOrmConfig = (
  databaseName: string
): TypeOrmModuleAsyncOptions => {
  return {
    name: `${databaseName}Connection`,
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
      const sslConfig = configService.get(`${databaseName}.sslConfig`);
      const password = configService.get<string>(`${databaseName}.password`);

      return {
        type: 'postgres',
        host: configService.get<string>(`${databaseName}.host`),
        timezone: configService.get<string>(`${databaseName}.timezone`),
        port: configService.get<number>(`${databaseName}.port`),
        password: String(password),
        username: configService.get<string>(`${databaseName}.username`),
        database: configService.get<string>(`${databaseName}.database`),
        entities: [
          path.join(__dirname, '..', 'postgres', 'entities', '**', '*.entity{.ts,.js}')
        ],
        synchronize: configService.get<boolean>(`${databaseName}.synchronize`),
        autoLoadEntities: configService.get<boolean>(
          `${databaseName}.autoLoadEntities`
        ),
        ssl: sslConfig,
      };
    },
    inject: [ConfigService],
  };
};
