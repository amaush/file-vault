var 
  express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Users = require('../models/users'),
  jwt = require('jsonwebtoken'),
  crypto = require('crypto'),
  config = require('../config');

/*
   router.use(function(req, res, next){
   console.log("Authenticating");
   var token = req.headers['x-auth'];

//decode token
if(token){
jwt.verify(token, config.secret, function(err, decoded){
if(err){
  if(err.name === 'TokenExpiredError'){
    return res.status.(400).json({
      success: false,
      message: 'Token Expired'
      });
    }else if(err.name == 'JsonWebTokenError'){
        return res.status(401).json({
          success: false,
          message: 'Invalid Token'
        });
    }
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
*/

router.post('/login', function(req, res){
  //console.log(req);
  Users.findOne({'email' : req.body.email})
    .select('user_name password').exec(function(err, user){
      if(err){ 
        console.log(err);
        res.status(500).json({success: false, message: 'Could not authenticate user'});
      }
      if(!user){
        res.status(404).json({message : 'Authentication failed. User not found'});
      }else if(user){
        //check if password matches
        var valid_pwd = user.comparePassword(req.body.password);
        if(!valid_pwd){
          res.status(400).json({
            success : false,
            message : 'Authentication failed. Invalid username/password combination'
          });
        }else{
          //user exists and has valid password
          var token = jwt.sign({
            name : user.name,
            email : user.email
          }, config.secret, {
            expires: 100 //time in seconds
          });

          res.json({
            success: true,
            message: 'Token generated',
            token: token
          });
        }
      }
    });
});

router.route('/register')
  .post(function (req, res){
    var user = new Users();

    user.password = req.body.password;
    user.email = req.body.email;
    user.lastLogin = Date.now();
    user.created_on =  Date.now();
    user.modified_on = Date.now();
    user.save(function(err, account){
      if(err){
        console.log(err);
        if(err.code === 11000){
          res.status(401).json({ message : 'account exists'});
        }else{
          res.status(500).json({ message : 'Error ' + err});
        }
      }else{
        res.status(200).json({
          success: true,
          message : 'New account  Created'

        });
      }
    });
  })
  .put(function (req, res){
    var user = new Users();

    User.findbById(req.body.user_id, function(err, user){
      if(err){
        res.status(404).json({success: false,
            message: 'unable to update record'});
      }

      if(req.body.email) user.email = req.body.email;
     
      user.save(function(err){
        if(err){
          console.log(err);
          res.status(500).json({
            success: false,
            message : 'unable to update record'
          });
        }else{
          res.json({
            success: true,
            message : 'updated successfully'
          });
        }
      });
    });
  })


module.exports = router;
