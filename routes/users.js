const userRouter = require('express').Router();
const db = require('../db/db');

userRouter.get('/:id', function (req, res, next) {
	db.Users.findOne({
		where: {
			id: req.params.id,
		},
		include: {
			model: db.Posts
		}
	})
		.then((user) => {
			res.json(user);
		})
		.catch((err) => {
			console.log(err.message);
			res.status(500).send(err.message)
		})
});

module.exports = userRouter;
