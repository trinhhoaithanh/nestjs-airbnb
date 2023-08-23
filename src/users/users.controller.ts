import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileUploadDto } from './dto/fileUploadDto.dto';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Get users
  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  // Create a user
  @Post()
  createUser(@Body() user: CreateUserDto, @Headers('token') token) {
    return this.usersService.createUser(user,token);
  }

  // Delete user by user_id
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Delete()
  deleteUserById(
    @Query('id') deleteId: number,
    @Headers("token") token
  ) {
    return this.usersService.deleteUserById(+deleteId, token);
  }

  // Pagination of users
  @Get('pagination')
  getUsersByPagination(
    @Query('pageIndex') pageIndex: number,
    @Query('pageSize') pageSize: number,
    @Query('keyword') keyword: string,
  ) {
    return this.usersService.getUsersByPagination(pageIndex, pageSize, keyword);
  }

  // Get user by user_id
  @Get(':id')
  getUserById(@Param('id') userId: number) {
    return this.usersService.getUserById(+userId);
  }

  // Get user by user_name
  @Get('search/:full_name')
  getUserByName(@Param('full_name') userName: string) {
    return this.usersService.getUserByName(userName);
  }

  // Update user
  @ApiHeader({
    name: 'token',
    description: 'Your authentication token',
    required: true,
  })
  @Put('update')
  updateUser(@Headers('token') token, @Body() userUpdate: UpdateUserDto) {
    return this.usersService.updateUser(token, userUpdate);
  }

  // Upload user's avatar
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
  @Post('upload-avatar')
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Headers('token') token,
  ) {
    return this.usersService.uploadAvatar(token, file);
  }
}
