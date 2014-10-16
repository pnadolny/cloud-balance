'use strict';

var cloudBalanceControllers = angular.module('cloudBalanceControllers', []);
var ModalInstanceCtrl = function($scope, $modalInstance, transaction, Payee) {
	
    $scope.transaction = transaction;
    $scope.payees = [];
    
    Payee.query(function(response) {
        $scope.payees = response;
    });

    
    $scope.memento = angular.copy(transaction);
    $scope.alerts = [];


    if (transaction.amount <= 0) {
        transaction.amount = transaction.amount * -1;
    } else {
        if (typeof(transaction.amount) != 'undefined') {
            transaction.deposit = true;
        }
    }

    
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    
    $scope.ok = function() {

        $scope.alerts = [];

        if (angular.isUndefined(transaction.amount)) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Amount is missing'
            });
            return;
        }

        if (transaction.amount < 0) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Amount is negative'
            });
            return;
        }

        if (!transaction.deposit) {
            transaction.amount = transaction.amount * -1;
        }

        /*^ match beginning of string
        -{0,1} optional negative sign
        \d* optional digits
        \.{0,1} optional decimal point
        \d+ at least one digit
        $/ match end of string
        
        
        http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
        */

        if (/^-{0,1}\d*\.{0,1}\d+$/.test(transaction.amount) == false) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Amount must be a number'
            });
            return;
        }

        if (angular.isUndefined(transaction.payee)) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Payee is missing'
            });
            return;
        }
        if (angular.isUndefined(transaction.date)) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Date is missing'
            });
            return;
        }
        for (var i = 0; i < $scope.payees.length; i++) {
            if (transaction.payee === $scope.payees[i].name) {
                transaction.type = $scope.payees[i].type;
            }
        }

        $modalInstance.close(transaction);

    };
    $scope.cancel = function() {
        angular.copy($scope.memento, transaction);
        $modalInstance.dismiss();
    };


};


var ModalPayeeInstanceCtrl = function($scope, $modalInstance, payee) {

	$scope.isEditing = !angular.isUndefined(payee.name);
    $scope.payee = payee;
    $scope.alerts = [];

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.ok = function() {

        $scope.alerts = [];

        if (angular.isUndefined(payee.name)) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Payee Name is missing.'
            });
            return;
        }
        if (!angular.isString(payee.name)) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Payee Name is not a string'
            });
            return;
        }
        if (/^[a-zA-Z0-9-() ]*$/.test(payee.name) == false) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Payee Name contains illegal characters.'
            });
            return;
        }
        if (angular.isUndefined(payee.type)) {
            $scope.alerts.push({
                type: 'danger',
                msg: 'Payee type is missing.'
            });
            return;
        }

        $modalInstance.close($scope.payee);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};



cloudBalanceControllers.controller('PayeeController', ['$scope', '$modal', '$log', 'Payee',
    function($scope, $modal, $log, Payee) {

	 	init();

        function init() {
            $scope.pageSize = 25;
            $scope.payees = [];
            $scope.alerts = [];
            Payee.query(function(response) {
	            $scope.payees = response;
	        });
        }

        $scope.remove = function(index) {

        	Payee.remove({id: $scope.payees[index].name}, function(result) {

        		if (!angular.isUndefined(result.error)) {
            		$scope.alerts.push({
            		    type: 'warning',
                        msg: result.error.message
                    });
                    return;
            	} else {
            		
            		$scope.alerts.push({
            			type: 'success',
                        msg: result.success.message
                    });
            		
            	}
                $scope.payees.splice(index, 1);
                
            }, function(message) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: message
                });
            });
        }

        $scope.compose = function(payee) {
        	
        	if (angular.isUndefined(payee)) {
                payee = {
                    lastAmount: 0,
                    thisMonth: 0,
                    total: 0
                };

            }

            var modalInstance = $modal.open({
                templateUrl: 'payee.html',
                controller: ModalPayeeInstanceCtrl,
                resolve: {
                    payee: function() {
                        return payee;
                    }
                }
            });
            modalInstance.result.then(function(payee) {

            	$log.info('Modal dismissed with: ' + angular.toJson(payee));
                var failFn = function(message) {
                    $scope.alerts.push({
                        msg: message
                    });
                }
                var successFn = function(data) {
                	
                	Payee.query(function(response) {
        	            $scope.payees = response;
        	        }); 	
                }
                Payee.save(payee, successFn, failFn);
                
            }, function() {
                $log.info('Modal dismissed');
            });

        }



        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

    }
]);


cloudBalanceControllers.controller('SwitchableGridTransactionController', ['$resource','$scope', '$modal', '$log', 'hotkeys','$filter','Transaction','Payee',
    function($resource, $scope, $modal, $log, hotkeys,$filter,Transaction,Payee) {

	    init();
	
	    function init() {
	        
	    	$scope.cashFlowPageSize = 6;
	        $scope.pageSize = 25;
	        $scope.layout = 'list';
	        $scope.alerts = [];
	        $scope.cashFlow = [];
	        $scope.balance =0;
	        
	        
	        
	        $scope.transactions = [];
	        
	        Transaction.query(function(response) {
	            $scope.transactions = response;
	        });
	        
	        $scope.$watch(
	        		function () {return $scope.transactions;},
	             	function(newValue, oldValue) {
	        			   $log.log('Watch executing...');
	        			   $scope.computeCashFlow();
	        			 $scope.balance = $scope.currentBalance();
	        			 $log.log('Watch done...');
	        		       
	        		},true
	       );

	    };     	    

	    hotkeys.add({
            combo: 'b',
            description: 'Show current balance',
            callback: function(event, hotkey) {
            	
            	$scope.alerts = [];
            	$scope.alerts.push({
                    type: 'success',
                    msg: 'Your balance is '+$filter('currency')($scope.currentBalance(),'$') + ' and your available balance is '+$filter('currency')($scope.availableBalance(),'$') 
                });

            	$scope.alerts.push();
            }
        });


        hotkeys.add({
            combo: 'c',
            description: 'Compose a transaction',
            callback: function(event, hotkey) {
                $scope.compose();
            }
        });

        hotkeys.add({
            combo: 'l',
            description: 'Switch to list view',
            callback: function(event, hotkey) {
                $scope.layout = 'list';

            }
        });

        hotkeys.add({
            combo: 'f',
            description: 'Switch to grid view',
            callback: function(event, hotkey) {

                $scope.layout = 'grid';
               
            }
        });

        
        $scope.currentBalance = function() {
            var balance = 0;
            var transactions = angular.copy($scope.transactions);
            transactions.sort(function(a, b) {
                return moment(b.date).valueOf() - moment(a.date).valueOf();
            });
            var i = transactions.length;
            while (i--) {
            	if (moment(transactions[i].date).isAfter(moment())) {
                	return balance;
                }
            	balance = balance + Number(transactions[i].amount);
            }
            return balance;
        }

        $scope.availableBalance = function() {
            var balance = 0;
            var transactions = angular.copy($scope.transactions);
            transactions.sort(function(a, b) {
                return moment(b.date).valueOf() - moment(a.date).valueOf();
            });
            var i = transactions.length;
            while (i--) {
            	if (moment(transactions[i].date).isAfter(moment()) && transactions[i].type=='i') {
                	return balance;
                }
            	
            	balance = balance + Number(transactions[i].amount);
            }
            return balance;
        }

        
        $scope.computeCashFlow = function() {

        	var transactionsCopy = angular.copy($scope.transactions)
        	
            transactionsCopy.sort(function(a, b) {
                return moment(a.date).valueOf() - moment(b.date).valueOf();
            });


            $scope.cashFlow = [];
            $log.log('Computing cash flow and monthly totals');
            var m;
            var monthlyCashFlow = 0;
            var monthlyIncome = 0;
            var monthlyStatic = 0;
            var monthlyDiscretionary = 0;
            var monthlyFuture = 0;
            var monthlyOther = 0;
            var amount;
            var item = {};
            var i = transactionsCopy.length;
            while (i--) {
                if (i + 1 == transactionsCopy.length) {
                    m = moment(transactionsCopy[i].date).format("MMM");
                }
                if (moment(transactionsCopy[i].date).format("MMM") != m) {
                    $log.log("new month " + moment($scope.transactions[i].date).format("MMM") + i);
                    item = {
                        month: m,
                        income: monthlyIncome,
                        future: monthlyFuture,
                        static: monthlyStatic,
                        other: monthlyOther,
                        cashFlow: monthlyCashFlow,
                        discretionary: monthlyDiscretionary
                    };
                    $log.log(item);
                    $scope.cashFlow.push(item);
                    monthlyCashFlow = 0;
                    monthlyIncome = 0;
                    monthlyDiscretionary = 0;
                    monthlyStatic = 0;
                    monthlyOther = 0;
                    monthlyFuture = 0;
                }

                amount = Number(transactionsCopy[i].amount);
                monthlyCashFlow = monthlyCashFlow + amount;
                switch (transactionsCopy[i].type) {
                    case "i":
                        monthlyIncome = monthlyIncome + amount;
                        break;
                    case "s":
                        monthlyStatic = monthlyStatic + amount;
                        break;
                    case "d":
                        monthlyDiscretionary = monthlyDiscretionary + amount;;
                        break;
                    case "f":
                        monthlyFuture = monthlyFuture + amount;
                        break;
                    default:
                        monthlyOther = monthlyOther + amount;
                }
                m = moment(transactionsCopy[i].date).format("MMM");
            }
            item = {
                month: m,
                income: monthlyIncome,
                future: monthlyFuture,
                static: monthlyStatic,
                other: monthlyOther,
                cashFlow: monthlyCashFlow,
                discretionary: monthlyDiscretionary
            };
            $log.log(item);
            $scope.cashFlow.push(item);
            $log.log('Done..Computing monthly totals');
        }


        $scope.compose = function(transaction, copy) {

            var modalInstance = $modal.open({
                templateUrl: 'transaction.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    transaction: function() {

                    	if (angular.isUndefined(transaction)) {
                            var date = new Date();
                            var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                            var newTransaction = {
                                memo: '',
                                date: today
                            };
                            return newTransaction;
                        }
                        
                        if (copy) {
                            transaction = angular.copy(transaction);
                            transaction.name = undefined;
                        }
                        return transaction;
                    },
                    PayeeService: function() {
                        return Payee;
                    }
                }
            });

            modalInstance.result.then(function(transaction) {

                $log.info('Modal dismissed with: ' + transaction);

                var failFn = function(status) {
                    $scope.alerts.push({
                        msg: status
                    });
                }
                var successFn = function(resp) {
                	
                      transaction.name = resp.key.id;
                      $scope.transactions.push(transaction);
                    
                	
                }
                
                var date = new Date(transaction.date);
                transaction.date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                
                Transaction.save(transaction,successFn,failFn);
                
                
                
                
            }, function() {
            	
                $log.info('Modal cancelled');
            });
        };


        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        
        var findTransactionIndex = function(t) {
            var index = 0;
            for (var i = 0; i < $scope.transactions.length; i++) {
                if ($scope.transactions[i].name == t.name) {
                    if ($scope.transactions[i].payee == t.payee) {
                        index = i;
                        break;
                    }
                }
            }
            return index;

        }
        
        $scope.remove = function(t) {
        	$scope.transactions.splice(findTransactionIndex(t), 1);
        	var aTransaction = new Transaction({id: t.name, parentid: t.payee});
            aTransaction.$remove();
            
        }
    }
]);


cloudBalanceControllers.controller('UserController', ['$scope', '$location', '$window', 'User',
    function($scope, $location, $window, User) {

        $scope.emailAddress = {};
        $scope.logoutURL = {};

        User.query(function(response) {
            $scope.emailAddress = response[0].email;
            $scope.logoutURL = response[2].logoutURL;
            var e = angular.element(document.querySelector('#signout'));
            e.html('<a title="Sign out" href="' + response[2].logoutURL + '">Sign out</a>');
        });

        $scope.signout = function() {
            var u = $location.protocol() + "://" + $location.host() + ":" + $location.port() + $scope.logoutURL;
            $window.location.href = u;
        }
    }
]);