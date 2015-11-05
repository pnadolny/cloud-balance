'use strict';

var cloudBalanceServices = angular.module('cloudBalanceServices', ['ngResource']);

cloudBalanceServices.factory('User', function($resource) {
	return	$resource('/ng/resources/user');
});
cloudBalanceServices.factory('Payee', function($resource) {
	return	$resource('/ng/resources/payee', {year: moment().format('YYYY')}, {
		remove: {method:'DELETE',params:{id: '@id'}},
		save:   {method:'PUT',  params:{name: '@name', type: '@type', date: '@date'}}
	});
});
cloudBalanceServices.factory('Transaction', function($resource) {
	return	$resource('/ng/resources/transaction', null, {
		remove: {method:'DELETE',params:{id: '@id',parentid:'@parentid'}},
		save: {method:'PUT',  params: {name: '@name', payee:'@payee', amount: '@amount', type: '@type', date: '@date', memo: '@memo'}}
	});
});
