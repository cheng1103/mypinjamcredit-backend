import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mypinjam';
        console.log('🗄️  Connecting to MongoDB...');

        return {
          uri,
          retryWrites: true,
          w: 'majority',
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          tls: true,
          tlsAllowInvalidCertificates: false,
          tlsAllowInvalidHostnames: false,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              console.log('✅ MongoDB connected successfully');
            });
            connection.on('error', (error: Error) => {
              console.error('❌ MongoDB connection error:', error);
            });
            connection.on('disconnected', () => {
              console.warn('⚠️  MongoDB disconnected');
            });
            return connection;
          },
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class MongoDbModule {}
