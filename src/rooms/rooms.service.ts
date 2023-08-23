import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/enum/roles.enum';
import { responseArray, responseObject } from 'src/util/response-template';
import { getUserInfoFromToken } from 'src/util/decoded-token';

@Injectable()
export class RoomsService {
  prisma = new PrismaClient();
  constructor(private jwtService: JwtService) { }

  // Get rooms
  async getRooms() {
    try {
      let rooms = await this.prisma.rooms.findMany(); 
      return responseArray(200, 'Get all rooms successfully!', rooms.length, rooms); 
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Create room
  // Only admin can create new room
  async createRoom(token, room) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token); 

      const { room_name, client_number, bed_room, bed, bath_room, description, price, washing_machine, iron, tivi, air_conditioner, wifi, kitchen, parking, pool, location_id, image } = room;

      let newRoom = {
        room_name,
        client_number,
        bed_room,
        bed,
        bath_room,
        description,
        price,
        washing_machine,
        iron,
        tivi,
        air_conditioner,
        wifi,
        kitchen,
        parking,
        pool,
        location_id,
        image,
      };

      // Check if user_id from token exists 
      let checkUser = await this.prisma.users.findUnique({
        where: {
          user_id: userId
        }
      });

      if (checkUser) {
        // Check if user_role is admin 
        if (userRole === Roles.ADMIN) {
          // Check if location_id exists in location model before creating new room
          let checkLocation = await this.prisma.location.findUnique({
            where: {
              location_id
            }
          });

          if (checkLocation) {
            let createRoom = await this.prisma.rooms.create({
              data: newRoom
            });
            return responseObject(201, "Create room successfully!", createRoom);
          } else {
            throw new NotFoundException(responseObject(404, "Request is invalid!", "Location not found!"));
          }
        } else {
          throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid!", "User doesn't exist!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Get rooms by search pagination
  async getRoomsByPagination(pageIndex, pageSize, keyword) {
    try {
      const startIndex = (pageIndex - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      let filteredItems = await this.prisma.rooms.findMany({
        where: {
          room_name: {
            contains: keyword,
          },
        },
      });

      if (filteredItems.length > 0) {
        if (keyword) {
          filteredItems = filteredItems.filter((item) =>
            item.room_name.toLowerCase().includes(keyword.toLowerCase()),
          );
        }

        const itemSlice = filteredItems.slice(startIndex, endIndex);

        return responseObject(200, "Get rooms successfully!", {
          pageIndex, 
          pageSize,
          totalRow: filteredItems.length,
          keyword: `Room name LIKE %${keyword}%`,
          data: itemSlice
        })
      }
      else {
        return responseObject(200, "No matching results found!", filteredItems)
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Get room by room_id
  async getRoomById(roomId) {
    try {
      let checkRoom = await this.prisma.rooms.findUnique({
        where: {
          room_id: roomId
        }
      });

      if (checkRoom) {
        return responseObject(200, "Get room successfully!", checkRoom); 
      } else {
        throw new NotFoundException(responseObject(404, 'Request is invalid', "Room not found!")); 
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Get room by location_id
  async getRoomByLocationId(locationId) {
    try {
      // Check if location_id exists 
      let checkLocation = await this.prisma.location.findUnique({
        where: {
          location_id: locationId
        }
      });

      if (checkLocation) {
        let getRooms = await this.prisma.rooms.findMany({
          where: {
            location_id: locationId,
          },
        });

        if (getRooms.length > 0) {
          return responseArray(200, 'Get room by location successfully!', getRooms.length, getRooms);
        } else {
          return responseObject(200, "No rooms at this location!", getRooms);
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Location not found!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Update room by room_id (only admin can update it)
  async updateRoomByRoomId(roomId, token, roomInfo) {
    // try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token);

      let { room_name, client_number, bed_room, bed, bath_room, description, price, washing_machine, iron, tivi, air_conditioner, wifi, kitchen, parking, pool, location_id, image } = roomInfo;

      let newRoom = {
        room_name,
        client_number,
        bed_room,
        bed,
        bath_room,
        description,
        price,
        washing_machine,
        iron,
        tivi,
        air_conditioner,
        wifi,
        kitchen,
        parking,
        pool,
        location_id,
        image,
      };

      // Check if user_id from token exists
      let checkUser = await this.prisma.users.findUnique({
        where: {
          user_id: userId
        }
      });

      if (checkUser) {
        if (userRole === Roles.ADMIN) {
          let checkRoom = await this.prisma.rooms.findUnique({
            where: {
              room_id: roomId
            }
          });
          if (checkRoom) {
            let checkLocation = await this.prisma.location.findUnique({
              where: {
                location_id
              }
            });
            if (checkLocation) {
              const update = await this.prisma.rooms.update({
                where: {
                  room_id: roomId
                },
                data: newRoom
              });
              return responseObject(200, "Update room successfully!", update);
            } else {
              throw new NotFoundException(responseObject(404, "Request is invalid", "Location not found!"));
            }
          } else {
            throw new NotFoundException(responseObject(404, "Request is invalid", "Room not found!"));
          }
        } else {
          throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "User doesn't exist!"));
      }
    // }
    // catch (err) {
    //   throw new HttpException(err.response, err.status);
    // }
  }

  // Delete room by room_id
  async deleteRoomByRoomId(roomId, token) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token);

      // Check if userId from token exists
      let checkUser = await this.prisma.users.findUnique({
        where: {
          user_id: userId
        }
      }); 
      
      if (checkUser) {
        if (userRole === Roles.ADMIN) {
          // Check if roomId exists 
          let checkRoom = await this.prisma.rooms.findUnique({
            where: {
              room_id: roomId
            }
          });
  
          if (checkRoom) {
            // Delete if roomId exists in reservations model as foreign key 
            await this.prisma.reservations.deleteMany({
              where: {
                room_id: roomId
              }
            })
  
            // Delete if roomId exists in reviews model as foreign key
            await this.prisma.reviews.deleteMany({
              where: {
                room_id: roomId
              }
            })
  
            // Delete roomId in rooms model as primary key
            await this.prisma.rooms.delete({
              where: {
                room_id: roomId
              }
            });
  
            return responseObject(200, "Delete room successfully!", null);
          } else {
            throw new NotFoundException(responseObject(404, "Request is invalid", "Room not found!"));
          }
        } else {
          throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, 'Request is invalid', "User doesn't exist!")); 
      }
    }
    catch (err) {
      throw new HttpException(err.response, err.status);
    }

  }

  // Upload room's image
  async uploadRoomImg(roomId, file, token) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token);

      // Check if room_id exists
      let checkRoom = await this.prisma.rooms.findUnique({
        where: {
          room_id: roomId
        }
      });

      if (checkRoom) {
        // Check if userId from token exists
        let checkUser = await this.prisma.users.findUnique({
          where: {
            user_id: userId
          }
        });

        if (checkUser) {
          if (userRole === Roles.ADMIN) {
            let roomInfo = await this.prisma.rooms.update({
              where: {
                room_id: roomId
              },
              data: {
                image: file.filename,
              },
            });

            return responseObject(201, "Upload avatar successfully!", roomInfo);
          } else {
            throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
          }
        } else {
          throw new NotFoundException(responseObject(404, "Request is invalid", "User doesn't exist!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Room not found!"));
      }
    }
    catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

}
