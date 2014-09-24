'use strict';

/* Filters */

var cloudBalanceFilters = angular.module('cloudBalanceFilters', []);

cloudBalanceFilters.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

cloudBalanceFilters.filter('calcBalance', function() {
    return function(input) {
        var i = input.length;
        var balance = 0;
        while (i--) {
            balance = balance + Number(input[i].amount);
            input[i].balance = balance;
        }
        return input;
    }
});

cloudBalanceFilters.filter('addSortableDate', function() {
    return function(input) {
        for (var i = 0; i < input.length; i++) {
            input[i].sortableDate = new Date(input[i].date).getTime();
        }
        return input;
    }
});