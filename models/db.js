var mongoose = require('mongoose'),
    dbURI = 'mongodb://localhost:27017/filevault';

mongoose.connect(dbURI);

mongoose.connection.on('connected', function(err){
  console.log('mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(err){
  console.log('mongoose connection error ' + err);
});

mongoose.connection.on('disconnected', function(err){
  console.log('mongoose disconnected');
});

process.on('SIGINT', function(){
    mongoose.connection.close(function(){
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});

