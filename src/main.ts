import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LocalizedExceptionFilter } from './common/filters/localized-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  try {
    console.log('🚀 Starting MyPinjam Credit Backend...');
    console.log('📝 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔌 Port:', process.env.PORT || 4000);
    console.log('🗄️  MongoDB:', process.env.MONGODB_URI ? 'Configured' : 'Not configured');

    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    // Security headers
    app.use(helmet());

    // CORS configuration - fail secure
    const origins = (process.env.FRONTEND_ORIGIN ?? '').split(',').map((value) => value.trim()).filter(Boolean);

    if (origins.length === 0) {
      console.warn('⚠️  WARNING: FRONTEND_ORIGIN not set. CORS will be restrictive in production.');
    } else {
      console.log('✅ CORS Origins configured:', origins);
    }

    app.enableCors({
      origin: origins.length > 0 ? origins : (process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']),
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true, // Reject requests with extra fields
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidUnknownValues: false, // Allow unknown values to pass through
        stopAtFirstError: false
      })
    );

    app.useGlobalFilters(new LocalizedExceptionFilter());

    const port = Number(process.env.PORT ?? 4000);
    await app.listen(port);

    console.log(`✅ Application is running on: http://localhost:${port}`);
    console.log(`✅ API endpoints available at: http://localhost:${port}/api`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  console.error('❌ Unhandled error during bootstrap:', error);
  process.exit(1);
});

