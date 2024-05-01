import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { User } from '@prisma/client';
import { hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async save(user: Partial<User>) {
    const candidate = await this.findOne(user.email);
    if (candidate) {
      throw new HttpException(
        'Користувач з такою поштою вжє інсує',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = this.hashPassword(user.password);
    return this.prismaService.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        roles: ['USER'],
      },
    });
  }

  async findOne(idOrEmail) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [
          { id: isNaN(Number(idOrEmail)) ? undefined : Number(idOrEmail) },
          { email: typeof idOrEmail === 'string' ? idOrEmail : undefined },
        ],
      },
    });
  }

  async delete(id: string) {
    const candidate = await this.findOne(id);
    if (!candidate) {
      throw new HttpException(
        'Користувача не знайдено',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      status: HttpStatus.NO_CONTENT,
    };
  }

  private hashPassword(password: string) {
    return hashSync(password, 10);
  }
}