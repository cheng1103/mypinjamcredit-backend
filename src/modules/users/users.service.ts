import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    // Count existing users
    const count = await this.userModel.countDocuments();
    console.log(`✅ Loaded ${count} users from MongoDB`);

    // Create default super admin if no users exist
    if (count === 0) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await this.userModel.create({
        username: 'superadmin',
        email: 'admin@mypinjamcredit.com',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });

      console.log('✅ Super admin created:');
      console.log('   Username: superadmin');
      if (process.env.NODE_ENV !== 'production') {
        console.log('   Password:', defaultPassword);
      }
      console.log('   Email: admin@mypinjamcredit.com');
      console.log('   ⚠️  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN!');
    }
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(userData: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<UserDocument> {
    // Check if username already exists
    if (await this.findByUsername(userData.username)) {
      throw new BadRequestException({ errorKey: 'username_exists' });
    }

    // Check if email already exists
    if (await this.findByEmail(userData.email)) {
      throw new BadRequestException({ errorKey: 'email_exists' });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.userModel.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      isActive: true,
    });

    return user;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException({ errorKey: 'user_not_found' });
    }
  }

  async findAll(): Promise<Omit<UserDocument, 'password'>[]> {
    return this.userModel.find().select('-password').exec();
  }

  async deactivate(userId: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { isActive: false } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException({ errorKey: 'user_not_found' });
    }
  }

  async activate(userId: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { isActive: true } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException({ errorKey: 'user_not_found' });
    }
  }

  async updateRole(userId: string, newRole: UserRole): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { role: newRole } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException({ errorKey: 'user_not_found' });
    }
  }
}
