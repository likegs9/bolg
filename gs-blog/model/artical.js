var mongoose=require('mongoose')

var articalShema=new mongoose.Schema({
	title:{type:String,required:true},
	content:{type:String,required:true},
	//类型是组件类型 引用 user集合中的id
	user:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
	createAt:{type:Date,default:new Date},
	img:{type:String}
})
var articalModel=mongoose.model('article',articalShema)
module.exports=articalModel;
