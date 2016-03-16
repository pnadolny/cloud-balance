'use strict';


angular.module('cloudBalance.routes', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider.when('/transactions', {
            templateUrl: 'transactions.html',
            controller: 'SwitchableGridTransactionController',
            resolve: {
                transactions: function (Transaction) {
                    return Transaction.query().$promise;
                }
            }
        })
        $routeProvider.when('/payees', {
            templateUrl: 'payees.html',
            controller: 'PayeeController',
            resolve: {
                payees: function (Payees) {
                    return Payees.query().$promise;
                }
            }
        })

        $routeProvider.otherwise({
            redirectTo: '/transactions'
        });
    }]);
