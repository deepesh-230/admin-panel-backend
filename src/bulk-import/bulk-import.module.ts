import { Module } from '@nestjs/common';
import { PlacesModule } from '../places/places.module';
import { BulkImportController } from './bulk-import.controller';
import { BulkImportService } from './bulk-import.service';

@Module({
  imports: [PlacesModule],
  controllers: [BulkImportController],
  providers: [BulkImportService],
})
export class BulkImportModule {}
