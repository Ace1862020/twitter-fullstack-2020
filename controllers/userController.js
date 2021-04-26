const bcrypt = require('bcryptjs');
const imgur = require('imgur-node-api');
const fs = require('fs');
//const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
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

  signIn: (req, res) => {
    User.findOne({ where: { account: req.body.account } })
      .then((user) => {
        if (!user.dataValues.isAdmin) {
          req.flash('success_msg', '登入成功');
          res.redirect('/tweets');
        } else {
          req.flash('error_msg', '此帳號不是普通用戶')
          res.redirect('/signin')
        }
      })
  },

  logOut: (req, res) => {
    req.flash('success_msg', '登出成功');
    req.logout();
    res.redirect('/signin');
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'account', 'name', 'avatar', 'introduction', 'cover'],
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
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
        description: data.description.substring(0, 100),
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

  getUserEdit: async (req, res) => {
    const userId = helpers.getUser(req).id
    if (userId !== Number(req.params.id)) {
      req.flash('error_msg', '抱歉！你只能編輯自己的個人資訊')
      return res.redirect(`/user/${req.params.id}`)
    }
    const user = await User.findByPk(userId, { raw: true })
    return res.render('edit', { user: user })
  },

  putUserEdit: async (req, res) => {
    const { name, introduction, avatar, cover } = req.body
    const errors = []
    if (!name || !introduction) {
      errors.push({ message: '名稱或自我介紹欄位，不可空白' })
    }
    if (name.length > 50) {
      errors.push({ message: '名稱必須在50字符以內' })
    }
    if (introduction.length > 160) {
      errors.push({ message: '自我介紹，必須在160字符以內' })
    }
    if (errors.length > 0) {
      return res.render('edit', { name, introduction, avatar, cover, errors })
    }
    const images = {}
    const { files } = req
    const uploadImg = path => {
      return new Promise((resolve, reject) => {
        imgur.upload(path, (err, img) => {
          if (err) {
            return reject(err)
          }
          resolve(img)
        })
      })
    }

    const userId = helpers.getUser(req).id

    if (files) {
      const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID.toString()
      imgur.setClientID(IMGUR_CLIENT_ID)
      for (const key in files) {
        images[key] = await uploadImg(files[key][0].path)
      }
    }
    const user = await User.findByPk(userId)
    await user.update({
      name: name,
      introduction: introduction,
      cover: images.cover ? images.cover.data.link : user.cover,
      avatar: images.avatar ? images.avatar.data.link : user.avatar
    })
    req.flash('success_msg', '更新成功')
    return res.redirect(`/user/${user.id}`)
  },

  getUserSetting: async (req, res) => {
    const userId = helpers.getUser(req).id
    const user = await User.findByPk(userId, {
      attributes: ['id', 'account', 'email', 'name'],
    })
    return res.render('setting', { user: user.toJSON() })
  },


};

module.exports = userController;
