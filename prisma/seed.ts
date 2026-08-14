import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: 'dashboard.read', description: 'View dashboard statistics' },
  { code: 'users.read', description: 'View users' },
  { code: 'users.write', description: 'Manage users' },
  { code: 'listings.read', description: 'View listings' },
  { code: 'listings.write', description: 'Manage listings' },
  { code: 'enquiries.read', description: 'View enquiries' },
  { code: 'enquiries.write', description: 'Manage enquiries' },
  { code: 'providers.read', description: 'View service providers' },
  { code: 'providers.write', description: 'Manage service providers' },
  { code: 'settings.write', description: 'Manage settings' },
  { code: 'states.read', description: 'View states' },
  { code: 'states.write', description: 'Manage states' },
  { code: 'state_admins.read', description: 'View state admins' },
  { code: 'state_admins.write', description: 'Manage state admins' },
  { code: 'categories.read', description: 'View categories, subcategories, and keywords' },
  { code: 'categories.write', description: 'Manage categories, subcategories, and keywords' },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  const roles: { name: RoleName; description: string; permissionCodes: string[] }[] = [
    {
      name: RoleName.ADMIN,
      description: 'Main platform administrator',
      permissionCodes: allPermissions.map((p) => p.code),
    },
    {
      name: RoleName.STATE_ADMIN,
      description: 'State-scoped administrator',
      permissionCodes: [
        'dashboard.read',
        'users.read',
        'users.write',
        'listings.read',
        'listings.write',
        'enquiries.read',
        'enquiries.write',
        'providers.read',
        'providers.write',
        'states.read',
        'state_admins.read',
        'categories.read',
        'categories.write',
      ],
    },
    {
      name: RoleName.END_USER,
      description: 'Mobile end user',
      permissionCodes: [],
    },
    {
      name: RoleName.SERVICE_PROVIDER_ADMIN,
      description: 'Service provider administrator',
      permissionCodes: ['enquiries.read', 'enquiries.write', 'providers.read'],
    },
  ];

  for (const roleDef of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    const permissionIds = allPermissions
      .filter((p) => roleDef.permissionCodes.includes(p.code))
      .map((p) => p.id);

    if (permissionIds.length) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.ADMIN } });
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const defaultState = await prisma.state.upsert({
    where: { name: 'Telangana' },
    update: { code: 'TS', isActive: true },
    create: { name: 'Telangana', code: 'TS', isActive: true },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@divyaangdisha.com' },
    update: {
      passwordHash,
      name: 'Administrator',
      isActive: true,
      roleId: adminRole.id,
      stateId: defaultState.id,
    },
    create: {
      email: 'admin@divyaangdisha.com',
      passwordHash,
      name: 'Administrator',
      isActive: true,
      roleId: adminRole.id,
      stateId: defaultState.id,
    },
  });

  await prisma.userState.upsert({
    where: {
      userId_stateId: {
        userId: adminUser.id,
        stateId: defaultState.id,
      },
    },
    update: { isPrimary: true },
    create: {
      userId: adminUser.id,
      stateId: defaultState.id,
      isPrimary: true,
    },
  });

  const sampleCategories = [
    {
      name: 'Physical Disabilities',
      description: 'Services and aids related to physical disabilities',
      sortOrder: 1,
      subcategories: [
        {
          name: 'Mobility Aids',
          description: 'Wheelchairs, crutches, and related mobility support',
          keywords: ['wheelchair', 'crutches'],
        },
      ],
    },
    {
      name: 'Sensory Disabilities',
      description: 'Services and aids related to sensory disabilities',
      sortOrder: 2,
      subcategories: [
        {
          name: 'Vision Support',
          description: 'Braille, screen readers, and vision assistance',
          keywords: ['braille', 'screen reader'],
        },
      ],
    },
  ];

  for (const cat of sampleCategories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
        slug: slugify(cat.name),
      },
      create: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
        slug: slugify(cat.name),
      },
    });

    for (const sub of cat.subcategories) {
      const subcategory = await prisma.subcategory.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: sub.name,
          },
        },
        update: {
          description: sub.description,
          isActive: true,
          slug: slugify(sub.name),
        },
        create: {
          categoryId: category.id,
          name: sub.name,
          description: sub.description,
          isActive: true,
          slug: slugify(sub.name),
        },
      });

      for (const term of sub.keywords) {
        await prisma.keyword.upsert({
          where: {
            subcategoryId_term: {
              subcategoryId: subcategory.id,
              term,
            },
          },
          update: { isActive: true },
          create: {
            subcategoryId: subcategory.id,
            term,
            isActive: true,
          },
        });
      }
    }
  }

  const enquiriesData = [
    { id: '1', sNo: 1, category: 'Physiotherapy', subCategory: 'Neurological Physiotherapy', product: 'Swaha Allergy Asthma Hospital', name: 'Vivek', email: 'vivektest@gmail.com', date: '02 Aug 2026 00:00', createdBy: 'Vivek' },
    { id: '2', sNo: 2, category: 'Physiotherapy', subCategory: 'Neurological Physiotherapy', product: 'Gowds Dental Hospital', name: null, email: 'test@gmail.com', date: '29 Jul 2026 00:00', createdBy: 'N/A' },
    { id: '3', sNo: 3, category: 'N/A', subCategory: 'N/A', product: 'International Drug Discovery & Clinical Research', name: 'Abdul Rahman', email: 'rahmansmiles@gmail.com', date: '25 Mar 2026 00:00', createdBy: 'Abdul Rahman' },
    { id: '4', sNo: 4, category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Vivek', email: 'vivekanand.p@gmail.com', date: '24 Mar 2026 00:00', createdBy: 'Vivek' },
    { id: '5', sNo: 5, category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Rayan Sahil Mohammad', email: 'rayansmiles07@gmail.com', date: '21 Mar 2026 00:00', createdBy: 'Rayan Sahil Mohammad' },
    { id: '6', sNo: 6, category: 'N/A', subCategory: 'N/A', product: 'N/A', name: 'Abdul Rahman', email: 'rahmansmiles@gmail.com', date: '18 Mar 2026 00:00', createdBy: 'Abdul Rahman' },
    { id: '7', sNo: 7, category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Rayan Sahil Mohammad', email: 'rayansmiles07@gmail.com', date: '16 Mar 2026 00:00', createdBy: 'Rayan Sahil Mohammad' },
  ];

  const listingsData = [
    {
      id: '1',
      sNo: 1,
      category: 'Hospitals',
      subCategory: 'Cancer Centers',
      product: 'Acharya harihar cancel hospital',
      email: 'ahrcc@gmail.com',
      image: 'https://placehold.co/60x30/e2e8f0/64748b',
      createdBy: 'Vivek',
      date: '02-Aug-2026',
      status: false,
    },
  ];

  for (const eq of enquiriesData) {
    await prisma.enquiry.upsert({
      where: { id: eq.id },
      update: {},
      create: eq,
    });
  }

  for (const li of listingsData) {
    await prisma.listing.upsert({
      where: { id: li.id },
      update: {},
      create: li,
    });
  }

  const mobility = await prisma.subcategory.findFirst({
    where: { name: 'Mobility Aids' },
    include: { category: true },
  });

  if (mobility) {
    const existingProvider = await prisma.serviceProvider.findFirst({
      where: { name: 'Hyderabad Mobility Care Centre' },
    });
    if (!existingProvider) {
      await prisma.serviceProvider.create({
        data: {
          name: 'Hyderabad Mobility Care Centre',
          categoryId: mobility.categoryId,
          subcategoryId: mobility.id,
          description: 'Wheelchair fitting, mobility aids, and rehab support',
          phone: '+91 98765 43210',
          email: 'care@mobilityhyderabad.example',
          address: 'Banjara Hills, Road No. 12',
          city: 'Hyderabad',
          stateId: defaultState.id,
          latitude: 17.4126,
          longitude: 78.4485,
          about: 'Trusted mobility support centre for persons with disabilities.',
          services: 'Wheelchair sales, repair, home assessment',
          coverPhotoUrl: 'https://placehold.co/800x400/e2e8f0/64748b',
          isActive: true,
          approvalStatus: 'APPROVED',
          createdById: adminUser.id,
          approvedById: adminUser.id,
          approvedAt: new Date(),
        },
      });
    }

    const pendingProvider = await prisma.serviceProvider.findFirst({
      where: { name: 'Vision Assist Clinic (Pending)' },
    });
    if (!pendingProvider) {
      const vision = await prisma.subcategory.findFirst({ where: { name: 'Vision Support' } });
      await prisma.serviceProvider.create({
        data: {
          name: 'Vision Assist Clinic (Pending)',
          categoryId: vision?.categoryId || mobility.categoryId,
          subcategoryId: vision?.id,
          description: 'Pending approval sample provider',
          phone: '+91 90000 11111',
          email: 'pending@visionassist.example',
          city: 'Warangal',
          stateId: defaultState.id,
          isActive: false,
          approvalStatus: 'PENDING_APPROVAL',
          createdById: adminUser.id,
        },
      });
    }
  }

  console.log('Seeding finished.');
  console.log('Default admin: admin@divyaangdisha.com / Admin@123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
