var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//处理cookie 在res.cookie中设置cookie  req.cookies获取cookie
var cookieParser = require('cookie-parser');
var flash=require('connect-flash');
var bodyParser = require('body-parser');

var session=require('express-session');
var mongoose=require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/gs');
var MongoStore = require('connect-mongo/es5')(session);

require('./util')

var routes = require('./routes/index');
var users = require('./routes/users');
var article=require('./routes/article');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));//设置模板引擎存放的位置
app.set('view engine', 'html');//设置模板引擎
app.engine('html',require('ejs').__express);//设置对html文件的渲染设置
//这个一定要放在设置session的前面
app.use(flash());

app.use(session({
  secret:'gs-blog',
  saveUninitialized:true,
  resave:true,
  /*cookie:{
    maxAge: 1000 // default session expiration is set to 1 hour
  },*/
  //设置session中间件 把session存放到mongo数据库中 取的时候是向库中去session
  store:new MongoStore({url:'mongodb://127.0.0.1:27017/gs'})
}))
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'icon.ico')));



app.use(logger('dev'));
app.use(bodyParser.json());//通过content-type来判断是否有自己来处理
app.use(bodyParser.urlencoded({ extended: false }));
//处理cookie 把请求头中的cookie转成对象，加入一个cookie函数的属性
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//session是是依赖cookie插件的所以要放在cookie下面


app.use(function(req,res,next){
  res.locals.user=req.session.user;
  res.locals.keyword=req.session.keywords
  //flash只要获取一次就会被清空  flash一个值为取值 两个值为设置flash值
  res.locals.success= req.flash('success').toString();
  res.locals.error=req.flash('error').toString();
  res.locals.keywords='';
  res.locals.totalPage=0;
  res.locals.pageNumber=1;
  res.locals.pageSize = 10;
  next()
})


//使用路由 不同路径使用不同的路由 之前已写好
app.use('/', routes);
app.use('/users', users);
app.use('/article',article)

// catch 404 and forward to error handler
//如果经过这个中间件报错的话走错误方法 如果前面都报错的话
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);//走下一个中间件
});

// error handlers
// development error handler
// will print stacktrace
//开发环境处理
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);//设置响应状态码
    res.render('error', {//渲染模板
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
//成产环境处理 正式环境
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.html', {
    message: err.message,
    error: {}//不需要告诉用户那个地方错误
  });
});


module.exports = app;
