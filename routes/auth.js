const authRouter = require('express').Router();
const User = require('../db/db').Users;
const bcrypt = require('bcrypt');

const jwt = require('../middlewares/token')

authRouter.post('/signup', (req, res, next) => {

    User.findOne({
        where: {
            email: req.body.email
        }
    })
        .then((user) => {
            if (user === null) {
                bcrypt.hash(req.body.password, 10)
                    .then((hash) => {

                        User.create({
                            name: req.body.name,
                            email: req.body.email,
                            password: hash,
                            phone: req.body.phone,
                            bio: req.body.bio
                        })
                            .then((user) => {
                                res.json({
                                    token: jwt.token({ id: user.id, role: user.role })
                                });
                            })
                            .catch((err) => {
                                console.log(err.message);
                                res.status(500).json({ error: err.message })
                            })
                    })
                    .catch((err) => {
                        console.log(err.message);
                        res.status(500).json({ error: err.message })
                    })
            }
            else {
                console.log("Email already exists");
                res.status(403).json({ error: "Email already exists" })
            }
        })
        .catch((err) => {
            console.log(err.message);
            res.status(500).json({ error: err.message })
        })

})


authRouter.post('/signin', (req, res, next) => {

    User.findOne({
        where: {
            email: req.body.email
        }
    })
        .then((user) => {
            if (user === null) {
                console.log("User not Found");
                res.status(403).json({ error: "User not Found" })
            }
            else {
                bcrypt.compare(req.body.password, user.password)
                    .then((result) => {
                        console.log(user.role);
                        if (result) {
                            res.json({
                                token: jwt.token({ id: user.id, role: user.role })
                            });
                        } else {
                            res.send("Incorrect passwprd")
                        }
                    })
            }
        })

})

module.exports = authRouter;