import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  removeMemberFromProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, admin, createProject);                        // admin only
router.get('/', protect, getAllProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, admin, updateProject);                      // admin only
router.post('/:id/remove-member', protect, admin, removeMemberFromProject); // admin only
router.delete('/:id', protect, admin, deleteProject);                   // admin only

export default router;