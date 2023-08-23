import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Roles } from 'src/enum/roles.enum';
import { responseObject } from 'src/util/response-template';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  prisma = new PrismaClient();

  // Signup
  async signUp(userSignup) {
    try {
      let { email, pass_word, full_name, birth_day, gender, phone } = userSignup;

      // Check email if exists
      let checkEmail = await this.prisma.users.findFirst({
        where: {
          email,
        }
      });

      if (checkEmail) {
        throw new BadRequestException(responseObject(400, "Request is invalid", "Email already existed!"));
      } else {
        let newUser = {
          email,
          pass_word: bcrypt.hashSync(pass_word, 10),
          full_name,
          birth_day,
          gender,
          user_role: Roles.USER,
          phone,
        };

        await this.prisma.users.create({
          data: newUser,
        });

        return responseObject(200, "Signup successfully!", newUser);
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  // Login
  async login(userLogin) {
    try {
      const { email, pass_word } = userLogin;

      let checkUser = await this.prisma.users.findFirst({
        where: {
          email,
        },
      });

      if (checkUser) {
        if (bcrypt.compareSync(pass_word, checkUser.pass_word)) {
          checkUser = { ...checkUser, pass_word: '' };

          // generate token with user_id and user_role inside 
          let tokenGenerate = await this.jwtService.signAsync(
            { user_id: Number(checkUser.user_id), user_role: checkUser.user_role },
            { secret: this.configService.get('KEY'), expiresIn: '60m' },
          );
          return responseObject(200, "Login successfully!", { userLogin: checkUser, token: tokenGenerate });

        } else {
          throw new BadRequestException(responseObject(400, "Request is invalid", "Password is incorrect!"));
        }
      } else {
        throw new BadRequestException(responseObject(400, "Request is invalid", "Email or password is incorrect!"));
      }
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }
}
