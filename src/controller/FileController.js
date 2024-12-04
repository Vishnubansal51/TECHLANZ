const multer = require('multer');
const File = require('../models/File');
const path = require('path');

const fs = require('fs');
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_DIR || 'uploads'); 
    },

    //filename
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); 
    }
});

// Specifiv Filetype allowed 
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

// Multer middleware
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter
}).single('file'); 


//upload
const uploadFile = (req, res) => {

    upload(req, res, async (err) => {
        if (err) {
            // console.error('Multer error:', err);
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: 'File too large or other Multer error.' });
            }
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

//  console.log('Uploaded file metadata:', req.file);
        try {
            // Extract metadata from uploaded file
            const { filename, mimetype, size } = req.file;

            // Save metadata to MongoDB
            const fileData = new File({
                filename,
                fileType: mimetype,
                fileSize: size,
                uploadTimestamp: new Date()
            });

            const savedFile = await fileData.save();

            res.status(200).json({
                message: 'File uploaded successfully.',
                fileId: savedFile._id,
                metadata: savedFile
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({ error: 'Error saving file metadata.' });
        }
    });
};


//download
const getFile = async (req, res) => {
    try {
        // Find the file by its ID in the database
        const fileId = req.params.id;
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ error: 'File not found.' });
        }


        const filePath = path.join(__dirname, '..', '..', 'uploads', file.filename);


        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server.' });
        }

        res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
        res.setHeader('Content-Type', file.fileType);

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Error retrieving the file.' });
    }
};

// delete
const deleteFile = async (req, res) => {
    try {
        const fileId = req.params.id;


        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ error: 'File not found.' });
        }

  
        const filePath = path.join(__dirname, '..', '..', 'uploads', file.filename);


        fs.unlink(filePath, async (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error deleting the file from server.' });
            }


            await File.findByIdAndDelete(fileId);

            res.status(200).json({ message: 'File deleted successfully.' });
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Error deleting the file.' });
    }
};

module.exports = { uploadFile, getFile, deleteFile, upload };
