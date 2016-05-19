var express = require('express');
var router = express.Router();
var articalModel=require('../model/artical');
/*
* 分页 传参 当前页面 每页的条数
* 结果 当前的数据一共多少页
* */
router.get('/', function(req, res, next) {
    res.render('user/login.html', {
        article:{},
        keywords:{},
        totalPage:{},
        pageNumber:{},
        pageSize:{}
    });
});

module.exports = router;

