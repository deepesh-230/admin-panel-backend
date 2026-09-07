import { Controller, Get, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AutocompleteQueryDto, DetailsQueryDto } from './dto/places-query.dto';
import { PlacesService } from './places.service';

@Controller('places')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.SERVICE_PROVIDER_ADMIN)
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('autocomplete')
  autocomplete(@Query() query: AutocompleteQueryDto) {
    return this.placesService.autocomplete(query.q);
  }

  @Get('details')
  details(@Query() query: DetailsQueryDto) {
    return this.placesService.details(query.placeId, query.fallback);
  }
}
