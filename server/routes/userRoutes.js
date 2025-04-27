import express from 'express';
import User from '../models/usersModel.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get all mentors
router.get('/mentors', protect, admin, async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }); // Find users with role "mentor"
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch mentors', error: error.message });
  }
});

// Route to get all learners
router.get('/learners', protect, admin, async (req, res) => {
  try {
    const learners = await User.find({ role: 'learner' }); // Find users with role "learner"
    res.status(200).json(learners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch learners', error: error.message });
  }
});

// Route to request verification
router.post('/request-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'mentor') {
      return res.status(400).json({ message: 'Only mentors can request verification' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.verificationRequested) {
      return res.status(400).json({ message: 'Verification request already pending' });
    }

    user.verificationRequested = true;
    user.verificationRequestDate = new Date();
    await user.save();

    res.status(200).json({ message: 'Verification request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit verification request', error: error.message });
  }
});

// Route to delete a mentor
router.delete('/mentor/:id', protect, admin, async (req, res) => {
  const { id } = req.params;
  try {
    const mentor = await User.findById(id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Ensure the user is a mentor before deleting
    if (mentor.role !== 'mentor') {
      return res.status(400).json({ message: 'User is not a mentor' });
    }

    await mentor.deleteOne(); // Remove mentor from the database
    res.status(200).json({ message: 'Mentor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete mentor', error: error.message });
  }
});

// Route to delete a learner
router.delete('/learner/:id', protect, admin, async (req, res) => {
  const { id } = req.params;
  try {
    const learner = await User.findById(id);
    if (!learner) {
      return res.status(404).json({ message: 'Learner not found' });
    }

    // Ensure the user is a learner before deleting
    if (learner.role !== 'learner') {
      return res.status(400).json({ message: 'User is not a learner' });
    }

    await learner.deleteOne(); // Remove learner from the database
    res.status(200).json({ message: 'Learner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete learner', error: error.message });
  }
});

export default router;
