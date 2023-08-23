import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { LocationService } from './location.service';
import { ApiBody, ApiConsumes, ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileUploadLocationDto } from './dto/file-upload.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@ApiTags('Location')
@Controller('api/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  // Get locations
  @Get()
  getLocations() {
    return this.locationService.getLocations();
  }

  // Create location
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Post()
  createLocation(
    @Headers('token') token, 
    @Body() location: CreateLocationDto
  ) {
    return this.locationService.createLocation(token, location);
  }

  // Get location by location_id
  @ApiParam({ name: 'id' })
  @Get(":id")
  getLocationByLocationId(@Param('id') locationId) {
    return this.locationService.getLocationByLocationId(Number(locationId))
  }

  // Update location by location_id
  @ApiHeader({
    name: "token",
    description: "Your authentication token",
    required: true
  })
  @Put(":id")
  updateLocation(
    @Headers("token") token,
    @Param("id") locationId: number,
    @Body() updateLocation: UpdateLocationDto
  ) {
    return this.locationService.updateLocation(token, +locationId, updateLocation);
  }

  // Pagination of location
  @Get('pagination')
  getLocationPagination(
    @Query('pageIndex') pageIndex: number, 
    @Query('pageSize') pageSize: number, 
    @Query('keyword') keyWord: string
  ) {
    return this.locationService.getLocationPagination(pageIndex, pageSize, keyWord)
  }

  // Upload image for location
  @ApiHeader({
    name: "token",
    description: "Your authentication token",
    required: true
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: FileUploadLocationDto })
  @UseInterceptors(FileInterceptor("file", {
    storage: diskStorage({
      destination: process.cwd() + "/public/img",
      filename: (req, file, callback) => callback(null, new Date().getTime() + file.originalname)
    })
  }))
  @Post("upload-location-image")
  uploadImage(
    @Headers("token") token,
    @Query("id") locationId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.locationService.uploadImage(token, +locationId, file);
  }

  // Delete location
  @ApiHeader({
    name: "token",
    description: "Your authentication token",
    required: true
  })
  @Delete(":id")
  deleteLocation(
    @Headers("token") token,
    @Param("id") locationId: number
  ) {
    return this.locationService.deleteLocation(token, +locationId);
  }
}
