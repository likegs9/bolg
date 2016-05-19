var mongoose=require('mongoose');
var userModel=mongoose.model('user',new mongoose.Schema({
    username:{type:String,required:true},
	email:{type:String,required:true},
	password:{type:String,required:true},
	createAt:{type:Date,default:(new Date).toLocaleString()},
	city:{type:String,default:'未填'},
	avatar:{type:String,required:true}
}))
module.exports=userModel;