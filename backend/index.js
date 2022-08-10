import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';


dotenv.config();

mongoose
    .connect(process.env.DB_URL)
    .then(() => {console.log('DB is OK')})
    .catch((err) => {console.log('err', err)})

const app = express();
app.use(cors());
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// FILES
app.post('/single-upload', upload.single('file'), (req, res) => {

    if (!req.file.length) {
        return res.status(500).send({
            success: false,
            message: 'You have to select at least 1 file',
        });
    }

    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

app.post('/multiple-upload', upload.array('imagesArray', 10), (req, res) => {

    if (!req.files.length) {
        return res.status(500).send({
            success: false,
            message: 'You have to select at least 1 file',
        });
    }

    if (req.files.length > 2) {
        return res.status(500).send({
            success: false,
            message: 'You have to select maximum 2 files',
        });
    }

    const files = req.files.map((file) => {
        return {
            filePath: `/uploads/${file.originalname}`,
            fileName: file.originalname,
        }
    });

    res.json({
        files,
    });
});

app.listen(process.env.PORT || 4000, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log(`Server is OK PORT is ${process.env.PORT}`)
})