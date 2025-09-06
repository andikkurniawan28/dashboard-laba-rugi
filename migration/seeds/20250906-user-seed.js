'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ===== Seed Users =====
    const password1 = await bcrypt.hash('123456', 10);
    const password2 = await bcrypt.hash('password', 10);

    const users = [
      {
        name: 'Andik Kurniawan',
        organization: 'Company A',
        email: 'andik@example.com',
        password: password1,
        whatsapp: '08123456789',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jane Doe',
        organization: 'Company B',
        email: 'jane@example.com',
        password: password2,
        whatsapp: '08987654321',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Masukkan user ke database
    await queryInterface.bulkInsert('users', users);

    // Ambil user_id dari database (mengasumsikan autoincrement dimulai dari 1)
    const [user1, user2] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email IN ('andik@example.com', 'jane@example.com') ORDER BY id ASC;`
    );

    const userIds = user1.map(u => u.id);

    // ===== Seed ProfitLoss =====
    const profitlossData = [
      {
        date: '2025-09-01',
        revenue: 10000,
        expense: 5000,
        profitloss: 5000,
        user_id: userIds[0],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        date: '2025-09-02',
        revenue: 15000,
        expense: 7000,
        profitloss: 8000,
        user_id: userIds[0],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        date: '2025-09-01',
        revenue: 20000,
        expense: 12000,
        profitloss: 8000,
        user_id: userIds[1],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('profitloss', profitlossData);
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus data profitloss dulu
    await queryInterface.bulkDelete('profitloss', null, {});
    // Hapus data user
    await queryInterface.bulkDelete('users', null, {});
  }
};
