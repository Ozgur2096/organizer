import mongoose from 'mongoose';
import validator from 'validator';
import validateAllowedFields from '../util/validateAllowedFields.js';

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true, minLength: 7 },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model('users', userSchema);

export const validateUser = (userObject, passwordRequired = true) => {
  const errorList = [];

  const allowedKeys = [];
  if (passwordRequired) {
    allowedKeys.push('userName');
    allowedKeys.push('email');
    allowedKeys.push('password');
  } else {
    allowedKeys.push('email');
  }

  const validatedKeysMessage = validateAllowedFields(userObject, allowedKeys);

  if (validatedKeysMessage.length > 0) {
    errorList.push(validatedKeysMessage);
  }

  const { email, password } = userObject;

  if (!password && passwordRequired) {
    errorList.push('Password is a required field');
  }
  if (!validator.isLength(password, { min: 8 })) {
    errorList.push('Password must be at least 8 characters long');
  }
  if (!validator.isStrongPassword(password)) {
    errorList.push('Password is not strong enough');
  }

  if (email == null) {
    errorList.push('Email is a required field');
  }

  return errorList;
};

export default User;
