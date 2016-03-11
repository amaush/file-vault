/*
 * filevault.data.js
 * module that fetches photo and sends photos to server 
 *
 */


filevault.data = (function(){
  'use strict';

  var 
    initModule, send;
  
  send = function(request_info){
    var
      request, file, xhr, token, request_body, body,
      onProgressHandler,  onLoadHandler, onErrorHandler, onLoadStartHandler, onTimeoutHandler, onLoadEnd;


    request_body = request_info ? request_info.body : null;
    file = request_body ? request_body.file : null;
    console.log(request_info);

    xhr = new XMLHttpRequest();

    xhr.onloadstart = function(){
      //console.log('upload started');
      //$(document).trigger({ type: request_info.event_name });
      $(document).trigger({ type: request_info.event_name + 'Start', $progress_bar :request_body ? request_body.$progress_bar: null});
    };
    xhr.onload = function(){
      console.log('upload finished');
      $(document).trigger({ type: request_info.event_name + 'Finished', response : JSON.parse(this.response), $progress_bar : request_body ? request_body.$progress_bar: null });
    };

    xhr.upload.onprogress = function(e) {
      //console.log('upload progress');
      if (e.lengthComputable) {
        if(file){
          request_body.$progress_bar.val(Math.floor(e.loaded/e.total*100));
        }
      }
    };

    xhr.addEventListener('error', onErrorHandler, false);

    xhr.open(request_info.method, request_info.url);

    token = sessionStorage.getItem('x-token');
    if(token){
      console.log('TOKEN: ', token);
      xhr.setRequestHeader('x-auth', token);
    }

    if(!file){
      xhr.setRequestHeader('Content-Type', 'application/json');
      body = JSON.stringify(request_body);
      console.log('request ', request_info);
    }else{
      body = new FormData();
      body.append('ImgFiles', file, file.name );
    }

    onErrorHandler = function(e){
      console.log('upload error');
      $(document).trigger('uploadErrorEvent');
    };

    onTimeoutHandler = function(e){
      console.log('upload timeout');
      $(document).trigger('timeOutEvent');
    };

    onLoadEnd = function(e){
      console.log('upload loadend');
    };

    xhr.send(body);
  };

  
  initModule = function(){};

  return {
    send : send
  };

})();
