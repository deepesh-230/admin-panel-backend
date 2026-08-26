import { Module } from '@nestjs/common';
import { VolunteerAdminsController } from './volunteer-admins.controller';
import { VolunteerAdminsService } from './volunteer-admins.service';

@Module({
  controllers: [VolunteerAdminsController],
  providers: [VolunteerAdminsService],
})
export class VolunteerAdminsModule {}
