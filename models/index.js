var mongoose = require('mongoose'),


exports.Post = new Schema({
  title: {
    required : true,
    type : String,
    trim : true,
    match : /^([\w ,.!?]{1,100})$/
  },
  url : {
    type : String,
    trime : true,
    max : 1000
  },
  text : {
    type : String,
    trim : true,
    max  : 2000
  },
  comments : [{
    text : {
      type : String, 
      trim : true,
      max : 200
    },
    author : {
      id: {
        type : Schema.Types.ObjectId,
        ref : 'User'
      },
      name : String
    }
  }],
  watches : [{
    type : Schema.Types.ObjectId,
    ref : 'User'
  }],
  likes : [{
    type : Schema.Types.ObjectId,
    ref : 'User'
  }],
  author : {
    id : {
      type : Schema.Types.ObjectId,
      ref : 'User',
      required : true
    },
    name : {
      type : String,
      required : true
    }
  },
  created: { 
    type : Date,
    default: Date.now,
    required : true
  },
  updated : {
    type : Date,
    default: Date.now,
    required : true,
  },
  own : Boolean,
  like : Boolean, 
  watch : Boolean, 
  admin : Boolean, 
  section  : String 
});

exports.User = new Schema({
  firstName: {
    type : String,
    required : true,
    trim : true
  }
  ,lastname : {
    type : String,
    required : true,
    trim : true
  }
  ,displayName : {
    type : String,
    required : true,
    trim : true,
    index : {
      unique : true
    }
  }
  ,password : String
  ,email : {
    type : String,
    required : true,
    trim : true
  }
  ,created : {
    type : Date,
    'default': Date.now
  }
  ,updated: {
    type: Date, 
   'default': Date.now
  }
});



