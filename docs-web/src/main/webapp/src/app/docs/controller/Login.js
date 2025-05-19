'use strict';

/**
 * Login controller.
 */
angular.module('docs').controller('Login', function(Restangular, $scope, $rootScope, $state, $stateParams, $dialog, User, $translate, $uibModal, $http, $httpParamSerializerJQLike) {
  $scope.codeRequired = false;

  // Get the app configuration
  Restangular.one('app').get().then(function(data) {
    $rootScope.app = data;
    $rootScope.app.guest_login = true;
  });

  // Login as guest
  $scope.loginAsGuest = function() {
    $scope.user = {
      username: 'guest',
      password: ''
    };
    $scope.login();
  };

  // Register
  $scope.openRegister = function () {
    $uibModal.open({
      templateUrl: 'partial/docs/register.html',
      controller : 'ModalRegister'
    }).result.then(function (newUser) {
      if (!newUser) return;

      // 序列化表单
      var body = $httpParamSerializerJQLike({
        username      : newUser.username,
        password      : newUser.password,
        email         : newUser.email,
        storage_quota : '0'
      });

      // 使用 Restangular.customPUT，自动加上 baseUrl (/teedy/api) 前缀
      Restangular.one('user')
        .withHttpConfig({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        .customPUT(body, '', {}, {})  // body, pathSuffix = '', queryParams = {}, headers = {}
        .then(function () {
          var title = $translate.instant('register.success_title');
          var msg   = $translate.instant('register.success_message');
          var btns  = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
          $dialog.messageBox(title, msg, btns);
        }, function (err) {
          var title = $translate.instant('register.error_title');
          var msg   = (err.data && err.data.message)
                      ? err.data.message
                      : $translate.instant('register.error_message');
          var btns  = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
          $dialog.messageBox(title, msg, btns);
        });
    });
  };

  
  // Login
  $scope.login = function() {
    User.login($scope.user).then(function() {
      User.userInfo(true).then(function(data) {
        $rootScope.userInfo = data;
      });

      if($stateParams.redirectState !== undefined && $stateParams.redirectParams !== undefined) {
        $state.go($stateParams.redirectState, JSON.parse($stateParams.redirectParams))
          .catch(function() {
            $state.go('document.default');
          });
      } else {
        $state.go('document.default');
      }
    }, function(data) {
      if (data.data.type === 'ValidationCodeRequired') {
        // A TOTP validation code is required to login
        $scope.codeRequired = true;
      } else {
        // Login truly failed
        var title = $translate.instant('login.login_failed_title');
        var msg = $translate.instant('login.login_failed_message');
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      }
    });
  };

  // Password lost
  $scope.openPasswordLost = function () {
    $uibModal.open({
      templateUrl: 'partial/docs/passwordlost.html',
      controller: 'ModalPasswordLost'
    }).result.then(function (username) {
      if (username === null) {
        return;
      }

      // Send a password lost email
      Restangular.one('user').post('password_lost', {
        username: username
      }).then(function () {
        var title = $translate.instant('login.password_lost_sent_title');
        var msg = $translate.instant('login.password_lost_sent_message', { username: username });
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      }, function () {
        var title = $translate.instant('login.password_lost_error_title');
        var msg = $translate.instant('login.password_lost_error_message');
        var btns = [{result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary'}];
        $dialog.messageBox(title, msg, btns);
      });
    });
  };
});