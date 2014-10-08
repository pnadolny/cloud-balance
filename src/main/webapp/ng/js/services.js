'use strict';

var cloudBalanceServices = angular.module('cloudBalanceServices', ['ngResource']);

cloudBalanceServices.factory('User', function($resource) {
	return	$resource('/ng/user', {year: moment().format('YYYY')}, {
		query: {method:'GET', 
			transformResponse:function(data,headers) {
				return angular.fromJson(data);
			}
		}
	});
});



cloudBalanceServices.factory('Payee', function($resource) {
	return	$resource('/ng/payee', {year: moment().format('YYYY')}, {
		query: {method:'GET', 
			transformResponse:function(data,headers) {
				return angular.fromJson(data);
			}
		},
		remove: {method:'DELETE',params:{id: '@id'}},
		save:   {method:'POST',  params:{name: '@name', type: '@type', date: '@date'}}
	});
});


cloudBalanceServices.factory('Transaction', function($resource) {
	return	$resource('/ng/transaction', null, {
		query: {method:'GET', 
			transformResponse:function(data,headers) {
				return angular.fromJson(data);
			}
		},
		remove: {method:'DELETE',params:{id: '@id',parentid:'@parentid'}},
		star: {method:'POST',  params:{action:'star',  id: '@id',parentid:'@parentid'}},
		save: {method:'POST',  params: {action:'put',  name: '@name', payee:'@payee', amount: '@amount', type: '@type', date: '@date', memo: '@memo'}}
	});
});


