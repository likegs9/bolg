var express = require('express');
var router = express.Router();
var articalModel=require('../model/artical');
var userModel=require('../model/reg.js');
var path=require('path');
var auth=require('../auth/index');
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

router.get('/add',auth.mustLogin, function(req, res, next) {
	console.log(1)
	res.render('article/add.html', {
		//一共有多少页= 一共多少条除以每页几天
		article:{},
		keywords:{},
		totalPage:{},
		pageNumber:{},
		pageSize:{}
	});
});

//upload.single('img') 参数放的是你在表单中图片的name名字
//如果提交文章的时候 req.body._id没有值的话说明就是新添加文章，如果有值的话就是更新文章
router.post('/add',auth.mustLogin,upload.single('img'),function(req, res, next) {
	var artical=req.body;
	var user=req.session.user;
	var file=req.file;
	//判断有没有图片 有图片就给artical加上img属性
	if(file){
		artical.img=path.join('/uploads',file.filename);
	}
	var _id=req.body._id;
	if(_id){//修改
		//如果id存在 新建个对象以便整体更新
		var update={
			title:artical.title,
			content:artical.content
		}
		//如果请求体里有图片 就往新对象里添加img属性
		if(artical.img){
			update.img=artical.img
		}
		//查找对应的id更新部分内容
		articalModel.findByIdAndUpdate(_id,{$set:update},function(err,doc){
			if(err){
				console.log(err)
				req.flash('error','更新文章失败')
				return res.redirect('back');
			}else{
				//更新成功就返回文章详情页面
				req.flash('success','更新文章成功');
				res.redirect('/article/detail/'+_id);
			}
		})
	}else{//新增
		//必须要获取用户注册登录时的id 用这个id在articel库中去找user的库
		artical.user=user._id
		console.log(artical._id.length,222222);
		if(artical._id.length=="0"){
			var newArticle={
				title:artical.title,
				content:artical.content,
				user:artical.user
			}
			if(artical.img){
				newArticle.img=artical.img
			}
			//获取文章创建时间更改不管用 设计数据库表的时候数据库保存的是
			articalModel.create(newArticle,function(err,article){
				if(err){
					console.log(err)
					req.flash('error','发表文章失败')
					return res.redirect('back');
				}else{
					req.flash('success','发表文章成功');
					res.redirect('/users/index');
				}
			 })
		}
	}
});
//文章详情页
router.get('/detail/:id',function(req, res, next) {
	var _id=req.params.id;
	console.log(_id)
	articalModel.findById(_id).populate('user').exec(function(err,article){
		if(err&&!article){
			req.flash('error','文章不存在')
		}else{
			//路径不要加/ 刚开始的时候
			console.log(1)
			res.render('article/detail.html',{
				article:article,
				keywords:{},
				totalPage:{},
				pageNumber:{},
				pageSize:{}
			})
		}
	})
});
//文章详情编辑 跳转到增加文章页面 重用一个页面 给文章里面的value赋值
router.get('/edit/:id',function(req, res, next) {
	var _id=req.params.id;
	//找到对应的文章id  把user转成对象（原先是user表里的id号）
	articalModel.findById(_id).populate('user').exec(function(err,article){
		if(err&&!article){
			req.flash('error','操作错误')
		}else{
			//路径不要加/ 刚开始的时候
			//获取到对应的文章内容 传到增加文章页面
			res.render('article/add.html',{
				article:article,
				keywords:{},
				totalPage:{},
				pageNumber:{},
				pageSize:{}
			})
		}
	})
});

//删除对应id的文章
router.get('/delete/:id',function(req, res, next) {
	var _id=req.params.id
	articalModel.findByIdAndRemove(_id,function(err,result){
		if(err){
			console.log(err)
			req.flash('error','删除文章失败');
			res.redirect('back');
		}else{
			//路径不要加/ 刚开始的时候
			console.log(result)
			res.redirect('/users/index');
		}
	})
});

//必须得导出
module.exports = router;

