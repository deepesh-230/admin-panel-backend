import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const enquiriesData = [
    { id: '1', sNo: 1, category: 'Physiotherapy', subCategory: 'Neurological Physiotherapy', product: 'Swaha Allergy Asthma Hospital', name: 'Vivek', email: 'vivektest@gmail.com', date: '02 Aug 2026 00:00', createdBy: 'Vivek' },
    { id: '2', sNo: 2, category: 'Physiotherapy', subCategory: 'Neurological Physiotherapy', product: 'Gowds Dental Hospital', name: null, email: 'test@gmail.com', date: '29 Jul 2026 00:00', createdBy: 'N/A' },
    { id: '3', sNo: 3, category: 'N/A', subCategory: 'N/A', product: 'International Drug Discovery & Clinical Research', name: 'Abdul Rahman', email: 'rahmansmiles@gmail.com', date: '25 Mar 2026 00:00', createdBy: 'Abdul Rahman' },
    { id: '4', sNo: 4, category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Vivek', email: 'vivekanand.p@gmail.com', date: '24 Mar 2026 00:00', createdBy: 'Vivek' },
    { id: '5', sNo: 5, category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Rayan Sahil Mohammad', email: 'rayansmiles07@gmail.com', date: '21 Mar 2026 00:00', createdBy: 'Rayan Sahil Mohammad' },
    { id: '6', sNo: 6, category: 'N/A', subCategory: 'N/A', product: 'N/A', name: 'Abdul Rahman', email: 'rahmansmiles@gmail.com', date: '18 Mar 2026 00:00', createdBy: 'Abdul Rahman' },
    { id: '7', sNo: 7, category: 'N/A', subCategory: 'N/A', product: "Preety's Top Liner Beauty Clinic & Nails Studio", name: 'Rayan Sahil Mohammad', email: 'rayansmiles07@gmail.com', date: '16 Mar 2026 00:00', createdBy: 'Rayan Sahil Mohammad' }
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
    }
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

  console.log('Seeding finished.');
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
