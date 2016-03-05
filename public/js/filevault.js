/*
 * filevault.js
 * Root namespace
 */
 

var filevault = (function () {
  var initModule = function($container){
    //initialise master controller
    filevault.main.initModule($container);    
  };
   
   return { initModule: initModule };
 })();

