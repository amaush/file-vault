/*
 * filevault.main.js
 * Controller module
 */

filevault.main = (function () {
  'use strict';
  var 
    configMap = {
      core_html : String()          //static values 
        + '<div id="filevault-main-content">'
          + '<div class="filevault-head">'
            + '<div id="filevault-logo"><h1><a href="">FileVault</a></h1></div>'
            + '<div id="filevault-global-button" class="filevault-button"><a href="">Upload File/s</a></div>'
            + '<div id="filevault-acct" class="filevault-button"><a href="">Sign In</a> / <a href="">Register</a></div>'
          + '</div>'
          + '<div id="filevault-content">'
            + '<div id="filevault-upload-modal" style = display: none;>'
            + '</div>'
            + '<div id="filevault-gallery-collection">'
            + '</div>'
            + '<div id="filevault-gallery">'
            + '</div>'
            + '<div id="filevault-gallery-photo">'
            + '</div>'
          + '</div>'
        + '</div>'
    },
    stateMap = {        //dynamic info shared across module 
      is_upload : true,
      base_url : '/image',
      is_gallery_visible : true
    },
    jqueryMap = { },      //cache jQuery collections in object
    setJqueryMap, initModule, onToggleGallery, toggleModal, router, 
    onUploadClick, onLoginClick, onLogOutClick, onUploadDone, onToggleModal, onToggleState, historyChange;

  setJqueryMap = function(){
    var $container = stateMap.$container;
    jqueryMap = {
      $container : $container,
      $content : $container.find('#filevault-content'),
      $acct : $container.find('#filevault-acct'),
      $upload_modal: $container.find('#filevault-upload-modal'),
      $global_upload_button: $container.find('#filevault-global-button'),
      $gallery_container: $container.find('#filevault-gallery'),
      $photo_container: $container.find('#filevault-gallery-photo'),
      $side_bar: $container.find('#filevault-side-bar')

    };
  };

  onLoginClick = function(evt){
    evt.preventDefault();
    toggleModal();
    $(document).trigger('loginClick');
  };

  onUploadClick = function(evt){
    evt.preventDefault();
    toggleModal();
    $(document).trigger('uploadClick'); 
  };

  onToggleModal = function(evt){
    evt.preventDefault();
    toggleModal();
  };
  
  toggleModal = function(){
    jqueryMap.$upload_modal.toggle();
  };

  //called by
  onToggleState = function(){
    console.log('toggling State');
    if(stateMap.is_gallery_visible){
     jqueryMap.$photo_container.toggle();
     stateMap.is_gallery_visible = false;
    }else{
      jqueryMap.$gallery_container.toggle();
      stateMap.is_gallery_visible = true;
    }
  };

  //triggered from data.get after sending files
  onUploadDone = function(evt){
    console.log('upload finished evt');

    toggleModal();
    //router.navigate(evt.url);
    //setTimeout(toggleModal, 2000);
  };

  onToggleGallery = function(){
    console.log('toggling gallery');
    jqueryMap.$gallery_container.toggle();
  };

  historyChange = function(evt){
    if(!history.state){
      history.replaceState(null, null, location.pathname);
      console.log('navigating location.pathname : %s ', location.pathname);
      router.navigate(location.pathname);
      return true;
    }
    router.navigate(history.state.url, history.state.path);
  };
     
  router = (function(path){
    var 
      add, navigate,
      base = {'/' : filevault.model.gallery.updateGallery},
      routes = [];

    add = function(regex, callback){
      routes.push[{regex: callback}];
    };
    
    navigate = function(url, data){
      var callback;

      data = data || null;
      for(var i=0; i<routes.length; i++) {
        var found = url.match(routes[i].regex);
        if(found) {
          found.shift();
          routes[i].callback.apply({}, match, data);
          return true;
        }
      }
      callback = base['/'];
      history.pushState(data , null, url);
      callback(data);
    };

    return {
      add : add,
      navigate: navigate
    };
  })();

  initModule = function($container){
    stateMap.$container = $container;
    stateMap.$container.html(configMap.core_html);
    setJqueryMap();
    router.add(/^\/[^\w|\S]/, filevault.model.photo.newPhoto); 

    //filevault.model.initModule($container);
    filevault.data.initModule();
    filevault.modal.initModule(jqueryMap.$upload_modal);
    filevault.model.gallery.initModule(jqueryMap.$gallery_container);
    filevault.model.photo.initModule(jqueryMap.$photo_container);       //MUST fIX

    jqueryMap.$global_upload_button.on('click', onUploadClick);
    jqueryMap.$acct.on('click', onLoginClick);
    toggleModal();
    $(document).on('uploadFinished', onUploadDone);
    $(document).on('toggleModal', onToggleModal);
    $(document).on('toggleGallery', onToggleGallery);
    $(document).on('toggleState', onToggleState);
    window.onpopstate = historyChange;
    window.onload = historyChange;
  };

  return { 
    initModule: initModule
  };

})();
