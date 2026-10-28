import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { renderSharePage } from './share-page';
import { ShareLinkService } from './share-link.service';

@Controller('product')
@Public()
export class ShareLinkController {
  constructor(private readonly shareLinks: ShareLinkService) {}

  @Get(':id')
  async open(
    @Param('id') id: string,
    @Query('stay') stay: string | undefined,
    @Res() res: Response,
  ) {
    const target = await this.shareLinks.resolve(id);
    res
      .status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .setHeader('Cache-Control', 'no-store')
      .send(renderSharePage(target, stay === '1'));
  }
}
