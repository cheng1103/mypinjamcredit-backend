import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { UserRole } from '../../common/enums';
import { JsonDbService } from '../../common/database/json-db.service';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly collectionName = 'users';
  private users: User[] = [];

  constructor(private readonly db: JsonDbService) {}

  async onModuleInit() {
    // Load existing users from database
    this.users = await this.db.findAll<User>(this.collectionName);
    console.log(`✅ Loaded ${this.users.length} users from database`);

    // Create default super admin if no users exist
    if (this.users.length === 0) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const superAdmin: User = {
        id: randomUUID(),
        username: 'superadmin',
        email: 'admin@mypinjamcredit.com',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.users.push(superAdmin);
      await this.saveUsers();

      console.log('✅ Super admin created:');
      console.log('   Username: superadmin');
      if (process.env.NODE_ENV !== 'production') {
        console.log('   Password:', defaultPassword);
      }
      console.log('   Email: admin@mypinjamcredit.com');
      console.log('   ⚠️  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN!');
    }
  }

  private async saveUsers() {
    await this.db.write(this.collectionName, this.users);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username === username);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async create(userData: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    // 检查用户名是否已存在
    if (await this.findByUsername(userData.username)) {
      throw new BadRequestException({ errorKey: 'username_exists' });
    }

    // 检查邮箱是否已存在
    if (await this.findByEmail(userData.email)) {
      throw new BadRequestException({ errorKey: 'email_exists' });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user: User = {
      id: randomUUID(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    await this.saveUsers();
    return user;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new NotFoundException({ errorKey: 'user_not_found' });
    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    await this.saveUsers();
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.users.map(({ password, ...user }) => user);
  }

  async deactivate(userId: string): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new NotFoundException({ errorKey: 'user_not_found' });
    user.isActive = false;
    user.updatedAt = new Date();
    await this.saveUsers();
  }

  async activate(userId: string): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new NotFoundException({ errorKey: 'user_not_found' });
    user.isActive = true;
    user.updatedAt = new Date();
    await this.saveUsers();
  }

  async updateRole(userId: string, newRole: UserRole): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new NotFoundException({ errorKey: 'user_not_found' });
    user.role = newRole;
    user.updatedAt = new Date();
    await this.saveUsers();
  }
}
