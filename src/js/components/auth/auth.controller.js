(function() {

  'use strict';

  angular
    .module('tokenAuthApp.components.auth', [])
    .controller('authLoginController',['$scope','$location', 'authService', function($scope, $location, authservice){
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
    }]);

  angular
    .module('tokenAuthApp.components.auth', [])
    .controller('authStatusController',['$scope','$location','authService',function($scope,$location, authService){
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
        authService.logoff(vm.user);
        $location.path('/ogo');
      };
   }]);

})();
