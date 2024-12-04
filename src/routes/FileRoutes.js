const express = require('express');
const { uploadFile, getFile, deleteFile } = require('../controller/FileController');

const router = express.Router();

// File upload API
router.post('/upload', uploadFile); 
// File download API
router.get('/:id', getFile);        
// File download API
router.delete('/:id', deleteFile);  

module.exports = router;
