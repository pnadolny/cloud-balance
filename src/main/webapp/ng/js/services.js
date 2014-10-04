'use strict';

var cloudBalanceServices = angular.module('cloudBalanceServices', ['ngResource']);

cloudBalanceServices.factory('UserService', function($http) {
    var URL = '/ng/user';
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
    var URL = '/ng/payee';
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


cloudBalanceServices.factory('Transaction', function($resource) {
	return	$resource('/ng/transaction', null, {
		query: {method:'GET', 
			transformResponse:function(data,headers) {
				return angular.fromJson(data);
			}
		},
		remove: {method:'POST',params:{action:'delete',id: '@id',parentid:'@parentid'}},
		star: {method:'POST',  params:{action:'star',  id: '@id',parentid:'@parentid'}},
		save: {method:'POST',  params: {action:'put',  name: '@name', payee:'@payee', amount: '@amount', type: '@type', date: '@date', memo: '@memo'}}
	});
});


