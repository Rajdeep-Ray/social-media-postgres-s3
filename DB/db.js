const { Sequelize } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: 'localhost',
	dialect: 'postgres'
});

sequelize.authenticate().then(() => {
	console.log("Database Connected 😎");
}).catch(err => {
	console.error('\nUnable to connect to the database 🔥\n');
	console.error(err);
});


const db = {}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Users = require('./models/users')(sequelize, Sequelize);
db.Posts = require('./models/post')(sequelize, Sequelize);

db.Users.hasMany(db.Posts, { onDelete: 'cascade' })
db.Posts.belongsTo(db.Users, { foreignKey: 'userId', onDelete: 'cascade' });


module.exports = db;
