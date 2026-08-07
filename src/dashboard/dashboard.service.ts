import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalEnquiries = await this.prisma.enquiry.count();
    const totalListings = await this.prisma.listing.count();
    const activeListings = await this.prisma.listing.count({ where: { status: true } });
    
    // Simulating other stats since we only have Enquiries and Listings models right now
    return {
      totalUsers: 43,
      activeUsers: 32,
      inactiveUsers: 11,
      totalServiceProviders: 531,
      activeServiceProviders: 530,
      inactiveServiceProviders: 1,
      listings: totalListings,
      activeListings: activeListings,
      listEnquiries: totalEnquiries,
      productEnquiries: 10,
    };
  }
}
