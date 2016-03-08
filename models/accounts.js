var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    accountSchema;


accountSchema = new Schema({
  account_name : { type: String, required: true, index: { unique: true}, 'default': 'anon_user'},
  email : { type : String, unique:true},
  password : { type: String, required: true, select: false},
  created_on : { type : Date, 'default' : Date.now},
  modified_on : Date,
  lastLogin : Date,
  galleries : [{ type : Schema.Types.ObjectId, ref : 'Gallery'}]

});

accountSchema.pre('save', function(next){
  var account = this;

  if(!account.isModified('password')){ return next(); }

  bcrypt.hash(account.password, null, null, function(err, hash){
    if(err){ return next(err); }
    account.password = hash;
    next();
  });
});

accountSchema.methods.comparePassword = function(password){
  var account = this;
  return bcrypt.compareSync(password, account.password);
};

module.exports = mongoose.model('Account', accountSchema);
