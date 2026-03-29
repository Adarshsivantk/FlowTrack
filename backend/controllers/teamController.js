import Team from '../models/Team.js';
import User from '../models/User.js';

const createTeam = async (req, res) => {
  try {
    const { name, description, teamLead, members } = req.body;

    if (!name || !teamLead) {
      return res.status(400).json({ message: 'Team name and team lead are required' });
    }

    const existing= await Team.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'A team with this name already exists' });
    }

    const leadUser = await User.findById(teamLead);
    if (!leadUser) {
      return res.status(404).json({ message: 'Team lead user not found' });
    }

    // FIX: no role mutation — just create the team with this user as lead
    const team = await Team.create({
      name,
      description,
      teamLead,
      members: members || [],
      createdBy: req.user._id,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTeam);
  } catch (error) {
    // Handle duplicate team name
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A team with this name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllTeams = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      // For non-admins: show teams they lead or are a member of
      query = {
        $or: [
          { teamLead: req.user._id },
          { members: req.user._id },
        ],
      };
    }

    const teams = await Team.find(query)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isTeamLead = team.teamLead.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isTeamLead) {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }

    const { name, description, teamLead, members } = req.body;

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (teamLead) team.teamLead = teamLead; // FIX: no role mutation
    if (members) team.members = members;

    const updatedTeam = await team.save();

    const populatedTeam = await Team.findById(updatedTeam._id)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.json(populatedTeam);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A team with this name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isTeamLead = team.teamLead.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isTeamLead) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyMember = team.members.some((m) => m.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    team.members.push(userId);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isTeamLead = team.teamLead.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isTeamLead) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    team.members = team.members.filter((m) => m.toString() !== userId);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { createTeam, getAllTeams, getTeamById, updateTeam, addMember, removeMember, deleteTeam };