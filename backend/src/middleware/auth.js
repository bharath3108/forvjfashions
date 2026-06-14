import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getSecret = (type) => {
  const key = type === 'admin' ? 'JWT_ADMIN_SECRET' : 'JWT_USER_SECRET';
  const secret = process.env[key];
  if (!secret) throw new Error(`${key} is not defined`);
  return secret;
};

export const protectAdmin = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Admin authentication required' });
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], getSecret('admin'));
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    req.admin = { id: decoded.id, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

export const protectUser = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Login required' });
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], getSecret('user'));
    if (decoded.role !== 'user') {
      return res.status(403).json({ message: 'User access only' });
    }
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isVerified: decoded.isVerified
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireVerifiedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('isVerified');
    if (!user?.isVerified) {
      return res.status(403).json({
        message: 'Email verification required before commenting'
      });
    }
    req.user.isVerified = true;
    next();
  } catch {
    return res.status(500).json({ message: 'Could not verify user status' });
  }
};

export const signAdminToken = (admin) =>
  jwt.sign(
    { id: admin._id, username: admin.username, role: 'admin' },
    getSecret('admin'),
    { expiresIn: '8h' }
  );

export const signUserToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      role: 'user'
    },
    getSecret('user'),
    { expiresIn: '7d' }
  );
