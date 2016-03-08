/* 
 * Upload module for filevault
 *
 */


filevault.modal = (function(){
  'use strict';
   var
     configMap = {
        core_html : String()          //static values 
          + '<div id="modal-background"></div>'
            + '<div id="modal-content">' 
            + '<div id="filevault-upload-form">'
              + '<form method="post" class="filevault-upload-form" enctype="multipart/form-data" action="" >'
                  + '<fieldset>'
                    + '<input type="file" accept="image/*" name="imgData" multiple="multiple" id="filevault-file-input" style="display:none" >'
                      + '<a href="#" id="filevault-file-picker" class="filevault-button">'
                      + 'Click here to browse for file/s </a>'
                      + '<div id="filevault-drop-zone"><p>OR</p>Drop files here</div>'
                  + '</fieldset>'
              + '</form>'
              + '<div id="filevault-preview-pane">'
                + '<div id="filevault-upload-button" class="filevault-button">'
                  + '<a href="">Upload your file/s </a>'
                + '</div>'
              + '</div>'
            + '</div>'
              + '<a href="" title="Close" class="close">X</a>'
            + '</div>'
          + '</div>'
      ,progress_bar_html : String()
        + '<div class="">'
          + '<progress max="100" value="0">0% complete</progress>'
        + '</div>'
      /*
        + '<div class="bar">'
          + '<div class="inner-bar"></div>'
          +'<span class="progress"></span>'
        +'</div>'
        */
         
      ,login_html : String() 
        + '<header class="account-header" id="account-header">'
          + '<span><a href="">Login</a></span>'
          + '<span><a href="">Register</a></span>'
        + '</header>'
        + '<section class="account-form" id="login-account">'
          + '<form method="" class="minimal" id="login-form">'
            + '<label for="email">Email: <span id="login-error" class="error" style="display:none"></span>'
                + '<input type="email" name="email" id="login-email" placeholder="Email" required=required />'
            + '</label>'
            + '<label for="login-password">'
              + 'Password: '
              + '<input type="password" name="password" id="login-password" placeholder="********" required="required" />'
            + '</label>'
            + '<span class=""><a href="">Register</a></span>'
            + '<button type="submit" class=""> Sign in</button>'
          + '</form>'
          + '</section>'
      ,register_html : String() 
        + '<section class="account-form" id="register-account">'
            + '<form method="" class="minimal" id="register-form">'
              + '<label for="register-email">Email: <span id="register-email-error" class="error" style="display:none"></span>'
                + '<input type="email" name="email" id="register-email" placeholder="Email" required=required />'
              + '</label>'
              + '<label for="register-password">'
                + 'Password: <span id="register-password-error" class="error" style="display:none"></span>'
                + '<input type="password" name="password" id="register-password" placeholder="********" required="required" />'
              + '<label for="register-password-confirm">'
                + 'Confirm Password : '
                + '<input type="password" name="password-confirm" id="register-password-confirm" placeholder="********" required="required" />'
              + '</label>'
              + '<button type="submit" class="btn-minimal">Register</button>'
            + '</form>'
          + '</section>'
    },
    stateMap = {          //dynamic info shared across module 
      $container : null,
      user_files : [ ],   //store files with objectURL as key 
      is_upload_modal : true    //maintain state of last visible modal
    },
    jqueryMap = {            //cache jQuery collections in object
      $login_form : null,
      $account_header: null,
      $register_form : null
    },
    fileSize, handleFiles, initModule, setJqueryMap, onUploadStart,
    onDrop, onDragEnter, onDragOver, onUpLoad, onPreviewPaneClick, onUploadFinished,
    onLoginAction, onUploadAction, onLogin, onLogout, onRegister, onFileSelect, 
    onClickModalBackground, onFileBrowse, onRegisterFormClick, onLoginFormClick;

  setJqueryMap = function(){
    var $container = stateMap.$container.find('#modal-content');

    jqueryMap = {
      $container : $container,
      $upload_form : $container.find('#filevault-upload-form'), 
      $file_picker: $container.find('#filevault-file-picker'),
      $file_input : $container.find('#filevault-file-input'),
      $preview_pane :$container.find('#filevault-preview-pane'),
      $drop_zone : $container.find('#filevault-drop-zone'),
      $button : $container.find('#filevault-upload-button'),
      $img_collection : $('<div />').attr({'class' : 'img-container'}),
      $progress_bar: $('<progress />').attr({'max' : 100, 'value' : 0 }), 
      $modal_background: stateMap.$container.find('#modal-background'),
      $close_modal : stateMap.$container.find('.close')
    };
  };

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
    var 
      $image_collection,
      imageType = /^image\//;
    
    for (var i = 0; i < files.length; i++){
      var file = files[i];
      if(!imageType.test(file.type)){
        continue;     // image is not an object. Failing silently
      }
      var $file_remove_icon = $('<span></span>').attr({
            'class' : 'remove-file'
          })
          .html('<a href="">X</a>'), 
        $img_wrapper = $('<p></p>').attr({'class' : 'img-wrapper' });

      var $img = $('<img>').eq(0);
      var src = window.URL.createObjectURL(file);
      $img.attr({
        src : src, 
        height : 60,
        title : file.name,
      });

      $img.onload = function(){
        window.URL.revokeObjectURL(file);   
      };
      stateMap.user_files.push({
        file_src: src,
        file: file
      });
      $img_wrapper.append($img);
      $img_wrapper.append(fileSize(file.size));
      $img_wrapper.append(jqueryMap.$progress_bar.clone().hide()); //('<progress />').attr('data-name', file.name));
      $img_wrapper.append($file_remove_icon);
      jqueryMap.$img_collection.append($img_wrapper);
    }
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
    evt.dataTransfer.dropEffect = "copy";
  };

  onDragOver = function(evt){
    evt.stopPropagation();
    evt.preventDefault();
  };

  //delegate clicks to remove file from preview pane
  onPreviewPaneClick = function(evt){
    var 
      img_wrapper, img, send,
      target = $(evt.target);
    
    evt.preventDefault();
    evt.stopPropagation();
    if(target.is('a')){     
      //clicked on file close icon 
      img_wrapper = target.closest('p.img-wrapper'); 
      img = target.closest('p').find('img')[0];   

      //find image related to this event
      //console.log(img);
      if(!!img_wrapper.siblings('p').length){    
        //Other files still remain in preview pane
        img_wrapper.remove();
        stateMap.user_files.forEach(function(file, idx){
          if(file.file_src === img.src){
            delete stateMap.user_files[idx];
          }
        });
      }else{                                    
        //No files left in preview pane
        img_wrapper.remove();
        stateMap.user_files = { };
        jqueryMap.$preview_pane.hide();
      }
    }else if(target.is(jqueryMap.$button)){
      //find progress element
      stateMap.user_files.forEach(function(file, idx){
        var $tmp = jqueryMap.$preview_pane.find('img[src="' + file.file_src + '"]');
        file.$progress_container = $tmp.next('progress'); 
      });

      send = filevault.model.gallery.send({ 
        files : stateMap.user_files,
        is_file_request: true
      });
    }
  };

  onUploadStart = function(evt){
    evt.$progress_container.show();
  };

  onUploadFinished = function(evt){
    var $blob_url;

    $progress = evt.$progress_container.hide()
    $progress.hide();
    $progress.parent('p').empty().text('Upload Completed successfully');
    $blob_url = $progress.sibling('img').attr('src');
    console.log('blob ', stateMap.user_files[$blob_url]);
  };

  onLoginFormClick = function(evt){
    jqueryMap.$register_form.detach();
    jqueryMap.$container.append(jqueryMap.$login_form);
    evt.preventDefault();
  };

  onLogin = function(evt){
    var email, password;
    
    jqueryMap.$login_error.text('');
    email = jqueryMap.$login_form.find('input[type=email]');
    password = jqueryMap.$login_form.find('input[type=password]');
    if(!email.val() || !password.val()){
      jqueryMap.$login_error.text('Fields cannot be empty');
    }else{
      console.log('email :%s pass: %s ', email.val(), password.val());
    }
    filevault.user.request({email: email.val(), password: password.val()});
    evt.preventDefault();
  };

  onRegisterFormClick = function(evt){
    jqueryMap.$login_form.detach();
    jqueryMap.$container.append(jqueryMap.$register_form);
    evt.preventDefault();
  };
  
  onRegister = function(evt){
    evt.preventDefault();
    var passwords, password, password_confirm, email;

    jqueryMap.$register_password_error.text('');
    jqueryMap.$register_email_error.text('');
    email = jqueryMap.$register_form.find('input[type=email]');
    console.log(email.val());
    passwords = jqueryMap.$register_form.find('input[type=password]');
    password = passwords.eq(0);
    password_confirm = passwords.eq(1);
    if(password.val() === password_confirm.val()){
      console.log('passwords match!');
      filevault.user.request({email: email.val(), password: password.val(), password_confirm: password_confirm.val()});
    }else{
      jqueryMap.$register_password_error.text('Passwords are not matching');
      jqueryMap.$register_password_error.show();
    }
  };

  onLoginAction = function(evt){
    evt.preventDefault();
    //detach the upload form and maintain state
    jqueryMap.$upload_form.detach();
    stateMap.is_upload_modal = false;
    //add the forms to DOM
    jqueryMap.$container.html(configMap.login_html + configMap.register_html);

    jqueryMap.$account_header = jqueryMap.$container.find('#account-header');
    jqueryMap.$login_form = jqueryMap.$container.find('#login-account');
    jqueryMap.$login_password_error = jqueryMap.$login_form.find('#login-password-error');
    jqueryMap.$login_error = jqueryMap.$login_form.find('#login-email-error');
    jqueryMap.$login_button = jqueryMap.$login_form.find('button');
    
    jqueryMap.$register_form = jqueryMap.$container.find('#register-account');
    jqueryMap.$register_password_error = jqueryMap.$register_form.find('#register-password-error');
    jqueryMap.$register_email_error = jqueryMap.$register_form.find('#register-email-error');
    jqueryMap.$register_button = jqueryMap.$register_form.find('button');
    jqueryMap.$register_form.detach();

    //add listeners 
    jqueryMap.$login_button.on('click', onLogin);
    jqueryMap.$register_button.on('click', onRegister);
    jqueryMap.$account_header.on('click', function(evt){
      evt.preventDefault();
      var account_action = evt.target.textContent === 'Login' ? onLoginFormClick: onRegisterFormClick;
      account_action(evt);
    });
  };
  
  onUploadAction = function(evt){
    evt.preventDefault();
    if(!stateMap.is_upload_modal){
      jqueryMap.$container.empty();
      jqueryMap.$container.append(jqueryMap.$upload_form);
      stateMap.is_upload_modal = true;
    }
  };

  onLogout = function(){
    alert("Logged Out");
  };

  onClickModalBackground = function(evt){
    $(document).trigger('toggleModal');
    evt.preventDefault();
  };

  initModule = function ($container){
    $.event.props.push('dataTransfer');   //give jQuery an object to attach drag n drop files to 
    stateMap.$container = $container;
    $container.append(configMap.core_html);
    setJqueryMap();
    jqueryMap.$modal_background.on('click', onClickModalBackground);
    jqueryMap.$preview_pane.hide();
    jqueryMap.$file_picker.on('click', onFileBrowse); 
    jqueryMap.$file_input.on('change', onFileSelect);
    jqueryMap.$drop_zone.on('dragenter', onDragEnter); 
    jqueryMap.$drop_zone.on('dragover', onDragOver);
    jqueryMap.$drop_zone.on('drop', onDrop);
    jqueryMap.$preview_pane.on('click', onPreviewPaneClick);
    jqueryMap.$close_modal.on('click', function(evt){
      evt.preventDefault();
      $(document).trigger('toggleModal');
    });
    $(document).on('loginClick', onLoginAction);
    $(document).on('uploadClick', onUploadAction);
    $(document).on('signout', onLogout);
    $(document).on('uploadStart', onUploadStart);
    $(document).on('uploadFinished', onUploadFinished);
  };

  return {
    initModule : initModule,
  };

})();
