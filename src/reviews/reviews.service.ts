import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { Roles } from 'src/enum/roles.enum';
import { getUserInfoFromToken } from 'src/util/decoded-token';
import { responseArray, responseObject } from 'src/util/response-template';

@Injectable()
export class ReviewsService {
  constructor(private jwtService: JwtService) { }

  prisma = new PrismaClient();

  // Get reviews
  async getReviews() {
    try {
      const reviews = await this.prisma.reviews.findMany();
      return responseArray(200, "Get reviews successfully!", reviews.length, reviews); 
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Create review
  async createReview(token, newReview) {
    try {
      const { userId } = await getUserInfoFromToken(this.jwtService, token);

      const { room_id, content, rating } = newReview;

      const newData = {
        room_id,
        user_id: userId,
        review_date: new Date(),
        content,
        rating,
      };

      let checkUser = await this.prisma.users.findUnique({
        where: {
          user_id: userId
        }
      });

      if (checkUser) {
        let checkRoom = await this.prisma.rooms.findUnique({
          where: {
            room_id
          }
        });

        if (checkRoom) {
          let review = await this.prisma.reviews.create({
            data: newData,
          });

          return responseObject(201, "Create review successfully!", review);
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

  // Update review (only user can update his/her own review or admin can update)
  async updateReview(token, reviewId, reviewUpdate) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token);

      let checkReview = await this.prisma.reviews.findUnique({
        where: {
          review_id: reviewId
        }
      });

      if (checkReview) {
        if (userId === checkReview.user_id || userRole === Roles.ADMIN) {
          const { room_id, content, rating } = reviewUpdate;
          let newReview = {
            room_id,
            review_date: new Date(),
            content,
            rating
          };

          let checkRoom = await this.prisma.rooms.findUnique({
            where: {
              room_id
            }
          });

          if (checkRoom) {
            const update = await this.prisma.reviews.update({
              where: {
                review_id: reviewId
              },
              data: newReview
            });
            return responseObject(200, "Update review successfully!", update);
          } else {
            throw new NotFoundException(responseObject(404, "Request is invalid", "Room not found!"));
          }
        } else {
          throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Review not found!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Get reviews by room_id
  async getReviewByRoom(roomId) {
    try {
      let checkRoom = await this.prisma.rooms.findUnique({
        where: {
          room_id: roomId,
        },
      });

      if (checkRoom) {
        let checkRoomInReview = await this.prisma.reviews.findMany({
          where: {
            room_id: roomId
          },
        });

        if (checkRoomInReview.length > 0) {
          let data = await this.prisma.reviews.findMany({
            where: {
              room_id: roomId,
            },
            include: {
              users: true,
              rooms: true,
            },
          });

          let newData = data.map((review) => {
            return {
              review_id: review.review_id,
              user_name: review.users.full_name,
              room_name: review.rooms.room_name,
              content: review.content,
              date: review.review_date,
              rating: review.rating
            }
          });

          return responseArray(200, "Get reviews successfully!", data.length, newData);
        } else {
          return responseObject(200, "This room doesn't have any reviews yet!", checkRoomInReview);
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Room not found!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  //Delete review by review_id
  async deleteReviewByReviewId(reviewId, token) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token);

      let checkReview = await this.prisma.reviews.findUnique({
        where: {
          review_id: reviewId
        }
      });

      if (checkReview) {
        if (userId === checkReview.user_id || userRole === Roles.ADMIN) {
          await this.prisma.reviews.delete({
            where: {
              review_id: reviewId
            }
          });
          return responseObject(200, "Delete review successfully!", null);
        } else {
          throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Review not found!"));
      }
    }
    catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }
}
