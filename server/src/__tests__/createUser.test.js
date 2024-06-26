import supertest from 'supertest';

import {
  connectToMockDB,
  closeMockDatabase,
  clearMockDatabase,
} from '../__testUtils__/dbMock.js';
import app from '../app.js';
import { findUserInMockDB } from '../__testUtils__/userMocks.js';

// Hashing passwords
import bcryptjs from 'bcryptjs';

const request = supertest(app);

beforeAll(async () => {
  await connectToMockDB();
});

afterEach(async () => {
  await clearMockDatabase();
});

afterAll(async () => {
  await closeMockDatabase();
});

const testUserBase = {
  email: 'john@doe.com',
  password: 'Qwerty123456!',
  confirmPassword: 'Qwerty123456!',
  userName: 'John Doe',
};

describe('POST /api/user/register', () => {
  it('Should return a bad request if no user object is given', (done) => {
    request
      .post('/api/user/register')
      .then((response) => {
        expect(response.status).toBe(400);

        const { body } = response;
        expect(body.success).toBe(false);
        // Check that there is an error message
        expect(body.message.length).not.toBe(0);

        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it('Should return a bad request if the user object does not have a password', (done) => {
    const testUser = {
      email: testUserBase.email,
      userName: testUserBase.userName,
    };

    request
      .post('/api/user/register')
      .send({ user: testUser })
      .then((response) => {
        expect(response.status).toBe(400);

        const { body } = response;
        expect(body.success).toBe(false);
        // Check that there is an error message
        expect(body.message.length).not.toBe(0);

        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it('Should return a bad request if the user object does not have an email', (done) => {
    const testUser = { password: testUserBase.password };

    request
      .post('/api/user/register')
      .send({ user: testUser })
      .then((response) => {
        expect(response.status).toBe(400);

        const { body } = response;
        expect(body.success).toBe(false);
        // Check that there is an error message
        expect(body.message.length).not.toBe(0);

        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it('Should return a bad request if the user object has extra fields', (done) => {
    const testUser = { ...testUserBase, foo: 'bar' };

    request
      .post('/api/user/register')
      .send({ user: testUser })
      .then((response) => {
        expect(response.status).toBe(400);

        const { body } = response;
        expect(body.success).toBe(false);
        // Check that there is an error message
        expect(body.message.length).not.toBe(0);

        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  it('Should return a success state if a correct user is given', async () => {
    const testUser = { ...testUserBase };

    return request
      .post('/api/user/register')
      .send({ user: testUser })
      .then(async (response) => {
        expect(response.status).toBe(201);

        const { body } = response;
        expect(body.success).toBe(true);

        // Retrieve the newly created user from the database
        const newUser = await findUserInMockDB(body.user.userId);

        // Compare the hashed passwords
        const passwordCheck = bcryptjs.compareSync(
          testUser.password,
          newUser.password
        );

        expect(passwordCheck).toBe(true);

        expect(body.user.email).toEqual(testUser.email);
      });
  });

  it('Should return a conflict if a user with the same email already exists', async () => {
    const testUser = { ...testUserBase };

    // Create the first user
    await request.post('/api/user/register').send({ user: testUser });

    // Try to create a second user with the same email
    return request
      .post('/api/user/register')
      .send({ user: testUser })
      .then((response) => {
        expect(response.status).toBe(409);

        const { body } = response;
        expect(body.success).toBe(false);
        expect(body.message).toBe('A user with this email already exists');
      });
  });

  it('Should return a bad request if the passwords do not match', async () => {
    const testUser = { ...testUserBase, confirmPassword: 'new-password-123=)' };

    // Create the first user
    await request.post('/api/user/register').send({ user: testUser });

    // Try to create a second user with the same email
    return request
      .post('/api/user/register')
      .send({ user: testUser })
      .then((response) => {
        expect(response.status).toBe(400);

        const { body } = response;
        expect(body.success).toBe(false);
        expect(body.message).toBe('Passwords do not match');
      });
  });
});
