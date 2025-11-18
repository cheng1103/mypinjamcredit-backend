import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user || !user.isActive) {
      return null;
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // Convert Mongoose document to plain object
    const userObj = user.toObject();
    const { password: _, ...result } = userObj;
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException({ errorKey: 'user_not_found' });
    }
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException({ errorKey: 'invalid_old_password' });
    }
    await this.usersService.updatePassword(userId, newPassword);
    return { message: 'Password changed successfully' };
  }
}
