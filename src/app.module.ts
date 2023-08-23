import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config/dist';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { RoomsModule } from './rooms/rooms.module';
import { LocationModule } from './location/location.module';
import { ReservationsModule } from './reservations/reservations.module';
@Module({
  imports: [AuthModule,ConfigModule.forRoot({isGlobal: true}), UsersModule, ReviewsModule, RoomsModule, LocationModule, ReservationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
