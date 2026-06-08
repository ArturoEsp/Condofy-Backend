import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { UsersModule } from './app/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CondominiumsModule } from './app/condominiums/condominiums.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    CoreModule,
    UsersModule,
    AuthModule,
    CondominiumsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
