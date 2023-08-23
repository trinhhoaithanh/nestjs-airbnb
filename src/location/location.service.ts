import { responseArray } from './../util/response-template';
import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/enum/roles.enum';
import { responseObject } from 'src/util/response-template';
import { getUserInfoFromToken } from 'src/util/decoded-token';

@Injectable()
export class LocationService {
  prisma = new PrismaClient();
  constructor(private jwtService: JwtService) { }

  // Get locations
  async getLocations() {
    try {
      const locations = await this.prisma.location.findMany(); 
      return responseArray(200, 'Get locations successfully!', locations.length, locations); 
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Create location
  async createLocation(token, location) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token); 

      let checkUser = await this.prisma.users.findUnique({
        where: {
          user_id: userId
        }
      }); 

      if (checkUser) {
        if (userRole === Roles.ADMIN) {
          const { location_name, province, nation, location_image } = location;

          let newLocation = {
            location_name,
            province,
            nation,
            location_image,
          };

          const create = await this.prisma.location.create({
            data: newLocation,
          });

          return responseObject(201, "Create location successfully!", create);
        } else {
          throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "User doesn't exist!")); 
      } 
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Get location by location_id
  async getLocationByLocationId(locationId) {
    try {
      let checkLocation = await this.prisma.location.findUnique({
        where: {
          location_id: locationId
        }
      })

      if (checkLocation) {
        return responseObject(200, 'Get location successfully!', checkLocation); 
      }
      else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Location not found!")); 
      }
    }
    catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Update location by location_id
  async updateLocation(token, locationId, updateLocation) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token);

      let { location_name, province, nation, location_image } = updateLocation;

      let newLocation = {
        location_name,
        province,
        nation,
        location_image
      };

      // Check if locationId exists 
      let checkLocation = await this.prisma.location.findUnique({
        where: {
          location_id: locationId
        }
      });

      if (checkLocation) {
        // Check if userId from token exists
        let checkUser = await this.prisma.users.findUnique({
          where: {
            user_id: userId
          }
        }); 

        if (checkUser) {
          if (userRole === Roles.ADMIN) {
            const newUpdate = await this.prisma.location.update({
              where: {
                location_id: locationId
              },
              data: newLocation
            });

            return responseObject(200, "Update location successfully!", newUpdate);
          } else {
            throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
          }
        } else {
          throw new NotFoundException(responseObject(404, "Request is invalid", "User doesn't exist!")); 
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Location not found!"));
      }
    }
    catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Get location by pagination
  async getLocationPagination(pageIndex, pageSize, keyword) {
    try {
      const startIndex = (pageIndex - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      let filteredItems = await this.prisma.location.findMany({
        where: {
          location_name: {
            contains: keyword,
          },
        },
      });

      if (filteredItems.length > 0) {
        if (keyword) {
          filteredItems = filteredItems.filter((item) =>
            item.location_name.toLowerCase().includes(keyword.toLowerCase()),
          );
        }

        const itemSlice = filteredItems.slice(startIndex, endIndex);

        return responseObject(200, "Get locations successfully!", {
          pageIndex,
          pageSize,
          totalRow: filteredItems.length,
          keyword: `Location name LIKE $%{keyword}%`,
          data: itemSlice
        });
      } else {
        return responseObject(200, "No matching results found!", filteredItems);
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Upload image for location
  async uploadImage(token, locationId, file) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token);

      // Check if locationId exists 
      let checkLocation = await this.prisma.location.findUnique({
        where: {
          location_id: locationId
        }
      });

      if (checkLocation) {
        // Check if userId from token exists 
        let checkUser = await this.prisma.users.findUnique({
          where: {
            user_id: userId
          }
        }); 

        if (checkUser) {
          if (userRole === Roles.ADMIN) {
            let uploadImg = await this.prisma.location.update({
              where: {
                location_id: locationId
              },
              data: {
                location_image: file.filename
              }
            });
            return responseObject(201, "Upload image successfully!", uploadImg);
          } else {
            throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
          }
        } else {
          throw new NotFoundException(responseObject(404, "Request is invalid", "User doesn't exist!")); 
        } 
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Location not found!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Delete location
  async deleteLocation(token, locationId) {
    try {
      const { userId, userRole } = await getUserInfoFromToken(this.jwtService, token);

      // Check if locationId exists
      let checkLocation = await this.prisma.location.findUnique({
        where: {
          location_id: locationId
        }
      });

      if (checkLocation) {
        // Check if userId from token exists 
        let checkUser = await this.prisma.users.findUnique({
          where: {
            user_id: userId
          }
        });

        if (checkUser) {
          if (userRole === Roles.ADMIN) {
            // Delete locationId if exists in rooms model as foreign key 
            await this.prisma.rooms.deleteMany({
              where: {
                location_id: locationId
              }
            });

            // Delete locationId in location model as primary key
            await this.prisma.location.delete({
              where: {
                location_id: locationId
              }
            });
            return responseObject(200, "Delete location successfully!", null);
          } else {
            throw new ForbiddenException(responseObject(403, "Request is invalid", "You don't have permission to access!"));
          }
        } else {
          throw new NotFoundException(responseObject(404, "Request is invalid", "User doesn't exist!"));
        }
      } else {
        throw new NotFoundException(responseObject(404, "Request is invalid", "Location not found!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

}
