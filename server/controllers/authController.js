import User from '../models/usersModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password, role, skills, bio, profilePicture } = req.body;
  
  try {
    // console.log("name", name)
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const user = await User.create({
      name,
      email,
      password: hashedPassword,  // Store hashed password
      role,
      skills,
      bio,
      profilePicture,
    });

    const token = generateToken(user._id);

    // Store token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax', // Changed from 'Strict' to 'lax' for development
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // console.log('Login attempt for:', email);

  try {
    const user = await User.findOne({ email });
    // console.log('User found:', user ? 'Yes' : 'No');

    if (user && (await bcrypt.compare(password, user.password))) {
      // console.log('Password verified successfully');
      const token = generateToken(user._id);
      // console.log('Token generated');

      // Store token in an HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
        path: '/', // Ensure cookie is available for all paths
      });
      console.log('Cookie set');

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token // Include token in response
      });
      console.log('Login response sent');
    } else {
      console.log('Invalid credentials');
      res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Logout User
export const logoutUser = async (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Expire immediately
      sameSite: 'Strict',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  const { name, email, bio, profilePicture } = req.body;

  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const updatedUser = await user.save();
    
    // Return user without password
    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      skills: updatedUser.skills,
      isVerifiedMentor: updatedUser.isVerifiedMentor,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Check if there are any users in the database
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Send the users data as a response
    return res.status(200).json(users);
  } catch (error) {
    // Handle any errors that might occur during the database operation
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};