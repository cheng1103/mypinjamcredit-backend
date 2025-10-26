import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../../common/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Super admin only - create new users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  // Super admin only - view all users
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Super admin only - view single user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  // Super admin only - deactivate user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    await this.usersService.deactivate(id);
    return { message: 'User deactivated successfully' };
  }

  // Super admin only - activate user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    await this.usersService.activate(id);
    return { message: 'User activated successfully' };
  }

  // Super admin only - change user role
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    await this.usersService.updateRole(id, role);
    return { message: 'User role updated successfully' };
  }
}
