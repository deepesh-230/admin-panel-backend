import { PaymentPurpose, PaymentStatus, PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATALOG,
  ROLE_DESCRIPTIONS,
} from '../src/permissions/permission-registry';

const prisma = new PrismaClient();

const PERMISSIONS = PERMISSION_CATALOG.map(({ code, description }) => ({ code, description }));

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
  const permissionByCode = new Map(allPermissions.map((p) => [p.code, p]));

  const roles = (Object.values(RoleName) as RoleName[]).map((name) => ({
    name,
    description: ROLE_DESCRIPTIONS[name],
    permissionCodes: DEFAULT_ROLE_PERMISSIONS[name] || [],
  }));

  for (const roleDef of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description },
    });

    const existingCount = await prisma.rolePermission.count({ where: { roleId: role.id } });
    const shouldSync =
      roleDef.name === RoleName.ADMIN || existingCount === 0;

    if (!shouldSync) {
      // Preserve Central Admin customizations for non-ADMIN roles.
      continue;
    }

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    const codes =
      roleDef.name === RoleName.ADMIN
        ? allPermissions.map((p) => p.code)
        : roleDef.permissionCodes;

    const permissionIds = codes
      .map((code) => permissionByCode.get(code)?.id)
      .filter(Boolean) as string[];

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
      type: 'CARE' as const,
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
      type: 'SERVICE' as const,
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
        type: cat.type ?? 'SERVICE',
      },
      create: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
        slug: slugify(cat.name),
        type: cat.type ?? 'SERVICE',
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
    { id: '1', sNo: 1, kind: 'USER', category: 'Physiotherapy', subCategory: 'Neurological Physiotherapy', product: 'Swaha Allergy Asthma Hospital', name: 'Vivek', email: 'vivektest@gmail.com', date: '02 Aug 2026 00:00', createdBy: 'Vivek' },
    { id: '2', sNo: 2, kind: 'USER', category: 'Physiotherapy', subCategory: 'Neurological Physiotherapy', product: 'Gowds Dental Hospital', name: null, email: 'test@gmail.com', date: '29 Jul 2026 00:00', createdBy: 'N/A' },
    { id: '3', sNo: 3, kind: 'USER', category: 'N/A', subCategory: 'N/A', product: 'International Drug Discovery & Clinical Research', name: 'Abdul Rahman', email: 'rahmansmiles@gmail.com', date: '25 Mar 2026 00:00', createdBy: 'Abdul Rahman' },
    { id: '4', sNo: 4, kind: 'PROVIDER', category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Vivek', email: 'vivekanand.p@gmail.com', date: '24 Mar 2026 00:00', createdBy: 'Vivek' },
    { id: '5', sNo: 5, kind: 'PROVIDER', category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Rayan Sahil Mohammad', email: 'rayansmiles07@gmail.com', date: '21 Mar 2026 00:00', createdBy: 'Rayan Sahil Mohammad' },
    { id: '6', sNo: 6, kind: 'PROVIDER', category: 'N/A', subCategory: 'N/A', product: 'N/A', name: 'Abdul Rahman', email: 'rahmansmiles@gmail.com', date: '18 Mar 2026 00:00', createdBy: 'Abdul Rahman' },
    { id: '7', sNo: 7, kind: 'PROVIDER', category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Rayan Sahil Mohammad', email: 'rayansmiles07@gmail.com', date: '16 Mar 2026 00:00', createdBy: 'Rayan Sahil Mohammad' },
    { id: '8', sNo: 8, kind: 'VOLUNTEER', category: 'Volunteer', subCategory: 'Community support', product: 'Weekend mobility camp', name: 'Priya Sharma', email: 'priya.sharma@example.com', date: '01 Sep 2026 00:00', createdBy: 'Priya Sharma' },
    { id: '9', sNo: 9, kind: 'STATE_ADMIN', category: 'State admin', subCategory: 'Onboarding', product: 'Karnataka district rollout', name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', date: '28 Aug 2026 00:00', createdBy: 'Rajesh Kumar' },
    { id: '10', sNo: 10, kind: 'PRODUCT', category: 'Marketplace', subCategory: 'Sale', product: 'Lightweight wheelchair', name: 'Anita Desai', email: 'anita.desai@example.com', date: '30 Aug 2026 00:00', createdBy: 'Anita Desai' },
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
      update: { kind: eq.kind, stateId: defaultState.id, status: 'NEW' },
      create: { ...eq, stateId: defaultState.id, status: 'NEW' },
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

  const mobilityProvider = await prisma.serviceProvider.findFirst({
    where: { name: 'Hyderabad Mobility Care Centre' },
  });
  if (mobilityProvider) {
    await prisma.enquiry.updateMany({
      where: { kind: 'PROVIDER' },
      data: { providerId: mobilityProvider.id, stateId: defaultState.id },
    });
  }

  const cmsPages = [
    {
      slug: 'about',
      title: 'About Us',
      content:
        'Divyaang Disha connects persons with disabilities to verified service providers, resources, and community support across India.',
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content:
        'We collect only the information needed to operate your account and improve our services. We do not sell your personal data.',
    },
    {
      slug: 'terms',
      title: 'Terms and Conditions',
      content:
        'By using Divyaang Disha you agree to use the platform respectfully and to provide accurate information in listings and enquiries.',
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: { title: page.title, content: page.content, isActive: true },
      create: { ...page, isActive: true },
    });
  }

  await prisma.faq.upsert({
    where: { id: 'seed-faq-1' },
    update: {
      title: 'Is the app free to use?',
      slug: 'is-the-app-free-to-use',
      description: '<p>Yes. <strong>Divyaang Disha</strong> is free for users to browse providers and content.</p>',
      isActive: true,
    },
    create: {
      id: 'seed-faq-1',
      title: 'Is the app free to use?',
      slug: 'is-the-app-free-to-use',
      description: '<p>Yes. <strong>Divyaang Disha</strong> is free for users to browse providers and content.</p>',
      isActive: true,
    },
  });

  await prisma.blog.upsert({
    where: { id: 'seed-blog-1' },
    update: {
      title: 'Welcome to Divyaang Disha',
      shortDescription: 'Our mobile app is now connected to the live platform.',
      description: 'Browse approved providers, read announcements, and manage your profile from the app.',
      isActive: true,
    },
    create: {
      id: 'seed-blog-1',
      title: 'Welcome to Divyaang Disha',
      shortDescription: 'Our mobile app is now connected to the live platform.',
      description: 'Browse approved providers, read announcements, and manage your profile from the app.',
      isActive: true,
    },
  });

  await prisma.jobAlert.upsert({
    where: { id: 'seed-job-1' },
    update: {
      title: 'Inclusive hiring drive',
      description: 'Several partner organisations are hiring across Telangana this month.',
      postDate: '01 Sep 2026',
      lastDate: '30 Sep 2026',
      isActive: true,
    },
    create: {
      id: 'seed-job-1',
      title: 'Inclusive hiring drive',
      description: 'Several partner organisations are hiring across Telangana this month.',
      postDate: '01 Sep 2026',
      lastDate: '30 Sep 2026',
      isActive: true,
    },
  });

  await prisma.usefulLink.upsert({
    where: { id: 'seed-link-1' },
    update: {
      title: 'Swavlamban Card',
      url: 'https://swavlambancard.gov.in',
      isActive: true,
    },
    create: {
      id: 'seed-link-1',
      title: 'Swavlamban Card',
      url: 'https://swavlambancard.gov.in',
      isActive: true,
    },
  });

  await prisma.suggestion.upsert({
    where: { id: 'seed-suggestion-1' },
    update: {
      title: 'Need hospitals details in my area',
      description: 'Please add more hospital listings with wheelchair access near Secunderabad.',
      receivedFrom: 'Abdul Rahman',
      status: 'OPEN',
      isActive: true,
    },
    create: {
      id: 'seed-suggestion-1',
      title: 'Need hospitals details in my area',
      description: 'Please add more hospital listings with wheelchair access near Secunderabad.',
      receivedFrom: 'Abdul Rahman',
      status: 'OPEN',
      isActive: true,
    },
  });

  await prisma.suggestion.upsert({
    where: { id: 'seed-suggestion-2' },
    update: {
      title: 'App feedback on notifications',
      description: 'Job alert notifications are helpful. Could we get reminders before the last date?',
      receivedFrom: 'VS RAMAKRISHNA P',
      status: 'CLOSED',
      isActive: true,
    },
    create: {
      id: 'seed-suggestion-2',
      title: 'App feedback on notifications',
      description: 'Job alert notifications are helpful. Could we get reminders before the last date?',
      receivedFrom: 'VS RAMAKRISHNA P',
      status: 'CLOSED',
      isActive: true,
    },
  });

  await prisma.marketplaceProduct.upsert({
    where: { id: 'seed-mp-1' },
    update: {
      name: 'Lightweight wheelchair',
      actualPrice: '18000',
      offerPrice: '14999',
      phone: '9876543210',
      listingIntent: 'sell',
      address: 'Hyderabad',
      color: 'Black',
      brand: 'EasyMove',
      features: 'Foldable, 12 kg',
      description: 'Gently used wheelchair in excellent condition.',
      gallery: ['https://images.unsplash.com/photo-1576765608535-5f04d1e3b4a3?q=80&w=800&auto=format&fit=crop'],
      isActive: true,
    },
    create: {
      id: 'seed-mp-1',
      name: 'Lightweight wheelchair',
      actualPrice: '18000',
      offerPrice: '14999',
      phone: '9876543210',
      listingIntent: 'sell',
      address: 'Hyderabad',
      color: 'Black',
      brand: 'EasyMove',
      features: 'Foldable, 12 kg',
      description: 'Gently used wheelchair in excellent condition.',
      gallery: ['https://images.unsplash.com/photo-1576765608535-5f04d1e3b4a3?q=80&w=800&auto=format&fit=crop'],
      isActive: true,
    },
  });

  await prisma.marketplaceProduct.upsert({
    where: { id: 'seed-mp-2' },
    update: {
      name: 'Digital hearing aid',
      actualPrice: '25000',
      offerPrice: '21000',
      phone: '9123456780',
      listingIntent: 'buy',
      address: 'Secunderabad',
      color: 'Beige',
      brand: 'HearPlus',
      features: 'Rechargeable, noise reduction',
      description: 'Looking to buy a mid-range hearing aid.',
      gallery: ['https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=800&auto=format&fit=crop'],
      isActive: true,
    },
    create: {
      id: 'seed-mp-2',
      name: 'Digital hearing aid',
      actualPrice: '25000',
      offerPrice: '21000',
      phone: '9123456780',
      listingIntent: 'buy',
      address: 'Secunderabad',
      color: 'Beige',
      brand: 'HearPlus',
      features: 'Rechargeable, noise reduction',
      description: 'Looking to buy a mid-range hearing aid.',
      gallery: ['https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=800&auto=format&fit=crop'],
      isActive: true,
    },
  });

  await prisma.payment.upsert({
    where: { id: 'seed-pay-1' },
    update: {
      payerName: 'Ravi Kumar',
      payerEmail: 'ravi@example.com',
      payerPhone: '9876500001',
      amount: 499,
      status: PaymentStatus.SUCCESS,
      purpose: PaymentPurpose.SPONSORSHIP,
      planId: 'gold',
      gateway: 'razorpay',
      orderId: 'order_seed_gold_1',
      paymentId: 'pay_seed_gold_1',
      referenceNo: 'SPN-GOLD-001',
      paidAt: new Date('2026-08-15T10:30:00Z'),
    },
    create: {
      id: 'seed-pay-1',
      payerName: 'Ravi Kumar',
      payerEmail: 'ravi@example.com',
      payerPhone: '9876500001',
      amount: 499,
      status: PaymentStatus.SUCCESS,
      purpose: PaymentPurpose.SPONSORSHIP,
      planId: 'gold',
      gateway: 'razorpay',
      orderId: 'order_seed_gold_1',
      paymentId: 'pay_seed_gold_1',
      referenceNo: 'SPN-GOLD-001',
      paidAt: new Date('2026-08-15T10:30:00Z'),
    },
  });

  await prisma.payment.upsert({
    where: { id: 'seed-pay-2' },
    update: {
      payerName: 'Priya Sharma',
      payerEmail: 'priya@example.com',
      payerPhone: '9876500002',
      amount: 199,
      status: PaymentStatus.PENDING,
      purpose: PaymentPurpose.SPONSORSHIP,
      planId: 'silver',
      gateway: 'razorpay',
      orderId: 'order_seed_silver_1',
      referenceNo: 'SPN-SILVER-002',
    },
    create: {
      id: 'seed-pay-2',
      payerName: 'Priya Sharma',
      payerEmail: 'priya@example.com',
      payerPhone: '9876500002',
      amount: 199,
      status: PaymentStatus.PENDING,
      purpose: PaymentPurpose.SPONSORSHIP,
      planId: 'silver',
      gateway: 'razorpay',
      orderId: 'order_seed_silver_1',
      referenceNo: 'SPN-SILVER-002',
    },
  });

  await prisma.payment.upsert({
    where: { id: 'seed-pay-3' },
    update: {
      payerName: 'Anonymous donor',
      amount: 1000,
      status: PaymentStatus.SUCCESS,
      purpose: PaymentPurpose.DONATION,
      gateway: 'manual',
      referenceNo: 'DON-003',
      notes: 'Offline bank transfer',
      paidAt: new Date('2026-08-20T14:00:00Z'),
    },
    create: {
      id: 'seed-pay-3',
      payerName: 'Anonymous donor',
      amount: 1000,
      status: PaymentStatus.SUCCESS,
      purpose: PaymentPurpose.DONATION,
      gateway: 'manual',
      referenceNo: 'DON-003',
      notes: 'Offline bank transfer',
      paidAt: new Date('2026-08-20T14:00:00Z'),
    },
  });

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
