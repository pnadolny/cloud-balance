'use strict';



var cloudBalanceDirectives = angular.module('cloudBalance.directives', []);


cloudBalanceDirectives.directive('appName', function() {
    return {
        template: 'Cloud Balance'
    };
});
