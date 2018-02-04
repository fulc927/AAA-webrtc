(function() {

  'use strict';
  angular
    .module('tokenAuthApp.config', [])
    .config(appConfig)
    .run(routeStart);

  function appConfig($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'js/components/main/main.view.html',
        controller: 'mainController',
        restrictions: {
          ensureAuthenticated: false,
          loginRedirect: false
        }
      })
      .when('/login', {
        templateUrl: 'js/components/auth/auth.login.view.html',
        controller: 'authLoginController',
        controllerAs: 'authLoginCtrl',
        restrictions: {
          ensureAuthenticated: false,
          loginRedirect: true
        }
      })
      .when('/register', {
        templateUrl: 'js/components/auth/auth.register.view.html',
        controller: 'authRegisterController',
        controllerAs: 'authRegisterCtrl',
        restrictions: {
          ensureAuthenticated: false,
          loginRedirect: true
        }
      })
      .when('/logout', {
        templateUrl: 'js/components/auth/auth.logout.view.html',
        controller: 'authLogoutController',
        controllerAs: 'authLogoutCtrl',
        restrictions: {
          ensureAuthenticated: true,
          loginRedirect: true
        }
      }).when('/status', {
        templateUrl: 'js/components/auth/auth.status.view.html',
        controller: 'authStatusController',
        controllerAs: 'authStatusCtrl',
        restrictions: {
          ensureAuthenticated: true,
          loginRedirect: false
        }
      }).when('/voicemail', {
        templateUrl: 'js/components/auth/auth.voicemail.view.html',
        controller: 'authStatusController',
        controllerAs: 'authStatusCtrl',
        restrictions: {
          ensureAuthenticated: true,
          loginRedirect: false
        }
      }).when('/sipgateway', {
        templateUrl: 'js/components/auth/auth.sipgateway.view.html',
        controller: 'authStatusController',
        controllerAs: 'authStatusCtrl',
        restrictions: {
          ensureAuthenticated: true,
          loginRedirect: false
        }
      }).otherwise({
        redirectTo: '/'
      });
  }

  function routeStart($rootScope, $location, $route) {
    $rootScope.$on('$routeChangeStart', (event, next, current) => {
      if (next.restrictions.ensureAuthenticated) {
        if (!localStorage.getItem('token')) {
          $location.path('/login');
        }
      }
      if (next.restrictions.loginRedirect) {
        if (localStorage.getItem('token')) {
          $location.path('/status');
        }
      }
    });
  }
})();

