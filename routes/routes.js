const exrpess = require('express');
const router = exrpess.Router();
const helpers = require('../_helpers');
const passport = require('../config/passport');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const tweetController = require('../controllers/tweetController');
const multer = require('multer')
const upload = multer({
  dest: 'temp/', fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('請上傳 jpg / jpeg / png 格式的圖片'))
    } cb(null, true)
  }
})

//一般使用者認證
const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) { return next(); }
  res.redirect('/signin');
};

// 管理員認證
const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) { return next(); }
    res.redirect('/');
  }
  res.redirect('/signin');
};

// router.get('/', authenticated, (req, res) => {
//   res.redirect('/tweets');
// });
// router.get('/tweets', authenticated, tweetController.getTweets);

// 註冊&登入
router.get('/signup', userController.signUpPage);
router.post('/signup', userController.signUp);
router.get('/signin', userController.signInPage);
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true,
  }),
  userController.signIn
);

// 推文 -- Liv 新增
router.get('/', authenticated, (req, res) => {
  res.redirect('/tweets');
});
router.get('/tweets', authenticated, tweetController.getTweets);
router.get('/tweets/:id', authenticated, tweetController.getTweet);
router.post('/tweets', authenticated, tweetController.postTweet);
router.put('/tweets/:id', authenticated, tweetController.putTweet);
router.delete('/tweets/:id', authenticated, tweetController.deleteTweet);


// router.get('/', (req, res) => {
//   res.redirect('/tweets');
// });
// router.get('/tweets', tweetController.getTweets);
// router.get('/tweets/:id', tweetController.getTweet);
// router.post('/tweets', tweetController.postTweet);
// router.put('/tweets/:id', tweetController.putTweet);
// router.delete('/tweets/:id', tweetController.deleteTweet);


//管理員控制 -- 心憲
router.get('/admin/signin', adminController.signinPage)
router.post('/admin/signin', passport.authenticate('local', { failureRedirect: '/admin/signin', failureFlash: true }), adminController.signin)
router.get('/admin/tweets', authenticatedAdmin, adminController.tweetsPage)
router.get('/admin/users', authenticatedAdmin, adminController.usersPage)
router.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet)

// 使用者
router.get('/user/:id', authenticated, userController.getUser)
router.get('/user/:id/edit', authenticated, userController.getUserEdit)
router.put('/user/:id/edit', authenticated, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'avatar', maxCount: 1 }
]), userController.putUserEdit)
router.get('/user/:id/setting', authenticated, userController.getUserSetting)


// 登出
router.get('/logout', userController.logOut);

module.exports = router;
