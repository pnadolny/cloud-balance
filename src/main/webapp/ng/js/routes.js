'use strict';


angular.module('cloudBalance.routes', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/transactions', {
   templateUrl: 'transactions.html',
   controller:'SwitchableGridTransactionController'
  })
  $routeProvider.when('/payees', {
   templateUrl: 'payees.html',
   controller:'PayeeController'
  })

  $routeProvider.otherwise({
      redirectTo: '/transactions'
  });
}]);
