import Project from '../models/Project.js';
import Team from '../models/Team.js';

const createProject = async (req, res) => {
  try {
    const { name, description, team, githubLink, deadline, priority, members } =
      req.body;

    if (!name || !team || !deadline) {
      return res
        .status(400)
        .json({ message: 'Name, team and deadline are required' });
    }

    const teamDoc = await Team.findById(team);

    if (!teamDoc) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (
      req.user.role === 'team_lead' &&
      teamDoc.teamLead.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'You can only create projects for your own team',
      });
    }

    const project = await Project.create({
    name,
    description,
    team,
    githubLink: githubLink || '',
    deadline: new Date(deadline), // ✅ FIXED
    priority: priority || 'medium',
    createdBy: req.user._id,
    members: Array.isArray(members) ? members.filter(Boolean) : [], // ✅ FIXED
  });

    const populatedProject = await Project.findById(project._id)
      .populate('team', 'name')
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.status(201).json(populatedProject);
  } catch (error) {
  console.error("CREATE PROJECT ERROR:", error) // 👈 MUST HAVE
  res.status(500).json({ message: 'Server error', error: error.message });
}
};

const getAllProjects = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'user') {
      query = { members: req.user._id };
    } else if (req.user.role === 'team_lead') {
      const teams = await Team.find({ teamLead: req.user._id });
      const teamIds = teams.map((t) => t._id);
      query = {
        $or: [
          { team: { $in: teamIds } },
          { members: req.user._id },
          { createdBy: req.user._id },
        ],
      };
    }

    const projects = await Project.find(query)
      .populate({
              path: 'team',
              populate: [
    { path: 'members', select: 'name email role' },
    { path: 'teamLead', select: 'name email role' }
  ]
})
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json(projects);
    } catch (error) {
    console.error("CREATE PROJECT ERROR:", error) // 👈 ADD THIS
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('team', 'name teamLead members')
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const {
      name,
      description,
      githubLink,
      status,
      deadline,
      priority,
      members,
    } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (githubLink !== undefined) project.githubLink = githubLink;
    if (status) project.status = status;
    if (deadline) project.deadline = deadline;
    if (priority) project.priority = priority;
    if (members) project.members = members;

    const updatedProject = await project.save();

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('team', 'name teamLead')
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeMemberFromProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== userId
    );

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('team', 'name teamLead')
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  removeMemberFromProject,
  deleteProject,
};