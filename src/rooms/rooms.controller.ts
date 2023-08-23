import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { ApiBody, ApiConsumes, ApiHeader, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateRoomDto } from './dto/create-room.dto';
import { FileUploadDto } from 'src/users/dto/fileUploadDto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Rooms')
@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  // Get rooms
  @Get()
  getRooms() {
    return this.roomsService.getRooms();
  }

  // Create room 
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Post()
  createRoom(@Headers('token') token, @Body() room: CreateRoomDto) {
    return this.roomsService.createRoom(token, room);
  }

  // Get rooms by search pagination
  @Get('pagination')
  getRoomsByPagination(
    @Query('pageIndex') pageIndex: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
  ) {
    return this.roomsService.getRoomsByPagination(pageIndex, pageSize, keyword);
  }

  // Get room by room_id
  @Get(':id')
  getRoomById(@Param('id') roomId: number) {
    return this.roomsService.getRoomById(+roomId);
  }

  // Get room by location_id
  @Get('rooms-by-location')
  getRoomByLocationId(@Query('location_id') locationId: number) {
    return this.roomsService.getRoomByLocationId(Number(locationId));
  }

  // Update room by room_id (only admin can update it)
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @ApiParam({
    name: 'id'
  })
  @Put(':id')
  updateRoomByRoomId(
    @Param('id') roomId, 
    @Headers('token') token, 
    @Body() roomInfo: UpdateRoomDto
  ) {
    return this.roomsService.updateRoomByRoomId(Number(roomId), token, roomInfo)
  }

  // Delete room by room id
  @ApiParam({
    name: 'id',
    required: true
  })
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Delete(':id')
  deleteRoomByRoomId(@Param('id') roomId: number, @Headers('token') token) {
    return this.roomsService.deleteRoomByRoomId(Number(roomId), token)
  }

  // Upload room's image
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.cwd() + '/public/img',
        filename: (req, file, callback) => {
          callback(null, new Date().getTime() + file.originalname);
        },
      }),
    }),
  )
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @ApiQuery({ name: 'room_id' })
  @Post('upload-room-image')
  uploadAvatar(
    @Query('room_id') roomId: number,
    @UploadedFile() file: Express.Multer.File,
    @Headers('token') token,
  ) {
    return this.roomsService.uploadRoomImg(+roomId, file, token);
  }
}
