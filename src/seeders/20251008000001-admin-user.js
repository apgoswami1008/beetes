'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRole = await queryInterface.rawSelect('Roles', {
      where: {
        name: 'ADMIN'
      }
    }, ['id']);

    if (!adminRole) {
      throw new Error('Admin role not found. Please run roles migration first.');
    }

    await queryInterface.bulkInsert('Users', [{
      name: 'Beetes Admin',
      email: 'beetes-admin@yopmail.com',
      phone: 'admin',  // Not used for admin
      password: '$2a$08$' + (await bcrypt.hash('Password@123', 8)).slice(7),  // Using bcrypt hash with salt
      roleId: adminRole,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      email: 'beetes-admin@yopmail.com'
    }, {});
  }
};