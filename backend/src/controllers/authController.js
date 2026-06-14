import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { signAdminToken, signUserToken } from '../middleware/auth.js';
import { sendVerificationEmail } from '../utils/email.js';
import logger from '../utils/logger.js';

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  admin.lastLogin = new Date();
  await admin.save();

  const token = signAdminToken(admin);
  logger.info(`Admin login: ${username}`);
  res.json({ token, username: admin.username });
};

export const createAdmin = async (req, res) => {
  const { username, password } = req.body;
  const exists = await Admin.findOne({ username });
  if (exists) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = await Admin.create({ username, password: hashed });
  res.status(201).json({ id: admin._id, username: admin.username });
};

export const userRegister = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const hashed = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    password: hashed,
    verificationToken,
    tokenExpiry
  });

  const emailResult = await sendVerificationEmail(email, verificationToken);

  res.status(201).json({
    message: 'Registration successful. Please verify your email.',
    ...(emailResult.verifyUrl && { devVerifyUrl: emailResult.verifyUrl })
  });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Verification token required' });
  }

  const user = await User.findOne({
    verificationToken: token,
    tokenExpiry: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({
      message: 'Invalid or expired verification link. Register again or request a new link.'
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.tokenExpiry = undefined;
  await user.save();

  const jwtToken = signUserToken(user);
  res.json({
    message: 'Email verified successfully',
    token: jwtToken,
    user: { id: user._id, name: user.name, email: user.email, isVerified: true }
  });
};

export const resendVerification = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email' });
  }
  if (user.isVerified) {
    return res.status(400).json({ message: 'Email is already verified. You can log in.' });
  }

  user.verificationToken = crypto.randomBytes(32).toString('hex');
  user.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const emailResult = await sendVerificationEmail(email, user.verificationToken);
  res.json({
    message: 'New verification link generated.',
    ...(emailResult.verifyUrl && { devVerifyUrl: emailResult.verifyUrl })
  });
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signUserToken(user);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified
    }
  });
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -verificationToken');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
};
