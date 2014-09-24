'use strict';

var cloudBalanceServices = angular.module('cloudBalanceServices', ['ngResource']);

cloudBalanceServices.factory('UserService', function($http) {
    var URL = '/cb/user';
    var service = {};
    var params = {
        year: 2014
    };

    service.query = function(callback) {
        $http.get(URL, params).
        success(function(data, status, headers, config) {
            callback(data.data);
        }).
        error(function(data, status, headers, config) {
            alert('fail');
        });
    }


    return service;
});


cloudBalanceServices.factory('Payees', function($http) {
    var URL = '/cb/payee';
    var service = {};
    var params = {
        year: 2014
    };
    service.query = function(callback) {
        $http({
            method: 'GET',
            url: URL,
            params: params
        }).
        success(function(data, status, headers, config) {
            callback(data.data);
        }).
        error(function(data, status, headers, config) {
            alert('fail');
        });
    }

    service.deletePayee = function(id, successFn, failFn) {
        var params = {
            action: 'DELETE',
            id: id
        };

        $http({
            method: 'POST',
            url: URL,
            params: params
        }).
        success(function(data, status, headers, config) {
            successFn(data);

        }).
        error(function(data, status, headers, config) {
            failFn(data);
        });

    };

    service.save = function(payee, successFn, failFn) {
        $http({
            method: 'POST',
            url: URL,
            params: payee
        }).
        success(function(data, status, headers, config) {
            successFn(data);
        }).
        error(function(data, status, headers, config) {
            failFn(status);
        });


    }


    return service;
});

cloudBalanceServices.factory('Transactions', function($http) {

    var service = {};
    var URL = '/cb/transaction';

    service.fetchTransactions = function(callback) {
        $http.get(URL).
        success(function(data, status, headers, config) {
            callback(data.data);
        }).
        error(function(data, status, headers, config) {
            alert(status);
        });
    }

    service.saveTransaction = function(transaction, success, fail) {

        $http({
            method: 'POST',
            url: URL,
            params: transaction
        }).
        success(function(data, status, headers, config) {
            success(data);
        }).
        error(function(data, status, headers, config) {
            fail(status);
        });

    }


    service.deleteTransaction = function(id, parentId) {

        var params = {
            action: 'DELETE',
            parentid: parentId,
            id: id
        };

        $http({
            method: 'POST',
            url: URL,
            params: params
        }).
        success(function(data, status, headers, config) {}).
        error(function(data, status, headers, config) {
            alert('fail');
        });
    }


    service.starTransaction = function(id, parentId) {

        var params = {
            action: 'STAR',
            parentid: parentId,
            id: id
        };


        $http({
            method: 'POST',
            url: URL,
            params: params
        }).
        success(function(data, status, headers, config) {
            alert('star....')
        }).
        error(function(data, status, headers, config) {
            alert('fail');
        });
    }

    return service;


});