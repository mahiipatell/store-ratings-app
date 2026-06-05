const bcrypt = require('bcryptjs')
const prisma = require('./prisma')

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@storeratings.com' },
    update: {},
    create: {
      name: 'System Administrator Account',
      email: 'admin@storeratings.com',
      passwordHash,
      address: '123 Admin Street, Mumbai, Maharashtra, India',
      role: 'ADMIN'
    }
  })

  console.log('Admin created:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())