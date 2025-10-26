import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/mypinjam',
      {
        retryWrites: true,
        w: 'majority',
      }
    ),
  ],
  exports: [MongooseModule],
})
export class MongoDbModule {}
