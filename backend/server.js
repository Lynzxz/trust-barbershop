const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch(err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

function verifyAdmin(req, res, next) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
    }
    next();
}

// ============= LOGIN =============
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'User tidak ditemukan' });
        }
        
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Password salah' });
        }
        
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= MEMBER PANEL =============
app.get('/api/shop-status', verifyToken, async (req, res) => {
    try {
        let status = await prisma.shopProfile.findFirst();
        if (!status) {
            status = await prisma.shopProfile.create({
                data: { name: 'Trust Barbershop', is_open: true, loyalty_rule: 7 }
            });
        }
        res.json({ is_open: status.is_open, name: status.name });
    } catch (error) {
        res.json({ is_open: true, name: 'Trust Barbershop' });
    }
});

app.get('/api/my-visits', verifyToken, async (req, res) => {
    try {
        const visits = await prisma.visit.findMany({
            where: { user_id: req.userId },
            include: { package: true, barber: true },
            orderBy: { visit_date: 'desc' }
        });
        res.json(visits);
    } catch (error) {
        res.json([]);
    }
});

app.get('/api/events', verifyToken, async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            where: { is_active: true },
            orderBy: { event_date: 'asc' }
        });
        res.json(events);
    } catch (error) {
        res.json([]);
    }
});

app.get('/api/packages', verifyToken, async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            where: { is_active: true }
        });
        res.json(packages);
    } catch (error) {
        res.json([]);
    }
});

// ============= ADMIN PANEL =============
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'member' },
            orderBy: { created_at: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
    const { username, password, full_name, email, phone, address } = req.body;
    
    try {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ error: 'Username sudah ada' });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { 
                username, 
                password_hash: hashed, 
                full_name, 
                email: email || null,
                phone: phone || null,
                address: address || null,
                role: 'member' 
            }
        });
        
        res.json({ message: 'Member created', user: { id: user.id, username: user.username } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/barbers', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const barbers = await prisma.barber.findMany({ where: { is_active: true } });
        res.json(barbers);
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/admin/barbers', verifyToken, verifyAdmin, async (req, res) => {
    const { name, phone, specialization } = req.body;
    try {
        const barber = await prisma.barber.create({ data: { name, phone, specialization } });
        res.json(barber);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/visits', verifyToken, verifyAdmin, async (req, res) => {
    const { user_id, package_id, barber_id, notes, rating, review, payment_method, discount_amount } = req.body;
    
    try {
        const visit = await prisma.visit.create({
            data: {
                user_id,
                package_id,
                barber_id: barber_id || null,
                visit_date: new Date(),
                notes: notes || null,
                rating: rating ? parseInt(rating) : null,
                review: review || null,
                payment_method: payment_method || 'cash',
                discount_amount: discount_amount || 0
            }
        });
        
        await prisma.user.update({
            where: { id: user_id },
            data: { total_visits: { increment: 1 }, last_visit_date: new Date() }
        });
        
        // Loyalty check
        const user = await prisma.user.findUnique({ where: { id: user_id } });
        const shopProfile = await prisma.shopProfile.findFirst();
        const loyaltyRule = shopProfile?.loyalty_rule || 7;
        
        if (user.total_visits + 1 >= loyaltyRule && (user.total_visits % loyaltyRule) + 1 === loyaltyRule) {
            await prisma.user.update({
                where: { id: user_id },
                data: { free_coupons: { increment: 1 } }
            });
        }
        
        res.json(visit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/visits', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const visits = await prisma.visit.findMany({
            include: { user: true, package: true, barber: true },
            orderBy: { visit_date: 'desc' }
        });
        res.json(visits);
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/admin/events', verifyToken, verifyAdmin, async (req, res) => {
    const { title, description, event_date, location } = req.body;
    try {
        const event = await prisma.event.create({
            data: { title, description, event_date: new Date(event_date), location, created_by: req.userId }
        });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/shop-profile', verifyToken, verifyAdmin, async (req, res) => {
    try {
        let profile = await prisma.shopProfile.findFirst();
        if (!profile) {
            profile = await prisma.shopProfile.create({ data: { name: 'Trust Barbershop', is_open: true, loyalty_rule: 7 } });
        }
        res.json(profile);
    } catch (error) {
        res.json({ name: 'Trust Barbershop', is_open: true, loyalty_rule: 7 });
    }
});

app.put('/api/admin/shop-profile', verifyToken, verifyAdmin, async (req, res) => {
    const { name, address, phone, email, is_open, loyalty_rule } = req.body;
    try {
        const existing = await prisma.shopProfile.findFirst();
        let profile;
        if (existing) {
            profile = await prisma.shopProfile.update({
                where: { id: existing.id },
                data: { name, address, phone, email, is_open, loyalty_rule, updated_at: new Date() }
            });
        } else {
            profile = await prisma.shopProfile.create({ data: { name, address, phone, email, is_open, loyalty_rule } });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chart data
app.get('/api/admin/chart-data', verifyToken, verifyAdmin, async (req, res) => {
    const { period } = req.query;
    let daysBack = period === 'week' ? 30 : period === 'month' ? 180 : 7;
    
    try {
        const result = await prisma.$queryRaw`
            SELECT TO_CHAR(visit_date, 'YYYY-MM-DD') as label, COUNT(*) as total_visits
            FROM visits
            WHERE visit_date >= CURRENT_DATE - ${daysBack}::integer
            GROUP BY label
            ORDER BY label ASC
        `;
        res.json(result);
    } catch (error) {
        res.json([]);
    }
});

app.get('/api/admin/dashboard-summary', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalMembers = await prisma.user.count({ where: { role: 'member' } });
        const visitsToday = await prisma.visit.count({
            where: { visit_date: { gte: new Date(new Date().setHours(0,0,0,0)) } }
        });
        const membersWithCoupons = await prisma.user.count({ where: { free_coupons: { gt: 0 } } });
        
        res.json({ totalMembers, visitsThisMonth: 0, visitsToday, membersWithCoupons, topBarber: null });
    } catch (error) {
        res.json({ totalMembers: 0, visitsThisMonth: 0, visitsToday: 0, membersWithCoupons: 0, topBarber: null });
    }
});

app.get('/api/admin/loyalty-leaderboard', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const members = await prisma.user.findMany({
            where: { role: 'member' },
            select: { id: true, full_name: true, username: true, total_visits: true, free_coupons: true },
            orderBy: { total_visits: 'desc' },
            take: 10
        });
        res.json(members);
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/admin/upload-logo', verifyToken, verifyAdmin, async (req, res) => {
    const { logo_base64 } = req.body;
    try {
        const existing = await prisma.shopProfile.findFirst();
        if (existing) {
            await prisma.shopProfile.update({ where: { id: existing.id }, data: { logo_url: logo_base64 } });
        } else {
            await prisma.shopProfile.create({ data: { logo_url: logo_base64, name: 'Trust Barbershop', is_open: true, loyalty_rule: 7 } });
        }
        res.json({ message: 'Logo updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/packages', verifyToken, verifyAdmin, async (req, res) => {
    const { name, description, price, duration_minutes, is_free, requires_coupon } = req.body;
    try {
        const pkg = await prisma.package.create({
            data: { name, description, price, duration_minutes, is_free: is_free || false, requires_coupon: requires_coupon || false }
        });
        res.json(pkg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/package/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.package.delete({ where: { id } });
        res.json({ message: 'Package deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/member/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.visit.deleteMany({ where: { user_id: id } });
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Member deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update member
app.put('/api/admin/member/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { full_name, email, phone, address } = req.body;
    try {
        const member = await prisma.user.update({
            where: { id },
            data: { full_name, email, phone, address }
        });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update barber
app.put('/api/admin/barbers/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, phone, instagram, specialization } = req.body;
    try {
        const barber = await prisma.barber.update({
            where: { id },
            data: { name, phone, instagram, specialization }
        });
        res.json(barber);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete barber
app.delete('/api/admin/barbers/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.barber.delete({ where: { id } });
        res.json({ message: 'Barber deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete event
app.delete('/api/admin/events/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.event.delete({ where: { id } });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
