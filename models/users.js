var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    userSchema;


userSchema = new Schema({
  //user_name : { type: String, required: true, index: { unique: true}, 'default': 'anon_user'},
  email : { type : String, unique:true},
  password : { type: String, required: true, select: false},
  created_on : { type : Date, 'default' : Date.now},
  modified_on : Date,
  lastLogin : Date,
  galleries : [{ type : Schema.Types.ObjectId, ref : 'Gallery'}]
});

userSchema.pre('save', function(next){
  var user = this;
  if(!user.isModified('password')){ return next(); }

  bcrypt.hash(user.password, null, null, function(err, hash){
    if(err){ return next(err); }
    user.password = hash;
    next();
  });
});

userSchema.methods.comparePassword = function(password){
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', userSchema);
