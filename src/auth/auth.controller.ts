import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger/dist';
import { CreateAuthDto, LoginType } from './dto/create-auth.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  prisma = new PrismaClient();

  // Signup
  @Post('signup')
  signUp(@Body() userSignup: CreateAuthDto) {
    return this.authService.signUp(userSignup);
  }
  
  // Login
  @Post('login')
  login(@Body() userLogin: LoginType) {
    return this.authService.login(userLogin);
  }
}
