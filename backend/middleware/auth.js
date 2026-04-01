import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Team from '../models/Team.js';

const protect = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.cookie('token', '', { httpOnly: true, maxAge: 0 });
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// FIX: determine team lead status dynamically from Team collection
const adminOrTeamLead = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  // Check if this user is a teamLead of any team
  const isTeamLead = await Team.exists({ teamLead: req.user._id });

  if (isTeamLead) {
    req.user.isTeamLead = true; // attach for use in controllers
    return next();
  }

  res.status(403).json({ message: 'Not authorized. Admin or Team Lead access required.' });
};

export { protect, admin, adminOrTeamLead };