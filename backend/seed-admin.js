const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hashed = await bcrypt.hash('trust123', 10);
    
    const user = await prisma.user.upsert({
        where: { username: 'trust' },
        update: { password_hash: hashed },
        create: {
            username: 'trust',
            password_hash: hashed,
            full_name: 'Admin Trust',
            role: 'admin'
        }
    });
    
    console.log('Admin created:', user.username);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
