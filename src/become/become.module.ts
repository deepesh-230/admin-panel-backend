import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import {
  BecomeApplicationsController,
  BecomeQuestionsController,
} from './become.controller';
import { BecomeService } from './become.service';

@Module({
  imports: [PrismaModule],
  controllers: [BecomeQuestionsController, BecomeApplicationsController],
  providers: [BecomeService],
  exports: [BecomeService],
})
export class BecomeModule {}
