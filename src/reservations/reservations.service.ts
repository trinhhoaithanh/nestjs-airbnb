import { responseArray, responseObject } from './../util/response-template';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { getUserInfoFromToken } from 'src/util/decoded-token';

@Injectable()
export class ReservationsService {
  prisma = new PrismaClient();
  constructor(private jwtService: JwtService) { }

  // Get reservations
  async getReservation() {
    try {
      const reservations = await this.prisma.reservations.findMany(); 
      return responseArray(200, 'Get all reservations successfully!', reservations.length, reservations); 
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Create reservation
  async createReservation(token, reservation) {
    try {
      const { userId } = await getUserInfoFromToken(this.jwtService, token);

      let { room_id, guest_amount } = reservation;

      let newReservation = {
        room_id,
        start_date: new Date(),
        end_date: new Date(),
        guest_amount,
        user_id: userId
      };

      // Check userId from token if exists 
      let checkUser = await this.prisma.users.findUnique({
        where: {
          user_id: userId
        }
      });

      if (checkUser) {
        let findRoom = await this.prisma.rooms.findUnique({
          where: {
            room_id
          }
        });

        if (findRoom) {
          let bookRoom = await this.prisma.reservations.create({
            data: newReservation
          });
          return responseObject(201, "Book room successfully!", bookRoom);
        } else {
          throw new NotFoundException(responseObject(404, "Request is invalid", "Room not found!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "User doesn't exist!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Get reservation by reservation_id
  async getReservationById(reservationId) {
    try {
      let checkReservation = await this.prisma.reservations.findUnique({
        where: {
          reservation_id: reservationId,
        },
      });

      if (checkReservation) {
        return responseObject(200, 'Get reservation successfully!', checkReservation); 
      } else {
        throw new NotFoundException(responseObject(404, 'Request is invalid', "Reservation not found!")); 
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Get reservation by user_id
  async getReservationByUserId(userId) {
    try {
      let checkUser = await this.prisma.users.findUnique({
        where: {
          user_id: userId
        }
      })

      if (checkUser) {
        let checkReservation = await this.prisma.reservations.findMany({
          where: {
            user_id: userId,
          },
        });

        if (checkReservation.length > 0) {
          return responseArray(200, "Get reservations successfully!", checkReservation.length, checkReservation); 
        } else {
          return responseObject(200, "This user hasn't booked any room yet!", checkReservation); 
        }
      }
      else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "User not found"))
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Update reservation
  async updateReservation(reservationId, token, reservationUpdate) {
    try {
      const { userId } = await getUserInfoFromToken(this.jwtService, token);

      const { room_id, start_date, end_date, guest_amount } = reservationUpdate;

      let newData = {
        room_id,
        start_date,
        end_date,
        guest_amount,
      };

      let checkReservation = await this.prisma.reservations.findUnique({
        where: {
          reservation_id: reservationId,
        },
      });

      // Check if reservationId exists
      if (checkReservation) {
        if (userId === checkReservation.user_id) {
          let checkRoom = await this.prisma.rooms.findUnique({
            where: {
              room_id
            }
          });

          if (checkRoom) {
            const update = await this.prisma.reservations.update({
              where: {
                reservation_id: reservationId
              },
              data: newData
            });

            return responseObject(200, "Update reservation successfully!", update);
          } else {
            throw new NotFoundException(responseObject(404, "Request is invalid", "Room not found"))
          }
        } else {
          throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!")); 
        }
      } else {
        throw new NotFoundException(responseObject(404, 'Request is invalid', "Reservation not found!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Delete reservation by reservation_id
  async deleteReservation(reservationId, token) {
    const { userId } = await getUserInfoFromToken(this.jwtService, token);

    // Check if reservationId exists 
    let checkReservation = await this.prisma.reservations.findUnique({
      where: {
        reservation_id: reservationId,
      },
    });

    if (checkReservation) {
      if (userId === checkReservation.user_id) {
        await this.prisma.reservations.delete({
          where: {
            reservation_id: reservationId,
          },
        });

        return responseObject(200, "Delete reservation successfully!", null);
      } else {
        throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
      }
    } else {
      throw new NotFoundException(responseObject(404, "Request is invalid", "Reservation not found!"));
    }
  }
}
