import Task from '../models/Task.js';
import Project from '../models/Project.js';

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, deadline, priority, tags } =
      req.body;

    if (!title || !project || !assignedTo || !deadline) {
      return res.status(400).json({
        message: 'Title, project, assignedTo and deadline are required',
      });
    }

    const projectDoc = await Project.findById(project);

    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      assignedBy: req.user._id,
      deadline,
      priority: priority || 'medium',
      tags: tags || [],
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'user') {
      query = { assignedTo: req.user._id };
    }

    if (req.query.project) {
      query.project = req.query.project;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name githubLink')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, assignedTo, deadline, priority, tags, status, statusNote } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (deadline) task.deadline = deadline;
    if (priority) task.priority = priority;
    if (tags) task.tags = tags;
    if (status) task.status = status;
    if (statusNote !== undefined) task.statusNote = statusNote;

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();

    if (req.user.role === 'user' && !isAssigned) {
      return res.status(403).json({ message: 'You can only update status of your own tasks' });
    }

    const { status, statusNote } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Prevent user from setting status to 'completed' directly — must go through review
    if (req.user.role === 'user' && status === 'completed') {
      return res.status(403).json({
        message: 'You cannot mark a task as completed directly. Please submit it for review.',
      });
    }

    task.status = status;
    if (statusNote !== undefined) task.statusNote = statusNote;

    if (statusNote) {
      task.notes.push({
        content: `Status changed to "${status}": ${statusNote}`,
        createdBy: req.user._id,
      });
    }

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// NEW: User submits task for approval → sets status to 'review'
const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();

    if (!isAssigned) {
      return res.status(403).json({ message: 'You can only submit your own tasks' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Task is already completed' });
    }

    if (task.status === 'review') {
      return res.status(400).json({ message: 'Task is already submitted for review' });
    }

    task.status = 'review';
    task.rejectionReason = ''; // clear any previous rejection reason
    task.notes.push({
      content: '📤 Task submitted for approval',
      createdBy: req.user._id,
    });

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// NEW: Admin/Lead approves task → sets status to 'completed'
const approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'review') {
      return res.status(400).json({ message: 'Task is not pending review' });
    }

    task.status = 'completed';
    task.rejectionReason = '';
    task.notes.push({
      content: '✅ Task approved and marked as completed',
      createdBy: req.user._id,
    });

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// NEW: Admin/Lead rejects task → sets status back to 'in_progress' with reason
const rejectTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'review') {
      return res.status(400).json({ message: 'Task is not pending review' });
    }

    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    task.status = 'in_progress';
    task.rejectionReason = reason.trim();
    task.notes.push({
      content: `❌ Task rejected: ${reason.trim()}`,
      createdBy: req.user._id,
    });

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    task.notes.push({
      content: content.trim(),
      createdBy: req.user._id,
    });

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('notes.createdBy', 'name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    let taskQuery = {};

    if (req.user.role === 'user') {
      taskQuery = { assignedTo: req.user._id };
    }

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      bugTasks,
      reviewTasks,
      overdueTasks,
      recentTasks,
    ] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'pending' }),
      Task.countDocuments({ ...taskQuery, status: 'in_progress' }),
      Task.countDocuments({ ...taskQuery, status: 'completed' }),
      Task.countDocuments({ ...taskQuery, status: 'bug' }),
      Task.countDocuments({ ...taskQuery, status: 'review' }),
      Task.countDocuments({
        ...taskQuery,
        deadline: { $lt: new Date() },
        status: { $nin: ['completed'] },
      }),
      Task.find(taskQuery)
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      bugTasks,
      reviewTasks,
      overdueTasks,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
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
};