import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.END_USER)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.saveImage(file);
  }
}
