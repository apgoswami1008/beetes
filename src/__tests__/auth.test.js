const { request, app } = require('./setup');
const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

describe('Authentication API', () => {
  beforeAll(async () => {
    // Create roles
    await Role.bulkCreate([
      { name: 'ADMIN' },
      { name: 'CUSTOMER' }
    ]);

    // Create default admin user
    const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
    await User.create({
      name: 'Beetes Admin',
      email: 'beetes-admin@yopmail.com',
      phone: 'admin',
      password: bcrypt.hashSync('Password@123', 8),
      roleId: adminRole.id
    });
  });

  describe('POST /api/auth/register/customer', () => {
    it('should register a new customer', async () => {
      const response = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Test Customer',
          email: 'customer@test.com',
          phone: '+1234567891'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('customer@test.com');
      expect(response.body.user.role).toBe('CUSTOMER');
    });

    it('should not register customer with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Test Customer 2',
          email: 'customer@test.com',
          phone: '+1234567892'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login/admin', () => {
    it('should login admin with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login/admin')
        .send({
          email: 'beetes-admin@yopmail.com',
          password: 'Password@123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('ADMIN');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login/admin')
        .send({
          email: 'beetes-admin@yopmail.com',
          password: 'WrongPassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should not login customer through admin login', async () => {
      const response = await request(app)
        .post('/api/auth/login/admin')
        .send({
          email: 'customer@test.com',
          password: 'Password@123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/login/customer/send-otp', () => {
    it('should send OTP to registered customer', async () => {
      const response = await request(app)
        .post('/api/auth/login/customer/send-otp')
        .send({
          phone: '+1234567891'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'OTP sent successfully');
    });

    it('should not send OTP to unregistered phone', async () => {
      const response = await request(app)
        .post('/api/auth/login/customer/send-otp')
        .send({
          phone: '+9999999999'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found or not a customer');
    });

    it('should not send OTP to admin user', async () => {
      const response = await request(app)
        .post('/api/auth/login/customer/send-otp')
        .send({
          phone: '+1234567890'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found or not a customer');
    });
  });

  describe('POST /api/auth/login/customer/verify-otp', () => {
    let validOtp;

    beforeAll(async () => {
      // Mock sending OTP by directly setting it in the database
      const customer = await User.findOne({ where: { email: 'customer@test.com' } });
      validOtp = '123456';
      customer.otpSecret = bcrypt.hashSync(validOtp, 8);
      customer.otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now
      await customer.save();
    });

    it('should verify valid OTP and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login/customer/verify-otp')
        .send({
          phone: '+1234567891',
          otp: validOtp
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('CUSTOMER');
    });

    it('should not verify invalid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/login/customer/verify-otp')
        .send({
          phone: '+1234567891',
          otp: '999999'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'OTP expired');
    });

    it('should not verify OTP for unregistered phone', async () => {
      const response = await request(app)
        .post('/api/auth/login/customer/verify-otp')
        .send({
          phone: '+9999999999',
          otp: validOtp
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found or not a customer');
    });
  });
});