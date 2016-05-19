var express = require('express');
var router = express.Router();
var userModel=require('../model/reg.js');
var articalModel=require('../model/artical');
var auth=require('../auth/index');
var path=require('path');
var multer = require('multer');
//处理图片插件
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //指定文件存放目录
        cb(null, '../public/uploads/')
    },
    filename: function (req, file, cb) {
        //指定文件名
        cb(null,Date.now()+path.extname(file.originalname))
    }
})
var upload = multer({ storage: storage });
router.get('/reg',auth.mustNotLogin, function(req, res, next) {
  res.render('user/reg.html', {
  });
});
//注册 必须是没登录的才能访问该页面
router.post('/reg',auth.mustNotLogin,upload.single('photo'),function(req, res, next){
    var user=req.body;//是个对象
    var file=req.file;
    if(user.password!=user.passwordagain){
         req.flash('success','密码输入不一致')
         return res.redirect('back');
     }
     delete user.passwordagain;
     user.password=blogUtil.md5(user.password);
     if(file){
         user.avatar=path.join('/uploads',file.filename)
     }else{
         user.avatar='https://secure.gravatar.com/avatar/'+blogUtil.md5(user.email)+'?s=200'
     }
     //user的属性名 一定要跟数据库定的属性名一致

     userModel.create(user,function(err,doc){
         if(err){
             console.log(err)
             req.flash('error','注册失败')
             return res.redirect('back')
         }else{
             req.session.user=doc;
             //为什么这样管用在app里不管用
             req.session.cookie.maxAge=1000*60*60
             //如果有两个会一起输出 用逗号隔开
             req.flash('success','注册成功')
             req.flash('success','哈哈哈哈')
             res.redirect('/users/index')
         }
     })
});
//用户登录
router.get('/login',auth.mustNotLogin, function(req, res, next) {
  res.render('user/login.html', {});
});
router.post('/login',function(req, res, next) {
  var user=req.body;
  user.password=blogUtil.md5(user.password);
    userModel.findOne(user, function (err, doc){
    // 查询符合age等于6的第一条数据
        //console.log(111)
    if(err){
      req.flash('error','登录失败');
      return res.redirect('back');
    }else{
      //doc没有值是为什么？？
      req.session.user=doc;
      req.session.cookie.maxAge=1000*60*60
      req.flash('success','登录成功');
      req.flash('success','哈哈哈哈');
      res.redirect('/users/index');
     }
  });

});
//登录后访问个人首页
router.get('/index',auth.mustLogin,function(req, res, next) {
     var userdb=req.session.user;
    userModel.find({_id:userdb._id},function(err,doc){
        userdb=doc[0]
    });

     var keywords=req.query.keywords;
     //console.log(keywords)
     var search=req.query.search;
     var pageNumber=parseInt(req.query.pageNumber)||1;//当前页码
     var pageSize=parseInt(req.query.pageSize)||2//当前页条数
     var queryObj={};
     if(search){
             if(keywords){
                 req.session.keywords=keywords;
                 keywords=req.session.keywords;
                 var reg=new RegExp(keywords,'i');
                 queryObj={$or:[{title:reg},{content:reg}]}
                 //console.log(queryObj)
             }else{
                 keywords="";
                 queryObj={}
             }
     }
    queryObj.user = userdb._id;
     //如果关键字存在 就按关键字查询 不在就查找全部
    //.populate('user') 把user 转为id对应的对象
    articalModel.find(queryObj).skip((pageNumber-1)*pageSize).limit(pageSize).populate('user').exec(function(err,articles){
     //取得这个条件有多少条
        //console.log(articles)
            articalModel.count(queryObj,function(err,count){
                //console.log(err)
                if(err){
                    req.flash('error',err);
                    res.redirect('/users/index')
                }else{
                    res.render('index.html', {
                        articles: articles,
                        keywords: keywords,
                        //一共有多少页= 一共多少条除以每页几条
                        totalPage: Math.ceil(count / pageSize),
                        pageNumber: pageNumber,
                        pageSize: pageSize,
                        //不能用article的user如果文章为空 页面渲染会报错
                        userdb: userdb,
                        all:count
                    })
                }
            });
            req.session.keywords=null
     })
});
//退出登录
router.get('/logout',auth.mustLogin,function(req, res, next) {
  req.session.user=null
  res.redirect('/');
});

//个人设置查看详情
router.get('/setting',auth.mustLogin,function(req, res, next) {
    var user=req.session.user;
    userModel.findById(user._id,function(err,doc){
       // console.log(doc)
        res.render('user/user-setting.html', {
            user:doc
        });
    })
});
//个人设置修改
router.get('/correct',auth.mustLogin,function(req, res, next) {
    var user=req.session.user;
    userModel.findById(user._id,function(err,doc){
        res.render('user/user-correct.html', {
            user:doc
        });
    })
});
router.post('/correct',auth.mustLogin,upload.single('avatar'),function(req, res, next) {
    var user=req.session.user;
    var id=user._id;
    var file=req.file;
    var body=req.body;
    var update={
        username:body.username,
        email:body.email,
        city:body.city
    }
    //avatar
    if(file){
        update.avatar=path.join('/uploads',file.filename)
    }
   userModel.update({_id:id},{$set:update},function(err,doc){
       if(err){
           req.flash('error',err);
           console.log('55')
           res.redirect('back')
       }else{
           req.flash('success','ok');
           res.redirect('/users/setting')
       }

    })
});
module.exports = router;
