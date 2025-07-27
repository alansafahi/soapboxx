import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

// Community logo upload endpoint - with authentication middleware
router.post('/community-logo', (req: any, res, next) => {
  // Check authentication before processing file
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  next();
}, upload.single('logo'), (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Generate the URL for the uploaded file
    const logoUrl = `/uploads/community-logos/${req.file.filename}`;
    
    res.json({ 
      success: true,
      logoUrl,
      message: 'Logo uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload logo' 
    });
  }
});

export { router as uploadRoutes };