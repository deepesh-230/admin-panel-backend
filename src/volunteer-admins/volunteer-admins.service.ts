import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVolunteerAdminDto,
  UpdateVolunteerAdminDto,
} from './dto/volunteer-admin.dto';

const volunteerAdminInclude = {
  role: true,
} as const;

@Injectable()
export class VolunteerAdminsService {
  constructor(private prisma: PrismaService) {}

  private sanitize(user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    role: { id: string; name: RoleName };
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(filters: { search?: string; isActive?: boolean }) {
    const where: {
      role: { name: RoleName };
      isActive?: boolean;
      OR?: Array<Record<string, unknown>>;
    } = {
      role: { name: RoleName.VOLUNTEER },
    };

    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: volunteerAdminInclude,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.sanitize(u));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: { name: RoleName.VOLUNTEER } },
      include: volunteerAdminInclude,
    });
    if (!user) throw new NotFoundException(`Volunteer account with ID ${id} not found`);
    return this.sanitize(user);
  }

  async create(dto: CreateVolunteerAdminDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already registered');

    const role = await this.prisma.role.findUniqueOrThrow({
      where: { name: RoleName.VOLUNTEER },
    });

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        roleId: role.id,
      },
      include: volunteerAdminInclude,
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateVolunteerAdminDto) {
    const existing = await this.prisma.user.findFirst({
      where: { id, role: { name: RoleName.VOLUNTEER } },
    });
    if (!existing) throw new NotFoundException(`Volunteer account with ID ${id} not found`);

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(passwordHash && { passwordHash }),
      },
      include: volunteerAdminInclude,
    });

    return this.sanitize(user);
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findFirst({
      where: { id, role: { name: RoleName.VOLUNTEER } },
    });
    if (!existing) throw new NotFoundException(`Volunteer account with ID ${id} not found`);

    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }
}
