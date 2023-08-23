import { ReservationsService } from './reservations.service';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put } from '@nestjs/common';

@ApiTags('Reservations')
@Controller('api/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  // Get reservations
  @Get()
  getReservation() {
    return this.reservationsService.getReservation();
  }

  // Create reservation
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Post()
  createReservation(@Headers('token') token, @Body() reservation: CreateReservationDto) {
    return this.reservationsService.createReservation(token, reservation);
  }

  // Get reservation by reservation_id
  @Get(':id')
  getReservationById(@Param('id') reservationId: number) {
    return this.reservationsService.getReservationById(Number(reservationId));
  }

  // Get reservation by user_id
  @Get('reservation-by-user/:user_id')
  getReservationByUserId(@Param('user_id') userId: number) {
    return this.reservationsService.getReservationByUserId(Number(userId));
  }

  // Update reservation
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Put(':id')
  updateReservation(
    @Param('id') reservationId: number,
    @Headers('token') token,
    @Body() reservationUpdate: UpdateReservationDto,
  ) {
    return this.reservationsService.updateReservation(
      +reservationId,
      token,
      reservationUpdate,
    );
  }

  // Delete reservation by reservation_id
  @ApiHeader({
    name: "token",
    description: "Your authentication token",
    required: true
  })
  @Delete(':id')
  deleteReservation(@Param('id') reservationId: number, @Headers("token") token) {
    return this.reservationsService.deleteReservation(
      Number(reservationId), token
    );
  }
}
