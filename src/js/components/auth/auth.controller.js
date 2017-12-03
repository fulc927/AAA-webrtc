(function() {

  'use strict';

  angular
    .module('tokenAuthApp.components.auth', [])
    .controller('authLoginController', authLoginController)
    .controller('authRegisterController', authRegisterController)
    .controller('authStatusController', authStatusController)
    .controller('authLogoutController', authLogoutController);

  authLoginController.$inject = ['$location', 'authService'];
  authRegisterController.$inject = ['$location', 'authService'];
  authStatusController.$inject = ['authService'];
  authLoginController.$inject = ['$location', 'authService'];
  //ng-submit="authLoginCtrl.onLogin()"
  //ng-model="authLoginCtrl.user.username DANS AUTH.LOGIN.HTML
  function authLoginController($location, authService) {
    /*jshint validthis: true */
    const vm = this;
    console.log(this);
    //vm.user = {};
    console.log(vm);
    vm.onLogin = function() {
      authService.login(vm.user)
      .then((digit) => {
        localStorage.setItem('token', digit.data.auth_token);
        console.log(vm.user);
        //localStorage.setItem('token', digit.data.auth_token);
        $location.path('/status');
      })
      .catch((err) => {
        console.log(err);
      });
    };
  }

  function authRegisterController($location, authService) {
    /*jshint validthis: true */
    const vm = this;
    vm.user = {};
    vm.onRegister = function() {
      authService.register(vm.user)
      .then((user) => {
        localStorage.setItem('token', user.data.token);
        $location.path('/status');
      })
      .catch((err) => {
        console.log(err);
      });
    };
  }

  function authLogoutController($location, authService) {
    //const vm = this;
    //vm.onLogout = function() {
    //  localStorage.removeItem('token');
    //  $location.path('/logout');
    //};
  }
  function authStatusController(authService, $location) {
    /*jshint validthis: true */
    const vm = this;
    vm.isLoggedIn = false;
    const token = localStorage.getItem('token');
    if (token) {
      authService.ensureAuthenticated(token)
      .then((user) => {
        if (user.data.status === 'success');
        vm.isLoggedIn = true;
      })
      .catch((err) => {
        console.log(err);
      });
    }
    vm.onLogoff = function() {
        authService.logoff(vm.user)
        $location.path('/ogo');
      }
  }

})();
