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

userRouter.post('/makeAdmin/:id', (req, res, next) => {
	db.Users.findByPk(req.params.id)
		.then((user) => {
			if (user.role.includes('super_admin')) {
				res.send("Already ADMIN");
			}
			else {
				var _roles = user.role;
				_roles.push('super_admin')

				db.Users.update({
					role: _roles
				}, {
					where: {
						id: req.params.id
					}
				})
					.then(() => {
						res.send("USER ROLE Updated!")
					})
					.catch((err) => {
						console.log(err.message);
						res.status(500).send(err.message)
					})
			}

		})
		.catch((err) => {
			console.log(err.message);
			res.send("USER not found!")
		})

})

userRouter.post('/revokeAdmin/:id', (req, res, next) => {
	db.Users.findByPk(req.params.id)
		.then((user) => {
			//TODO : Revoke admin access
			if (user.role.includes('super_admin')) {
				const _roles = user.role;

				const i = _roles.indexOf("super_admin");
				if (i > -1) {
					_roles.splice(i, 1);
				}

				console.log(_roles);

				db.Users.update({
					role: _roles
				}, {
					where: {
						id: req.params.id
					}
				})
					.then(() => {
						res.send("USER ROLE Updated!")
					})
					.catch((err) => {
						console.log(err.message);
						res.status(500).send(err.message)
					})
			}
			else {
				res.send("Not ADMIN")
			}

		})
		.catch((err) => {
			console.log(err.message);
			res.send("USER not found!")
		})

})

module.exports = userRouter;
