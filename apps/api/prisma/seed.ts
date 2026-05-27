import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Running seed...');

  // ─── Admin user ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      displayName: 'Administrador',
      isActive: true,
    },
  });
  console.log(`✅ Admin user: ${admin.username}`);

  // ─── Base categories ─────────────────────────────────────────────────────────
  const categories = [
    { name: 'Libros', icon: 'BookOpen', color: '#B8922A' },
    { name: 'Papelería', icon: 'FileText', color: '#B8922A' },
    { name: 'Cuadernos', icon: 'Notebook', color: '#B8922A' },
    { name: 'Útiles', icon: 'Pencil', color: '#B8922A' },
    { name: 'Arte', icon: 'Palette', color: '#B8922A' },
    { name: 'Regalos', icon: 'Gift', color: '#B8922A' },
    { name: 'Otros', icon: 'Box', color: '#B8922A' },
  ];

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    console.log(`✅ Category: ${created.name}`);
  }

  // ─── Default settings ────────────────────────────────────────────────────────
  const settings = [
    { key: 'business_name', value: 'Papyrus Librería' },
    { key: 'business_address', value: '' },
    { key: 'business_phone', value: '' },
    { key: 'ticket_message', value: '¡Gracias por su compra!' },
    { key: 'ticket_prefix', value: 'PAP' },
    { key: 'max_discount_percent', value: '50' },
    { key: 'next_ticket_number', value: '1' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
    console.log(`✅ Setting: ${setting.key}`);
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
