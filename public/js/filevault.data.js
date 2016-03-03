/*
 * filevault.data.js
 * module that fetches photo and sends photos to server 
 *
 */


filevault.data = (function(){
  'use strict';

  var 
    configMap = {
      options : { 
        method: 'GET',
        url: '/image',
        event_name: '',
        data: ''
      }
    },
    sendFiles, initModule, get;


  sendFiles = function(arg_map){
    var 
      file_map = arg_map.file_map,
    url_list = arg_map.url_list,
    $container = arg_map.$container,
    $img, prog_bar_container,file_urls, body, xhr, upload;


    //find image matching object url
    url_list.forEach(function(object_url, indx){
      $img = $container.find('img[src="' + object_url + '"]');
      prog_bar_container = $img.next('.bar');
      upload(prog_bar_container, object_url);
    });

    upload = function ($container, file){
      var step, $inner_width, $outer_width, $progress_bar;

      file = file_map[file];
      $outer_width = $($container).width(); 
      $inner_width = $container.find($('.inner-bar').width(0));
      step = $outer_width / 100;
      $progress_bar = $container.find('.progress');

      xhr = new XMLHttpRequest();
      body = new FormData();
      xhr.onreadystatechange = function(e){
        if(this.readyState == 4 && this.status == 200){
          $(document).trigger({ type: 'uploadFinished', response : JSON.parse(this.response)});
          return true;
        }
      };

      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          var new_width = Math.floor(e.loaded/e.total*100);
          $progress_bar.text(new_width + '%');
          $inner_width.width(new_width*step);
        }
      };

      xhr.open('POST', '/image');
      body.append('ImgFiles', file, file.name);
      xhr.send(body);
    };
  };
    /*
       data = new FormData();
       data.append('Image', photo_list[0].src);
       $.ajax({
       type : 'POST',
       url : '/upload',
       dataType : 'json',
       contentType : false,
       processData : false,
       data : data
       }).done(function(){
       console.log("Data sent and response received");
       });
       photo_list.forEach(function(element){
       console.log("sending" + element.src);
       });
       */

    get = function(options){
      var 
        ajax_options = $.extend({}, configMap.options, options);

      $.ajax( ajax_options)
        .done(function(data){
          $(document).trigger(ajax_options.event_name + 'Finished',  data);
        });
    };


    initModule = function(){

    };

    return {
      initModule : initModule,
      sendFiles : sendFiles,
      get : get
    };

  })();
