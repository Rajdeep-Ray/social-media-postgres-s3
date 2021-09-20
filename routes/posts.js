const postRouter = require('express').Router();
const verifyToken = require('../middlewares/token').verify;
const verifyWithAnonymous = require('../middlewares/token').verifyWithAnonymous;
const db = require('../db/db');

const multer = require('multer');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})

// Get all public posts
postRouter.route('/')
    .get(verifyWithAnonymous, (req, res, next) => {
        console.log(req.token);
        if (req.token.role.includes('super_admin')) {
            db.Posts.findAll()
                .then((posts) => {
                    res.json(posts);
                })
                .catch((err) => {
                    console.log(err.message);
                    res.status(500).send(err.message)
                })
        } else {
            db.Posts.findAll({
                where: {
                    isPrivate: false
                }
            })
                .then((posts) => {
                    res.json(posts);
                })
                .catch((err) => {
                    console.log(err.message);
                    res.status(500).send(err.message)
                })
        }
    })

// Get all my posts
postRouter.get('/my', verifyToken, (req, res, next) => {
    db.Posts.findAll({
        where: {
            userId: req.token.id,
        }
    })
        .then((posts) => {
            res.json(posts);
        })
        .catch((err) => {
            console.log(err.message);
            res.status(500).send(err.message)
        })
})

// Create Post
postRouter.post('/create', verifyToken, multer({ storage: multer.memoryStorage() }).single("image"), (req, res, next) => {

    if (req.file != null) {

        console.log('====With Photo====');
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

            db.Posts.create({
                title: req.body.title,
                desc: req.body.desc,
                userId: req.token.id,
                isPrivate: req.body.isPrivate,

                image: data.Location
            })
                .then((post) => {
                    res.status(200).send(post)
                })
                .catch((err) => {
                    console.log(err.message);
                    res.status(500).send(err.message);
                });

        })
    } else {
        console.log('====Without Photo====');
        db.Posts.create({
            title: req.body.title,
            desc: req.body.desc,
            userId: req.token.id,
            isPrivate: req.body.isPrivate
        })
            .then((post) => {
                res.json(post)
            })
            .catch((err) => {
                console.log(err.message);
                res.status(500).send(err.message)
            })
    }
})

postRouter.route('/:id')
    .get((req, res, next) => {
        db.Posts.findOne({
            where: {
                id: req.params.id
            },
            include: {
                model: db.Users,
            }
        })
            .then((post) => {
                res.json(post)
            })
            .catch((err) => {
                console.log(err.message);
                res.status(500).send(err.message)
            })
    })
    .post(verifyToken, (req, res, next) => {
        db.Posts.findByPk(req.params.id)
            .then((post) => {
                if (post.userId === req.token.id) {
                    if (post.isPrivate) {
                        db.Posts.update({
                            isPrivate: false
                        }, {
                            where: {
                                id: req.params.id
                            }
                        })
                            .then(() => {
                                res.send('Visibility changed to PUBLIC')
                            })
                            .catch((err) => {
                                console.log(err.message);
                                res.status(500).send(err.message)
                            })
                    } else {
                        db.Posts.update({
                            isPrivate: true
                        }, {
                            where: {
                                id: req.params.id
                            }
                        })
                            .then(() => {
                                res.send('Visibility changed to PRIVATE');
                            })
                            .catch((err) => {
                                console.log(err.message);
                                res.status(500).send(err.message)
                            })
                    }
                } else {
                    res.status(403).send("You are not authorized")
                }

            })
            .catch((err) => {
                console.log(err.message);
                res.status(500).send(err.message)
            })
    })
    .put(verifyToken, (req, res, next) => {

        db.Posts.findByPk(req.params.id)
            .then((post) => {
                if (post.userId === req.token.id) {
                    db.Posts.update({
                        title: req.body.title,
                        desc: req.body.desc
                    }, {
                        where: {
                            id: req.params.id
                        }
                    })
                        .then((post) => {
                            res.json(post)
                        })
                        .catch((err) => {
                            console.log(err.message);
                            res.status(500).send(err.message)
                        })
                } else {
                    res.status(403).send("You are not authorized")
                }
            })
    })
    .delete(verifyToken, (req, res, next) => {
        db.Posts.findByPk(req.params.id)
            .then((post) => {
                if (post.userId === req.token.id) {
                    db.Posts.destroy({
                        where: {
                            id: req.params.id
                        }
                    })
                        .then(() => {
                            res.send("Deleted")
                        })
                        .catch((err) => {
                            console.log(err.message);
                            res.status(500).send(err.message)
                        })
                } else {
                    res.status(403).send("You are not authorized")
                }
            })
            .catch((err) => {
                console.log(err.message);
                res.status(500).send(err.message);
            })
    })

// User's all public posts
postRouter.get('/user/:id', (req, res, next) => {

    db.Posts.findAll({
        where: {
            userId: req.params.id,
            isPrivate: false
        }
    })
        .then((posts) => {
            res.json(posts);
        })
        .catch((err) => {
            console.log(err.message);
            res.status(500).send(err.message)
        })
})

postRouter.post('/like/:id', verifyToken, (req, res, next) => {
    db.Posts.findByPk(req.params.id)
        .then((post) => {
            if (post.likedBy.includes(req.token.id)) {
                db.Posts.decrement('likes', {
                    where: {
                        id: req.params.id
                    }
                })
                    .then(() => {
                        // TODO : Pop element from array
                        const _likedBy = post.likedBy;

                        const i = _likedBy.indexOf(req.token.id);
                        if (i > -1) {
                            _likedBy.splice(i, 1);
                        }

                        console.log(_likedBy);

                        db.Posts.update({
                            likedBy: _likedBy
                        }, {
                            where: {
                                id: req.params.id
                            }
                        })
                            .then(() => {
                                res.send('Video UN-LIKED')
                            })
                            .catch((err) => {
                                console.log(err.message);
                                res.status(500).send(err.message)
                            })
                    })
                    .catch((err) => {
                        console.log(err.message);
                        res.status(500).send(err.message)
                    })
            } else {
                db.Posts.increment('likes', {
                    where: {
                        id: req.params.id
                    }
                })
                    .then(() => {
                        // TODO : Push element to array
                        var _likedBy = post.likedBy;
                        _likedBy.push(req.token.id)
                        db.Posts.update({
                            likedBy: _likedBy
                        }, {
                            where: {
                                id: req.params.id
                            }
                        })
                            .then(() => {
                                res.send('Video LIKED')
                            })
                            .catch((err) => {
                                console.log(err.message);
                                res.status(500).send(err.message)
                            })
                    })
                    .catch((err) => {
                        console.log(err.message, "Here");
                        res.status(500).send(err.message)
                    })
            }
        })
        .catch((err) => {
            console.log(err.message);
            res.status(500).send(err.message)
        })
})

module.exports = postRouter;

