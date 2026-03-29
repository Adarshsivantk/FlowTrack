import express from 'express';
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  addMember,
  removeMember,
  deleteTeam,
} from '../controllers/teamController.js';
import { protect, admin, adminOrTeamLead } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, admin, createTeam);
router.get('/', protect, getAllTeams);
router.get('/:id', protect, getTeamById);
router.put('/:id', protect, adminOrTeamLead, updateTeam);
router.post('/:id/add-member', protect, adminOrTeamLead, addMember);
router.post('/:id/remove-member', protect, adminOrTeamLead, removeMember);
router.delete('/:id', protect, admin, deleteTeam);

export default router;