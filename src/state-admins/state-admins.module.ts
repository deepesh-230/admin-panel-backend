import { Module } from '@nestjs/common';
import { StateAdminsController } from './state-admins.controller';
import { StateAdminsService } from './state-admins.service';

@Module({
  controllers: [StateAdminsController],
  providers: [StateAdminsService],
})
export class StateAdminsModule {}
