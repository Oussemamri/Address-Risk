import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressesModule } from './addresses/addresses.module';
import { Address } from './addresses/entities/address.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('TYPEORM_DATABASE', 'database.sqlite'),
        entities: [Address],
        synchronize: true,
      }),
    }),
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
