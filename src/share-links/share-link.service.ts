import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ShareTarget = {
  id: string;
  kind: 'provider' | 'sale' | 'unknown';
  name: string;
};

@Injectable()
export class ShareLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(id: string): Promise<ShareTarget> {
    if (!ID_PATTERN.test(id)) {
      return { id, kind: 'unknown', name: '' };
    }
    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id },
      select: { name: true },
    });
    if (provider) {
      return { id, kind: 'provider', name: provider.name };
    }
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id },
      select: { name: true },
    });
    if (product) {
      return { id, kind: 'sale', name: product.name };
    }
    return { id, kind: 'unknown', name: '' };
  }
}
