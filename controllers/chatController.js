const helpers = require('../_helpers');
const db = require('../models');
const User = db.User;
const Tweet = db.Tweet;
const Reply = db.Reply;
const Like = db.Like;
const Followship = db.Followship
const PublicChar = db.PublicChar

const chatController = {

  getPublicChar: (req, res) => {
    //PublicChar.findAll({
    //  raw: true,
    //  nest: true,
    //  include: [User]
    //}).then(publicChat => {
    //  let public = true
    //  return res.render('chat', {
    //    publicChat: publicChat,
    //    public: public
    //  })
    //})
    return res.render('chat')
  },


}

module.exports = chatController