const bcrypt = require('bcryptjs')
const prisma = require('./prisma')

async function main() {

  // Hash all passwords before storing
  const adminHash = await bcrypt.hash('Password@admin1', 10)
  const userHash = await bcrypt.hash('Password@user1', 10)
  const ownerHash = await bcrypt.hash('Password@owner1', 10)

  // Create or update admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin_1@gmail.com' },
    update: { passwordHash: adminHash },
    create: {
      name: 'admin_1',
      email: 'admin_1@gmail.com',
      passwordHash: adminHash,
      address: 'Admin Address Mumbai Maharashtra India',
      role: 'ADMIN'
    }
  })

  // Create or update normal user
  const user = await prisma.user.upsert({
    where: { email: 'user_1@gmail.com' },
    update: { passwordHash: userHash },
    create: {
      name: 'User_1',
      email: 'user_1@gmail.com',
      passwordHash: userHash,
      address: 'Mumbai Maharashtra India',
      role: 'USER'
    }
  })

  // Create or update store owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner_1@gmail.com' },
    update: { passwordHash: ownerHash },
    create: {
      name: 'Owner_1',
      email: 'owner_1@gmail.com',
      passwordHash: ownerHash,
      address: 'Mumbai Maharashtra India',
      role: 'STORE_OWNER'
    }
  })

  console.log('Seeded successfully:')
  console.log('Admin:', admin.email)
  console.log('User:', user.email)
  console.log('Owner:', owner.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())