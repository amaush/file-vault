/*
 * filevault.data.js
 * module that fetches photo and sends photos to server 
 *
 */


filevault.data = (function(){
  'use strict';

  var send, initModule, request;

  send = function(request_info){
    var
      file, xhr, token, request_body, body;

    request_body = request_info ? request_info.body : null;
    file = request_body ? request_body.file : null;

    xhr = new XMLHttpRequest();
    xhr.open(request_info.method, request_info.url);

    token = sessionStorage.getItem('x-token');
    if(token){
      console.log('TOKEN: ', token);
      xhr.setRequestHeader('x-auth', token);
    }

    if(!file){
      xhr.setRequestHeader('Content-Type', 'application/json');
      body = JSON.stringify(request_body);
      console.log('request ', body);
    }else{
      body = new FormData();
      body.append('ImgFiles', file, file.name );
    }

    xhr.loadstart = function(e){
      console.log('upload started');
      $(document).trigger({type: request_info.event_name + 'Start', $container : request_body.$progress_container});
    };

    xhr.upload.onprogress = function(e) {
      console.log('upload progress');
      if (e.lengthComputable) {
        //var new_width = ;
        if(file){
          request_body.$progress_container.val(Math.floor(e.loaded/e.total*100));
        }
        //$inner_width.width(new_width*step);
      }
    };

    xhr.onload = function(e){
      console.log('upload finished');
      //$(document).trigger(options.event_name + 'FinishedEvent');
      
      $(document).trigger({ type: request_info.event_name + 'Finished', response : JSON.parse(this.response)});
    };

    xhr.error = function(e){
      console.log('upload error');
      $(document).trigger('uploadErrorEvent');
    };

    xhr.timeout = function(e){
      console.log('upload timeout');
      $(document).trigger('timeOutEvent');
    };

    xhr.loadend = function(e){
      console.log('upload loadend');
      //options.files = null;
    };

    xhr.send(body);
  };

  initModule = function(){};

  return {
    send : send
  };

})();
