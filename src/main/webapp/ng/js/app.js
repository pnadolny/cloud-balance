'use strict';

angular.module("cloudBalanceApp", ['ngResource', 'ngAnimate', 'chieffancypants.loadingBar',
    'cloudBalanceServices', 'ngMaterial',
    'cloudBalanceControllers', 'cloudBalanceFilters', 'cloudBalance.routes',
    'cloudBalanceDirectives', 'cfp.hotkeys'
]).config(function($httpProvider) {

    $httpProvider.defaults.transformResponse.push(function(responseData) {
        convertDateStringsToDates(responseData);
        return responseData;
    });
});


var regexIso8601 = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
function convertDateStringsToDates(input) {
    if (!angular.isObject(input)) {
        return input;
    }

    for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;
        var value = input[key];
        if (typeof value === "string" && (value.match(regexIso8601))) {
            input[key] = moment.utc(value, 'YYYY-MM-DD HH:mm:ss.SSS-05:00').toDate();
        } else if (typeof value === "object") {
            convertDateStringsToDates(value);
        }
    }
}
