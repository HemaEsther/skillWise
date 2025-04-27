import asyncHandler from 'express-async-handler';
import Class from '../models/classModel.js';


export const createClass = asyncHandler(async (req, res) => {
  const { title, description, category, contentType, contentUrl, price, tags } = req.body;

  // Validate required fields
  if (!title || !description || !category || !contentType) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate content type and URL
  if (contentType !== 'live' && !contentUrl) {
    res.status(400);
    throw new Error('Content URL is required for non-live content');
  }

  // Validate live sessions for verified mentors only
  if (contentType === 'live' && !req.user.isVerifiedMentor) {
    res.status(403);
    throw new Error('Only verified mentors can create live sessions');
  }

  // Validate paid classes for mentors only
  if (price > 0 && req.user.role !== 'mentor') {
    res.status(403);
    throw new Error('Only mentors can create paid classes');
  }

  const classData = {
    title,
    description,
    category,
    contentType,
    contentUrl: contentType === 'live' ? null : contentUrl,
    price: price || 0,
    isPaid: price > 0,
    mentor: req.user._id,
    tags: tags || []
  };

  const newClass = await Class.create(classData);
  res.status(201).json(newClass);
});

// Get all classes with filtering and pagination
export const getClasses = async (req, res) => {
  const { 
    tags, 
    category, 
    isPaid, 
    minPrice, 
    maxPrice, 
    mentor,
    page = 1, 
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    const filter = {};

    // Apply filters
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    if (category) {
      filter.category = category;
    }

    if (isPaid !== undefined) {
      filter.isPaid = isPaid === 'true';
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (mentor) {
      filter.mentor = mentor;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const classes = await Class.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('mentor', 'name email profilePicture');

    // Get total count for pagination
    const total = await Class.countDocuments(filter);

    res.status(200).json({
      classes,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a single class by ID
export const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('mentor', 'name email profilePicture bio skills')
      .populate('reviews.user', 'name profilePicture');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json(classData);

  } catch (error) {
    console.error('Error fetching class:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update a class
export const updateClass = async (req, res) => {
  const { title, description, category, contentType, contentUrl, price, tags } = req.body;

  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Ensure that the logged-in user is the mentor who created the class
    if (classData.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this class' });
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['programming', 'design', 'marketing', 'business', 'personal development', 'other'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Validate contentType if provided
    if (contentType) {
      const validContentTypes = ['live', 'video', 'uploadable'];
      if (!validContentTypes.includes(contentType)) {
        return res.status(400).json({ message: 'Invalid content type' });
      }
    }

    // Validate contentUrl for non-live content
    if (contentType === 'video' || contentType === 'uploadable') {
      if (!contentUrl) {
        return res.status(400).json({ message: 'Content URL is required for non-live content' });
      }
    }

    // Update fields
    if (title) classData.title = title;
    if (description) classData.description = description;
    if (category) classData.category = category;
    if (contentType) classData.contentType = contentType;
    if (contentUrl) classData.contentUrl = contentUrl;
    if (price !== undefined) {
      classData.price = price;
      classData.isPaid = price > 0;
    }
    if (tags) classData.tags = tags;

    const updatedClass = await classData.save();
    res.status(200).json(updatedClass);

  } catch (error) {
    console.error('Error updating class:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete a class
export const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Ensure that the logged-in user is the mentor who created the class
    if (classData.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this class' });
    }

    // Use deleteOne instead of remove (which is deprecated)
    await Class.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ message: 'Class removed successfully' });

  } catch (error) {
    console.error('Error deleting class:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Enroll in a class
export const enrollInClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is already enrolled
    if (classData.enrolledStudents?.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already enrolled in this class' });
    }

    // Check if class is full
    if (classData.maxStudents && classData.enrolledStudents?.length >= classData.maxStudents) {
      return res.status(400).json({ message: 'This class is full' });
    }

    // Add user to enrolled students
    if (!classData.enrolledStudents) {
      classData.enrolledStudents = [];
    }
    classData.enrolledStudents.push(req.user.id);

    await classData.save();

    res.status(200).json({ message: 'Successfully enrolled in the class' });

  } catch (error) {
    console.error('Error enrolling in class:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// check enrollment(yes  or no)
export const checkEnrollment = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is enrolled
    const isEnrolled = classData.enrolledStudents?.includes(req.user.id);

    if (!isEnrolled) {
      return res.status(404).json({ message: 'Not enrolled in this class' });
    }

    return res.status(200).json({ message: 'User is enrolled in this class' });

  } catch (error) {
    console.error('Error checking enrollment:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// Get enrolled classes for a user
export const getEnrolledClasses = async (req, res) => {
  try {
    const classes = await Class.find({ enrolledStudents: req.user._id })
      .populate('mentor', 'name email profilePicture')
      .sort('-createdAt');

    res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching enrolled classes:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get created classes for a mentor
export const getCreatedClasses = async (req, res) => {
  try {
    const classes = await Class.find({ mentor: req.user._id })
      .populate('mentor', 'name email profilePicture')
      .sort('-createdAt');

    res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching created classes:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Unenroll from a class
export const unenrollFromClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is enrolled
    if (!classData.enrolledStudents?.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not enrolled in this class' });
    }

    // Remove user from enrolled students
    classData.enrolledStudents = classData.enrolledStudents.filter(
      studentId => studentId.toString() !== req.user.id
    );

    await classData.save();

    res.status(200).json({ message: 'Successfully unenrolled from the class' });

  } catch (error) {
    console.error('Error unenrolling from class:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// Rate a class
export const rateClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Ensure user hasn't already rated this class
    const existingRating = classData.reviews.find(review => review.user.toString() === req.user._id.toString());
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this class' });
    }

    // Add the new rating
    classData.reviews.push({
      user: req.user._id,
      rating: req.body.rating,
      createdAt: new Date(),
    });

    // Update average rating
    const averageRating = classData.reviews.reduce((acc, review) => acc + review.rating, 0) / classData.reviews.length;
    classData.rating = averageRating;

    await classData.save();

    res.status(200).json({ message: 'Rating submitted successfully', averageRating });
  } catch (error) {
    console.error('Error rating class:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// controllers/classController.js
import { RoomServiceClient } from 'livekit-server-sdk';

const livekitHost = process.env.LIVEKIT_HOST || 'wss://play-um2ffagk.livekit.cloud';
const apiKey = process.env.LIVEKIT_API_KEY || 'your_api_key';
const apiSecret = process.env.LIVEKIT_API_SECRET || 'your_api_secret';

const roomServiceClient = new RoomServiceClient(
  livekitHost,
  apiKey,
  apiSecret
);

export const startLiveSession = async (req, res) => {
  console.log("classId", classId)
  const { classId } = req.params;
 

  try {
    // Create a room for the class to start the live session
    const room = await roomServiceClient.createRoom({
      name: `class-${classId}`,
      emptyTimeout: 30,  // Optional: Set the timeout for empty rooms
      maxParticipants: 100,  // Optional: Set the max number of participants
    });

    res.json({
      success: true,
      message: 'Live session started successfully',
      roomName: room.name,
    });
  } catch (error) {
    console.error('Error starting live session:', error);
    res.status(500).json({
      error: 'Failed to start live session: ' + error.message,
    });
  }
};


