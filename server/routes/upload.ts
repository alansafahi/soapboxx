import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAuthenticated } from '../auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'community-logos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `community-logo-${timestamp}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  }
});

// Community logo upload endpoint
router.post('/community-logo', isAuthenticated, upload.single('logo'), (req: any, res) => {
  try {
    console.log('Logo upload attempt - User:', req.session?.userId, 'File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Generate the URL for the uploaded file
    const logoUrl = `/uploads/community-logos/${req.file.filename}`;
    
    console.log('Logo uploaded successfully:', logoUrl);
    
    res.json({ 
      success: true,
      logoUrl,
      message: 'Logo uploaded successfully' 
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload logo' 
    });
  }
});

export { router as uploadRoutes };