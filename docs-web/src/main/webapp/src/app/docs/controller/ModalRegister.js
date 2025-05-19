'use strict';

/**
 * Modal register controller.
 */
angular.module('docs').controller('ModalRegister', function ($scope, $uibModalInstance) {
  // 注册表单模型
  $scope.newUser = {
    username: '',
    email: '',
    password: '',
    passwordConfirm: ''
  };

  // 确定注册，传回 newUser 对象
  $scope.close = function (newUser) {
    $uibModalInstance.close(newUser);
  };

  // 取消并关闭弹窗
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});