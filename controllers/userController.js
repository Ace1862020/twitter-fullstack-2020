const bcrypt = require('bcryptjs');
const helpers = require('../_helpers');
const db = require('../models');
const User = db.User;
const Tweet = db.Tweet;
const Reply = db.Reply;
const Like = db.Like;


const userController = {
  signUpPage: (req, res) => {
    return res.render('signup');
  },

  signUp: async (req, res) => {
    const { account, name, email, password, passwordCheck } = req.body;
    const errors = [];
    if (password !== passwordCheck) {
      errors.push({ message: '密碼與確認密碼不相符' });
    }
    if (errors.length > 0) {
      return res.render('signup', {
        account,
        name,
        email,
        password,
        passwordCheck,
        errors,
      });
    }
    try {
      const userAccount = await User.findOne({ where: { account } });
      const userEmail = await User.findOne({ where: { email } });
      if (userAccount) {
        req.flash('error_msg', '帳號已被註冊過了');
        return res.redirect('/signup');
      }
      if (userEmail) {
        req.flash('error_msg', 'Email已被註冊過了');
        return res.redirect('/signup');
      }
      await User.create({
        account: account,
        name: name,
        email: email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
      });
      req.flash('success_msg', '帳號註冊成功');
      return res.redirect('/signin');
    } catch (error) {
      console.log(error);
    }
  },

  signInPage: (req, res) => {
    return res.render('signin');
  },

  signIn: async (req, res) => {
    const user = await User.findOne({ account: req.body.account })
    if (!user.dataValues.isAdmin) {
      req.flash('success_msg', '登入成功');
      res.redirect('/tweets');
    } else {
      req.flash('error_msg', '此帳號不是普通用戶')
      res.render('signin')
    }
  },

  logOut: (req, res) => {
    req.flash('success_msg', '登出成功');
    req.logout();
    res.redirect('/signin');
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'account', 'name', 'avatar', 'introduction', 'cover']
      })
      const tweets = await Tweet.findAll({
        raw: true,
        nest: true,
        include: [
          { model: Reply, include: [User] },
          Like
        ],
        where: { UserId: req.params.id }
      })
      const tweetsData = await tweets.map(data => ({
        description: data.description,
        createdAt: data.createdAt,
        repliesCount: data.Replies.length,
        likesConut: data.Likes.length,
      }))
      return res.render('user', {
        user: user.toJSON(),
        tweetsData: tweetsData
      })
    } catch (err) {
      console.log(err)
    }
  },

  getUserEdit: (req, res) => {

  }
};

module.exports = userController;
