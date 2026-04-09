const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
    try {
        // Create admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password_hash: adminPassword,
                full_name: 'Administrator',
                email: 'admin@trustbarbershop.com',
                role: 'admin'
            }
        });
        console.log('✅ Admin created: admin / admin123');

        // Create sample packages
        const packages = [
            { name: 'Haircut Standar', description: 'Potong rambut biasa', price: 35000, duration_minutes: 30 },
            { name: 'Haircut + Cuci', description: 'Potong + keramas', price: 50000, duration_minutes: 45 },
            { name: 'Full Service', description: 'Potong + cuci + creambath', price: 85000, duration_minutes: 60 },
            { name: 'Gratis Cukur + Keramas', description: 'Hadiah loyalitas (7x cukur)', price: 0, duration_minutes: 45, is_free: true, requires_coupon: true }
        ];

        for (const pkg of packages) {
            const existing = await prisma.package.findFirst({ where: { name: pkg.name } });
            if (!existing) {
                await prisma.package.create({ data: pkg });
                console.log(`✅ Package added: ${pkg.name}`);
            }
        }

        // Create sample barbers
        const barbers = [
            { name: 'Bang Udin', phone: '081234567890', specialization: 'Master Barber - Potong Klasik' },
            { name: 'Bang Joko', phone: '081234567891', specialization: 'Specialist - Fade & Taper' },
            { name: 'Bang Rizki', phone: '081234567892', specialization: 'Expert - Hair Design & Coloring' }
        ];

        for (const barber of barbers) {
            const existing = await prisma.barber.findFirst({ where: { name: barber.name } });
            if (!existing) {
                await prisma.barber.create({ data: barber });
                console.log(`✅ Barber added: ${barber.name}`);
            }
        }

        // Create shop profile
        const existingProfile = await prisma.shopProfile.findFirst();
        if (!existingProfile) {
            await prisma.shopProfile.create({
                data: {
                    name: 'Trust Barbershop',
                    address: 'Jl. Letnan Harun No. 123, Tasikmalaya',
                    phone: '+62 812-3456-7890',
                    email: 'info@trustbarbershop.com',
                    is_open: true,
                    loyalty_rule: 7
                }
            });
            console.log('✅ Shop profile created');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 SEEDING COMPLETE!');
        console.log('📝 Login: admin / admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seed();