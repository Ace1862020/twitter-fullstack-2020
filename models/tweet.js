'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define('Tweet', {
    UserId: DataTypes.INTEGER,
    description: DataTypes.TEXT,
  }, {});
  Tweet.associate = function (models) {
    Tweet.belongsTo(models.User);
    Tweet.hasMany(models.Reply);
    Tweet.hasMany(models.Like);
    Tweet.belongsToMany(models.User, {
      through: models.Reply,
      foreignKey: "TweetId",
      as: "ReplyUsers"
    });
    Tweet.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'TweetId',
      as: 'LikeUsers'
    })
  };
  return Tweet;
};
