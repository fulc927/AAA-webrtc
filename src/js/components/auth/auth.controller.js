(function() {

    'use strict';
    var tokenAuthApp = angular.module('tokenAuthApp.components.auth',[]);

    tokenAuthApp.controller('authLoginController',['$scope','$location', 'authService', function authLoginController($scope, $location, authService){
    const vm = this;
    vm.user = {};
    vm.onLogin = function() {
      authService.login(vm.user)
      .then((digit) => {
        localStorage.setItem('token', digit.data.auth_token);
        //console.log(vm.user);
        //localStorage.setItem('token', digit.data.auth_token);
        $location.path('/status');
      })
      .catch((err) => {
        console.log(err);
      });
    };
    }]);


    tokenAuthApp.controller('authStatusController',['$scope','$location','authService','startVoicemail','captureAmqp',function authStatusController($scope, $location, authService, startVoicemail, captureAmqp){
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
        $location.path('/login');
    };
    
       vm.onVoicemail = function() {
        $location.path('/voicemail');
    };
    
           vm.onSipgateway = function() {
        $location.path('/sipgateway');
    };
         vm.onStartVoicemail = function() {
    authService.choppeJanusToken(token)
    .then((digit2) => {
        console.log(digit2);
        localStorage.setItem('token2', digit2.data.data.janus_token);
        $location.path('/status');  
        startVoicemail.sebvoicemail();
      })
      .catch((err) => {
        console.log(err);
      });
    };
    
       vm.onEvent = function() {
        captureAmqp.amqp(token);
    };
   }]);
})();

