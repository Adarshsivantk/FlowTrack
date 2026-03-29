import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id/role', protect, admin, updateUserRole);
router.put('/:id/toggle-status', protect, admin, toggleUserStatus);
router.delete('/:id', protect, admin, deleteUser);

export default router;