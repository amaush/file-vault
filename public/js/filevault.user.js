filevault.user = (function(){
  'use strict';

  var
    configMap = {
      is_anon: true,
      token : '',
      core_html : String()
      + '<div class="login-modal-content">'
      + '<header class="account-header button">'
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
      + '</div>'
    },
    stateMap = {
      $container: null,
      modal_is_visible: true
    },
    jqueryMap = { },
    onLoginFormClick, onLoginAction, onLogoutAction, onLogin, onLogout, onRegisterFormClick, onRegister,
    onUploadAction, setJqueryMap, initModule, login, request, onSwitchModal, onCompleteLogin, logout;
  
  setJqueryMap = function(){
    var passwords;
      
    //break encapsulation and get directly from DOM
    jqueryMap.$acct = $('#filevault-acct');

    jqueryMap.$container = stateMap.$container;
    jqueryMap.$module = jqueryMap.$container.find('.login-modal-content');
    jqueryMap.$account_header = jqueryMap.$module.find('.account-header');   
    jqueryMap.$login_form = jqueryMap.$module.find('#login-account');
    jqueryMap.$login_button = jqueryMap.$login_form.find('button');
    jqueryMap.$login_password = jqueryMap.$login_form.find('input[type=password]');
    jqueryMap.$login_error = jqueryMap.$login_form.find('#login-email-error');
    jqueryMap.$login_email = jqueryMap.$login_form.find('input[type=email]');

    jqueryMap.$register_form = jqueryMap.$module.find('#register-account');
    jqueryMap.register_email = jqueryMap.$register_form.find('input[type=email]');
    passwords = jqueryMap.$register_form.find('input[type=password]');
    jqueryMap.$register_password = passwords.eq(0);
    jqueryMap.$register_password_confirm = passwords.eq(1);
    jqueryMap.$register_password_error = jqueryMap.$register_form.find('#register-password-error');
    jqueryMap.$register_email_error = jqueryMap.$register_form.find('#register-email-error');
    jqueryMap.$register_button = jqueryMap.$register_form.find('button');
  };

  request = function(request_data){
    console.log('BODY: ', request_data);
    var 
      event_name,
    my_re = /\/\w+\/(\w+)$/, 
    request = { };

    if(request_data.password_confirm){
      request.url = '/user/register';
    }else if(request_data.password){
      request.url = '/user/login';
    }else if(request_data.logout){
      request.url = '/user/logout';
    }

    //request.url = '/user/register';
    request.method =  'POST';
    event_name = my_re.exec(request.url);
    event_name.shift();
    console.log('eventname ', event_name);

    request.event_name = event_name.pop();

    request.body = request_data;

    console.log('REQUEST: ', request);
    //filevault.data.send(request);
    filevault.repos.user.login(request);
    /** promise
    var user = {
      login : function(){
        return $.ajax({
          url: request.url, 
          method: request.method,
          contentType: 'application/json',
          data: JSON.stringify(request.body) 
      });}
    }

    user.login().done(function(response){
      console.log('LOGIN RESPONSE: ', response);
    })
    .fail(function(error){
      console.log('ERROR RESPONSE: ', error.status, error.responseText);
    });
     *
     * filevault.repos.user.login().then(function(response){
     *  sessionStorage.setItem('x-token', evt.response.token);
     *  stateMap.$container.empty();
     *  stateMap.$container.text(user: response._id);
     *  });
     */
  };

  onLoginAction = function(evt){
    evt.preventDefault();
    //detach the upload form to maintain its state
   // $(document).trigger('toggleModal');
    //stateMap.$container.append(configMap.core_html);
    if(!stateMap.module_is_visible){
      jqueryMap.$module.append(jqueryMap.$login_form);
      jqueryMap.$container.append(jqueryMap.$module);
      console.log(jqueryMap.$module);
      //jqueryMap.$register_form.detach();
      console.log('LOGIN ACTION');
      jqueryMap.$login_button.on('click', onLogin);
      jqueryMap.$register_button.on('click', onRegister);
      jqueryMap.$account_header.on('click', onSwitchModal);
      stateMap.modal_is_visible = true;
    }

  };

  onUploadAction = function(evt){
    console.log('UPLOAD ACTION');
    if(stateMap.modal_is_visible){
      jqueryMap.$module.detach();

      jqueryMap.$login_button.off('click', onLogin);
      jqueryMap.$register_button.off('click', onRegister);
      jqueryMap.$account_header.off('click', onSwitchModal);

      stateMap.modal_is_visible = false;
    }
  };

  onSwitchModal = function(evt){
    evt.preventDefault();
    var account_action = (evt.target.textContent === 'Login') ? onLoginFormClick: onRegisterFormClick;
    account_action(evt);
  };

  onLogout = function(){
    alert('Logged Out');
  };
  onLoginFormClick = function(evt){
    jqueryMap.$register_form.detach();
    jqueryMap.$module.append(jqueryMap.$login_form);
    evt.preventDefault();
  };

  onLogin = function(evt){
    var email, password;

    jqueryMap.$login_error.text('');
    email = jqueryMap.$login_email;
    password = jqueryMap.$login_password;
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
    jqueryMap.$module.append(jqueryMap.$register_form);
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

  onCompleteLogin = function(evt){
    console.log('LOGIN RESPONSE', evt.response);
    sessionStorage.setItem('x-token', evt.response.token);
    jqueryMap.$acct.empty();
    jqueryMap.$acct.html('<h4>Anon User</h4>');
  };

  initModule = function($container){
    stateMap.$container = $container;
    $container.append(configMap.core_html);
    //$container.hide();
    setJqueryMap();
    //jqueryMap.$module.hide();
    $(document).on('loginFinished', onCompleteLogin);
    $(document).on('loginButtonClick', onLoginAction);
    $(document).on('uploadButtonClick', onUploadAction);
    $(document).on('signout', onLogout);
  };

  return {
    request: request,
    initModule: initModule
  };

})();


