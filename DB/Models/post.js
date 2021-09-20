module.exports = (sequelize, DataTypes) => {
    const Posts = sequelize.define('posts', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        desc: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isPrivate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        likedBy: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: []
        }

    })

    Posts.sync({ force: false }).then(() => console.log("`posts` table created"))

    return Posts;
}

