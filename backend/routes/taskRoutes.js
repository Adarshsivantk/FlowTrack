import express from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  submitTask,
  approveTask,
  rejectTask,
  addNote,
  deleteTask,
  getDashboardStats,
} from '../controllers/taskController.js';
import { protect, admin } from '../middleware/auth.js';
 
const router = express.Router();
 
router.get('/dashboard-stats', protect, getDashboardStats);
router.post('/', protect, admin, createTask);             // admin only
router.get('/', protect, getAllTasks);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, admin, updateTask);           // admin only
router.put('/:id/status', protect, updateTaskStatus);
router.post('/:id/submit', protect, submitTask);          // any logged in user
router.post('/:id/approve', protect, admin, approveTask); // admin only
router.post('/:id/reject', protect, admin, rejectTask);   // admin only
router.post('/:id/notes', protect, addNote);
router.delete('/:id', protect, admin, deleteTask);        // admin only
 
export default router;