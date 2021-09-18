const uploadRouter = require('express').Router();
const verifyToken = require('../middlewares/token').verify;
const db = require('../db/db');

const multer = require('multer');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})


uploadRouter.post('/profile', verifyToken, multer({ storage: multer.memoryStorage() }).single("image"), (req, res, next) => {
    let myFile = req.file.originalname.split(".")
    const fileType = myFile[myFile.length - 1]

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid()}.${fileType}`,
        Body: req.file.buffer
    }

    s3.upload(params, (error, data) => {
        if (error) {
            res.status(500).send(error)
        }

        db.Users.update({
            profile_pic: data.Location
        }, {
            where: {
                id: req.token.id
            }
        }).then(() => {
            res.status(200).send(data)
        }).catch((err) => {
            console.log(err.message);
            res.status(500).send(err.message);
        });

    })

})

module.exports = uploadRouter;