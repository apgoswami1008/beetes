const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ecommerce_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
});

sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully!'))
  .catch(err => console.error('❌ Connection failed:', err));