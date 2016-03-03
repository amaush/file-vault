var 
  express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  User = require('../models/users.js'),
  jwt = require('jsonwebtoken'),
  config = require('../config');


router.use(function(req, res, next){
  console.log("Authenticating");
  var token = req.body.token;
  
  //decode token
  if(token){
    jwt.verify(token, config.secret, function(err, decoded){
      if(err){
        return res.json({ success: false, message: 'Failed to authenticate token'});
      }else{
        console.log("decoded token: ", token);
        req.decoded = decoded;
      }
    });
  }else{
    //there is no token
    return res.status(403).json({
      success: false,
      message: 'No token provided.'
    });
  }
  next();
});

router.route('/')
  .post(function (req, res){
    
    var user = new User();
    user.user_name = req.body.user_name,
    user.email = req.body.email,
    user.lastLogin = Date.now()
    user.created_on =  Date.now(),
    user.modified_on = Date.now(),
    user.save(function(err, user){
      if(err){
        console.log(err);
        if(err.code === 11000){
          res.json({ message : 'user exists'});
        }else{
          res.json({ message : 'Error ' + err});
        }
      }else{
        res.json({ message : 'New User ' + user.name + ' Created'});
      }
    });
  });

  router.login = function(req, res){
    var entityMap = {
      '&' : '&amp;',
      '<' : '&lt;',
      '>' : '&gt;',
      '"' : '&quot;',
      "'" : '&#39;',
      '/' : '&#x2F;'
    };
    
    function escapeHTML(string){
      return String(string).replace(/[&<>"'\/]/g, function(s){
          return entityMap[s];
          });
    }

    User.findOne({'user_name' : req.body.user_name})
      .select('user_name password').exec(function(err, user){
        if(err){ 
          throw err;  //UNWANTED--kills the application.
        }
        if(!user){
          res.json({message : 'Authentication failed. User not found'});
        }else if(user){
          //check if password matches
          var valid_pwd = user.comparePassword(req.body.password);
          if(!valid_pwd){
            res.json({
              success : false,
              message : 'Authentication failed. Invalid username/password combination'
            });
          }else{
            //user exists and has valid password
            var token = jwt.sign({
              name : user.name,
              email : user.email
            }, config.secret, {
              expiresInMinutes: 1440 //expires 24 hours 
            });

            res.json({
              success: true,
              message: 'Token generated',
              token: token
            });
          }
        }
      });
};


module.exports = router;
