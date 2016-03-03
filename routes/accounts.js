var 
  express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Accounts = require('../models/accounts'),
  jwt = require('jsonwebtoken'),
  crypto = require('crypto'),
  config = require('../config');

/*
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
*/

router.route('/login')
  .get(function(req, res){
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

      Accounts.find({'email' : req.body.email})
        .select('user_name password').exec(function(err, account){
          if(err){ 
            console.log(err);
            res.status(400).json({success: false, message: 'Account email exists in database'});
          }
          if(!account){
            res.json({message : 'Authentication failed. Account not found'});
          }else if(account){
            //check if password matches
            var valid_pwd = account.comparePassword(req.body.password);
            if(!valid_pwd){
              res.status(400).json({
                success : false,
                message : 'Authentication failed. Invalid username/password combination'
              });
            }else{
              //user exists and has valid password
              var token = jwt.sign({
                name : account.name,
                email : account.email
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
    });

router.route('/register')
  .post(function (req, res){
    var account = new Accounts();

    account.account_name = req.body.user_name;
    account.password = req.body.password;
    account.email = req.body.email;
    account.lastLogin = Date.now();
    account.created_on =  Date.now();
    account.modified_on = Date.now();
    account.save(function(err, account){
      if(err){
        console.log(err);
        if(err.code === 11000){
          res.json({ message : 'account exists'});
        }else{
          res.json({ message : 'Error ' + err});
        }
      }else{
        res.json({ message : 'New account ' + account.name + ' Created'});
      }
    });
  });
  
module.exports = router;
