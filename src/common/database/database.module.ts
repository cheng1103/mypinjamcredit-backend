import { Module, Global } from '@nestjs/common';
import { JsonDbService } from './json-db.service';

@Global()
@Module({
  providers: [JsonDbService],
  exports: [JsonDbService],
})
export class DatabaseModule {}
