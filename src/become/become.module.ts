import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PushModule } from '../push/push.module';
import {
  BecomeApplicationsController,
  BecomeQuestionsController,
} from './become.controller';
import { BecomeService } from './become.service';

@Module({
  imports: [PrismaModule, PushModule],
  controllers: [BecomeQuestionsController, BecomeApplicationsController],
  providers: [BecomeService],
  exports: [BecomeService],
})
export class BecomeModule {}
