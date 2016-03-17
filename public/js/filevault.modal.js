/* 
 * Upload module for filevault
 *
 */


filevault.modal = (function(){
  'use strict';
   var
configMap = {
  core_html : String()          //static values 
    + '<div id="modal-container">'
      + '<div class="upload-modal-content">' 
        + '<div id="filevault-upload-form">'
          + '<form method="post" class="filevault-upload-form" enctype="multipart/form-data" action="" >'
            + '<fieldset>'
              + '<input type="file" accept="image/*" name="imgData" multiple="multiple" id="filevault-file-input" style="display:none" >'
                + '<a href="#" id="filevault-file-picker" class="filevault-button">'
                  + 'Click here to browse for file/s'
                + '</a>'
            + '</fieldset>'
          + '</form>'
          + '<div id="filevault-drop-zone"><p>OR</p>Drop files here</div>'
        + '</div>'
        + '<div id="filevault-preview-pane">'
          + '<div id="filevault-upload-button" class="button">'
            + '<button>Upload your file/s </button>'
          + '</div>'
        + '</div>'
        + '<a href="" title="Close" class="close">X</a>'
        + '</div>'
      + '</div>',
  progress_bar_html : String()
    + '<div class="">'
      + '<progress max="100" value="0">0% complete</progress>'
    + '</div>'
  },
  stateMap = {          //dynamic info shared across module 
    $container : null,
    user_files : [ ],   //store files with objectURL as key 
    modal_is_visible: true    
  },
  jqueryMap = { },
  createDomImage, fileSize, handleFiles, initModule, setJqueryMap, flushImage, onUploadStart,
  onDrop, onDragEnter, onDragOver, onPreviewPaneClick, onUploadFinished, onLoginAction,
  onUploadAction, onFileSelect, onCloseModal, onClickModalBackground, onFileBrowse;

  setJqueryMap = function(){
    var $container = stateMap.$container.find('#modal-container');

    jqueryMap = {
      $container : $container,
      $modal_content: $container.find('.upload-modal-content'),
      $upload_form : $container.find('#filevault-upload-form'), 
      $file_picker: $container.find('#filevault-file-picker'),
      $file_input : $container.find('#filevault-file-input'),
      $preview_pane :$container.find('#filevault-preview-pane'),
      $drop_zone : $container.find('#filevault-drop-zone'),
      $button : $container.find('button'),
      $close_modal : $container.find('.close'),
      $img_collection : $('<div />').attr({'class' : 'img-container'}),
      $progress_bar: $('<progress />').attr({'max' : 100, 'value' : 0 })
    };
  };

  //****************** FILE METHODS ******************/
  fileSize = function (bytes) {
    var thresh = 1000;

    if(Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
    var units =  ['kB','MB','GB','TB','PB','EB','ZB','YB'];
    var u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);

    return bytes.toFixed(1)+' '+units[u];
  };

  handleFiles = function (files){
    var imageType = /^image\//;
    
    for (var i = 0; i < files.length; i++){
      var file = files[i];
      if(!imageType.test(file.type)){
        continue;     // image is not an object. Failing silently
      }

      var $img = $('<img>').eq(0);
      var src = window.URL.createObjectURL(file);
      $img.onload = function(){
        console.log('IMAGE URL RELEASING');
        window.URL.revokeObjectURL($img[0].src);   
      };
     $img.attr({
        src : src, 
        height : 60,
        title : file.name,
        size : fileSize(file.size)
      });

     
      stateMap.user_files.push({
        file_src: src,
        file: file
      });
      createDomImage($img);
    }
  };

  createDomImage = function($img){
    var 
      $img_wrapper = $('<p></p>').attr({'class' : 'img-wrapper' }),
      $file_remove_icon =
        $('<span></span>').attr({'class' : 'remove-file'}).html('<a href="">X</a>');

    $img_wrapper.append($img);
    $img_wrapper.append($('<p/>').text($img[0].size));
    $img_wrapper.append(jqueryMap.$progress_bar.clone().hide()); //('<progress />').attr('data-name', file.name));
    $img_wrapper.append($file_remove_icon);
    jqueryMap.$img_collection.append($img_wrapper);
    jqueryMap.$preview_pane.append(jqueryMap.$img_collection);
  };

  onFileBrowse = function(evt){
    jqueryMap.$file_input.click();
    evt.preventDefault(); 
  };

  onFileSelect = function(evt){
    var files = evt.target.files ;
    jqueryMap.$preview_pane.show();
    handleFiles(files);
  };

  onDrop = function(evt){
    evt.preventDefault();
    evt.stopPropagation();

    var dt = evt.dataTransfer;
    var files = dt.files;
    jqueryMap.$preview_pane.show();
    handleFiles(files);
  };

  //add class when draggable over dropzone
  onDragEnter = function(evt){
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  };

  onDragOver = function(evt){
    evt.stopPropagation();
    evt.preventDefault();
  };

  //delegate listener to remove file from preview pane
  onPreviewPaneClick = function(evt){
    var 
      $img_wrapper, img, 
      $target = $(evt.target);

    console.log(evt.target);
    evt.preventDefault();
    evt.stopPropagation();
    if($target.is('a')){
      //find related img element
      $img_wrapper = $target.closest('p.img-wrapper'); 
      img = $target.closest('p').find('img')[0];   
      if(!!$img_wrapper.siblings('p').length){
        //Other files still remain in preview pane
        $img_wrapper.remove();
        flushImage(img.src);
        console.log('stateMap after remove action: ', stateMap.user_files.length);
      }else{
        //No files left in preview pane
        console.log('files in stateMap: ', stateMap.user_files.length);
        $img_wrapper.remove();
        stateMap.user_files = [ ];
        jqueryMap.$preview_pane.hide();
      }
    }else if($target.is(jqueryMap.$button)){
      //find progress element
      console.log('clicked button element');
      stateMap.user_files.forEach(function(file, idx){
        var $sibling = jqueryMap.$preview_pane.find('img[src="' + file.file_src + '"]');
        file.$progress_bar = $sibling.siblings('progress'); 
      });

      filevault.model.gallery.send({ 
        files : stateMap.user_files,
        is_file_request: true
      });
    }
  };

  onUploadStart = function(evt){
    evt.$progress_bar.show();
    //remove close icon
    evt.$progress_bar.next('span').remove();
  };

  onUploadFinished = function(evt){
    var
      $blob_url, 
      $progress_wrapper;
    //console.log(Object.keys(stateMap.user_files[0].$progress_container));

    setTimeout(function(){
      $blob_url = evt.$progress_bar.siblings('img').attr('src');
      $progress_wrapper = evt.$progress_bar.parent('p').empty().text('Upload Completed successfully');
      evt.$progress_bar.remove();
      flushImage($blob_url);
      if(!stateMap.user_files.length){
        jqueryMap.$preview_pane.find('div.img-container').remove();
        jqueryMap.$img_collection.empty();
        jqueryMap.$preview_pane.hide();
        setTimeout(function(){
          $(document).trigger('uploadComplete');
        }, 
        3000);
      }
    }, 3000);
  };

  onUploadAction = function(evt){
    evt.preventDefault();
    if(!stateMap.modal_is_visible){
      //jqueryMap.$container.empty();
      jqueryMap.$container.append(jqueryMap.$modal_content);
      stateMap.modal_is_visible = true;
    }
  };

  onCloseModal = function(evt){
    evt.preventDefault();
    $(document).trigger('toggleModal');
  };

  onLoginAction = function(evt){
    if(stateMap.modal_is_visible){
      jqueryMap.$modal_content.detach();
      stateMap.modal_is_visible = false;
    }
  };

  flushImage = function(img_src){
    for(var i = 0 ; i < stateMap.user_files.length; i++){
      if(stateMap.user_files[i].file_src === img_src){
        stateMap.user_files.splice(i, 1);
      }
    }
  };

  initModule = function ($container){
    $.event.props.push('dataTransfer');   //give jQuery an object to attach drag n drop files to 
    stateMap.$container = $container;
    $container.append(configMap.core_html);
    setJqueryMap();
    jqueryMap.$preview_pane.hide();
    jqueryMap.$file_picker.on('click', onFileBrowse); 
    jqueryMap.$file_input.on('change', onFileSelect);
    jqueryMap.$drop_zone.on('dragenter', onDragEnter); 
    jqueryMap.$drop_zone.on('dragover', onDragOver);
    jqueryMap.$drop_zone.on('drop', onDrop);
    jqueryMap.$preview_pane.on('click', onPreviewPaneClick);
    jqueryMap.$close_modal.on('click', onCloseModal);
    $(document).on('uploadButtonClick', onUploadAction);
    $(document).on('uploadFinished', onUploadFinished);
    $(document).on('uploadStart', onUploadStart);
    $(document).on('loginButtonClick', onLoginAction);
  };

  return {
    initModule : initModule,
  };

})();
