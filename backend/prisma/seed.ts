import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding LocalLoop database with real-world data...');

  // 1. Clean existing dummy data (optional depending on use case, but good for pure reset)
  // We'll leave existing users and properties, just UP-SERT to ensure Admin exists.

  // 2. Create Admin Account
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@localloop.com' },
    update: {
      role: 'ADMIN',
      isOnboarded: true,
      welcomeEmailSent: true,
      isVerified: true,
    },
    create: {
      email: 'admin@localloop.com',
      password: hashedAdminPassword,
      name: 'LocalLoop Admin',
      role: 'ADMIN',
      city: 'Pune',
      gender: 'PREFER_NOT_TO_SAY',
      isOnboarded: true,
      welcomeEmailSent: true,
      isVerified: true,
      inviteCode: 'ADMIN-XYZ',
    },
  });
  console.log('✅ Admin Account created: admin@localloop.com / admin123');

  // 3. Create Sample Mentors & Normal Users
  const hashedUserPassword = await bcrypt.hash('password123', 12);

  const mentor1 = await prisma.user.upsert({
    where: { email: 'priya.mentor@localloop.com' },
    update: {},
    create: {
      email: 'priya.mentor@localloop.com',
      password: hashedUserPassword,
      name: 'Priya Kapoor',
      role: 'PROFESSIONAL',
      gender: 'FEMALE',
      city: 'Pune',
      preferredArea: 'Hinjewadi',
      company: 'Infosys',
      isMentor: true,
      isOnboarded: true,
      isVerified: true,
      inviteCode: 'PRIYA-123',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'rahul.student@localloop.com' },
    update: {},
    create: {
      email: 'rahul.student@localloop.com',
      password: hashedUserPassword,
      name: 'Rahul Sharma',
      role: 'STUDENT',
      gender: 'MALE',
      city: 'Pune',
      preferredArea: 'Kothrud',
      university: 'Pune University',
      isOnboarded: true,
      isVerified: true,
      inviteCode: 'RAHUL-123',
    },
  });

  // 4. Create Sample Communities
  const comm1 = await prisma.community.upsert({
    where: { id: 'seed-comm-1' },
    update: {},
    create: {
      id: 'seed-comm-1',
      name: 'Pune Tech Nomads',
      description: 'A community for tech professionals moving to Pune. Share networking events, coworking spaces, and startup news!',
      city: 'Pune',
      type: 'PROFESSIONAL',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
      createdById: admin.id,
    },
  });

  const comm2 = await prisma.community.upsert({
    where: { id: 'seed-comm-2' },
    update: {},
    create: {
      id: 'seed-comm-2',
      name: 'Women In Pune',
      description: 'A safe space strictly verified for female students and professionals in the city.',
      city: 'Pune',
      type: 'WOMEN_ONLY',
      isWomenOnly: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
      createdById: mentor1.id,
    },
  });

  // 5. Add Users to Communities
  await prisma.communityMember.upsert({
    where: { userId_communityId: { userId: mentor1.id, communityId: comm1.id } },
    update: {}, create: { userId: mentor1.id, communityId: comm1.id, role: 'MEMBER' },
  });
  await prisma.communityMember.upsert({
    where: { userId_communityId: { userId: user1.id, communityId: comm1.id } },
    update: {}, create: { userId: user1.id, communityId: comm1.id, role: 'MEMBER' },
  });

  // 6. Create Real Housing Properties
  await prisma.housing.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-house-1',
        title: 'Skyline Residency - 1 BHK',
        description: 'A spacious, well-maintained 1 BHK in the heart of Hinjewadi Phase 1. Walking distance to major IT parks including Infosys and Wipro campuses.',
        type: 'FLAT',
        city: 'Pune',
        area: 'Hinjewadi',
        address: 'Phase 1, Hinjewadi',
        rent: 18500,
        deposit: 40000,
        isVerified: true,
        isWomenFriendly: true,
        amenities: ['WiFi', 'Power Backup', 'Gym', 'Parking', '24/7 Security'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop'],
        contactPhone: '+91 9876543210',
        contactEmail: 'skyline@homes.in',
        createdById: admin.id,
      },
      {
        id: 'seed-house-2',
        title: 'Green Terrace PG',
        description: 'A comfortable women-only PG with twin sharing rooms. Includes free WiFi, three meals a day, and housekeeping. Located near the IT Hub.',
        type: 'PG',
        city: 'Pune',
        area: 'Marunji',
        address: 'Marunji, Wakad',
        rent: 9000,
        deposit: 9000,
        isVerified: true,
        isWomenFriendly: true,
        amenities: ['Free WiFi', 'Meals Included', 'Laundry', 'Housekeeping', 'CCTV'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop'],
        contactPhone: '+91 8765432109',
        createdById: mentor1.id,
      },
      {
        id: 'seed-house-3',
        title: 'Student Hub Hostel',
        description: 'Affordable and lively hostel for university students. 10 minutes from campus.',
        type: 'HOSTEL',
        city: 'Pune',
        area: 'Kothrud',
        address: 'MIT College Road',
        rent: 7500,
        deposit: 7500,
        isVerified: false,
        isWomenFriendly: false,
        amenities: ['Free WiFi', 'Meals Included', 'Hot Water', 'Library'],
        images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=500&fit=crop'],
        contactEmail: 'hub@students.com',
        createdById: admin.id,
      }
    ]
  });

  // 7. Create Test Posts
  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      { id: 'post-1', content: "Anyone moved to Phase 3 recently? How's the traffic during the rains? Thinking of taking a flat near Megapolis. 🌧️", communityId: comm1.id, userId: user1.id, likesCount: 2, commentsCount: 2 },
      { id: 'post-2', content: 'Found an amazing Tiffin service near Phase 1. Healthy, home-cooked, and super affordable. Check out "Mom\'s Kitchen". 🍲', communityId: comm2.id, userId: mentor1.id, likesCount: 5, commentsCount: 1 },
      { id: 'post-3', content: 'Pro tip: The 7:45 AM shuttle from Wakad to IT Park avoids all traffic. Been using it for 3 months now. Game changer! 🚌', communityId: comm1.id, userId: user1.id, likesCount: 8, commentsCount: 1 },
    ]
  });

  // 7.5 Create Test Comments
  await prisma.comment.createMany({
    skipDuplicates: true,
    data: [
      { id: 'comment-1', content: 'Traffic gets bad near the circle, but it is manageable if you leave by 8 AM.', postId: 'post-1', userId: mentor1.id },
      { id: 'comment-2', content: 'Megapolis is a great society, highly recommend it.', postId: 'post-1', userId: admin.id },
      { id: 'comment-3', content: 'Could you share their contact info? Sounds great!', postId: 'post-2', userId: user1.id },
      { id: 'comment-4', content: 'Thanks for the tip! That bus is indeed a game changer.', postId: 'post-3', userId: mentor1.id },
    ]
  });

  // 8. Create Test Events
  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      { id: 'ev-1', title: 'Newcomer Mixer', description: 'Meet new folks', type: 'MEETUP', date: new Date(new Date().setDate(new Date().getDate() + 2)), location: 'Blue Ridge Café', createdById: admin.id, maxAttendees: 50 },
      { id: 'ev-2', title: 'Techies Who Trek', description: 'Weekend trek', type: 'CITY_EXPLORATION', date: new Date(new Date().setDate(new Date().getDate() + 5)), location: 'Sinhagad Fort', createdById: mentor1.id },
      { id: 'ev-3', title: 'Women in Tech', description: 'Networking event', type: 'NETWORKING', date: new Date(new Date().setDate(new Date().getDate() + 10)), location: 'Koregaon Park Hub', createdById: mentor1.id }
    ]
  });

  // 9. Add Sample Reviews
  await prisma.housingReview.createMany({
    skipDuplicates: true,
    data: [
      { id: 'rev-1', rating: 5, review: "Amazing location! Just 5 minutes walk to the IT park. The security is top-notch.", userId: mentor1.id, housingId: 'seed-house-1' },
      { id: 'rev-2', rating: 4, review: "Great value for money. Safest place I've lived in.", userId: user1.id, housingId: 'seed-house-1' },
      { id: 'rev-3', rating: 5, review: "Clean and well managed. Perfect for new expats.", userId: mentor1.id, housingId: 'seed-house-2' }
    ]
  });

  console.log('✅ Real housing listings seeded.');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
