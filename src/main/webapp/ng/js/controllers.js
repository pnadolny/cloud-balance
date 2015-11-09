'use strict';

var cloudBalanceControllers = angular.module('cloudBalance.controllers', []);


var transactionController = function($scope, transaction, payees, $mdDialog) {

    $scope.transaction = transaction;
    $scope.payees = payees;
    $scope.memento = angular.copy(transaction);


    $scope.ok = function() {
        for (var i = 0; i < $scope.payees.length; i++) {
            if (transaction.payee === $scope.payees[i].name) {
                transaction.type = $scope.payees[i].type;
            }
        }
        $mdDialog.hide(transaction);
    };
    $scope.cancel = function() {
        angular.copy($scope.memento, transaction);
        $mdDialog.cancel();
    };


};


var ModalPayeeInstanceCtrl = function($scope, payee, $mdDialog) {
    $scope.isEditing = !angular.isUndefined(payee.name);
    $scope.payee = payee;
    $scope.ok = function() {
        $mdDialog.hide($scope.payee);
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
};



cloudBalanceControllers.controller('PayeeController', ['$scope', '$log', 'Payee', '$mdDialog', '$mdToast','hotkeys',
    function($scope, $log, Payee, $mdDialog, $mdToast,hotkeys) {

        init();

        function init() {
            $scope.pageSize = 25;
            $scope.payees = [];
            Payee.query(function(response) {
                $scope.payees = response;
            });
        }
        hotkeys.bindTo($scope).add({
            combo: 's',
            description: 'Search',
            callback: function(event, hotkey) {

                $scope.searching = !$scope.searching;

            }
        });

        $scope.remove = function(index) {

            Payee.remove({
                id: $scope.payees[index].name
            }, function(result) {

                if (!angular.isUndefined(result.error)) {

                    $mdToast.show($mdToast.simple().content(result.error.message));

                } else {

                    $mdToast.show(
                        $mdToast.simple()
                        .content(result.success.message)
                    );


                }
                $scope.payees.splice(index, 1);

            }, function(message) {

                $mdToast.show(
                    $mdToast.simple()
                    .content(message)
                );
            });
        }

        $scope.compose = function(payee) {

            if (angular.isUndefined(payee)) {
                payee = {
                    payeeType: 'i',
                    lastAmount: 0,
                    thisMonth: 0,
                    total: 0
                };

            }


            $mdDialog.show({
                templateUrl: 'payee-dialog.html',
                controller: ModalPayeeInstanceCtrl,
                resolve: {
                    payee: function() {
                        return payee;
                    }
                }
            }).then(function(payee) {


                var failFn = function(message) {

                    $mdToast.show(
                        $mdToast.simple()
                        .content(message)
                    );

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
    }
]);

cloudBalanceControllers.controller('SwitchableGridTransactionController', ['$resource', '$scope', '$log', 'hotkeys', '$filter', 'Transaction', 'Payee', '$mdDialog', '$mdToast',
    function($resource, $scope, $log, hotkeys, $filter, Transaction, Payee, $mdDialog, $mdToast) {

        init();

        function init() {

            $scope.cashFlowPageSize = 6;
            $scope.pageSize = 25;
            $scope.layout = 'list';

            $scope.cashFlow = [];
            $scope.balance = 0;



            $scope.transactions = [];

            Transaction.query(function(response) {
                $scope.transactions = response;
            });

            $scope.$watch(
                function() {
                    return $scope.transactions;
                },
                function(newValue, oldValue) {
                    $scope.balance = $scope.currentBalance();
                }, true
            );

            $scope.$watch(
                function() {
                    return $scope.layout;
                },
                function(newValue, oldValue) {
                    if (newValue === 'grid') {
                        $scope.computeCashFlow();
                    }
                }, true
            );

        };

        hotkeys.bindTo($scope).add({
            combo: 'b',
            description: 'Show current balance',
            callback: function(event, hotkey) {


                var message = 'Your balance is ' + $filter('currency')($scope.currentBalance(), '$') + ' and your available balance is ' + $filter('currency')($scope.availableBalance(), '$')
                $mdToast.show(
                    $mdToast.simple()
                    .content(message)
                );
            }
        });


        hotkeys.bindTo($scope).add({
            combo: 'c',
            description: 'Compose a transaction',
            callback: function(event, hotkey) {
                $scope.compose();
            }
        });

        hotkeys.bindTo($scope).add({
            combo: 'l',
            description: 'Switch to list view',
            callback: function(event, hotkey) {
                $scope.layout = 'list';

            }
        });

        hotkeys.bindTo($scope).add({
            combo: 'f',
            description: 'Switch to grid view',
            callback: function(event, hotkey) {
                $scope.layout = 'grid';
            }
        });

        hotkeys.bindTo($scope).add({
            combo: 's',
            description: 'Search',
            callback: function(event, hotkey) {
                $scope.searching = !$scope.searching;
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
                if (moment(transactions[i].date).isAfter(moment()) && transactions[i].type == 'i') {
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
            var averageCashFlow = 0;
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
                        discretionary: monthlyDiscretionary,
                        averageCashFlow: 0
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
                discretionary: monthlyDiscretionary,
                averageCashFlow: 0
            };
            $log.log(item);
            $scope.cashFlow.push(item);
            $log.log('Done..Computing monthly totals');



            var i = $scope.cashFlow.length;
            var counter = 1;
            while (i--) {
                var cashFlowItem = $scope.cashFlow[i];
                averageCashFlow = averageCashFlow + cashFlowItem.cashFlow;
                cashFlowItem.averageCashFlow = averageCashFlow / counter;
                counter++;
            }




        }


        $scope.compose = function(transaction, copy) {

            var payees = [];
            Payee.query(function(response) {


                for (var i = 0; i < response.length; i++) {
                    switch (response[i].type) {
                        case 'i':
                            payees.push({
                                name: response[i].name,
                                typeName: 'Income',
                                type: response[i].type,
                                payee: response[i].name
                            });
                            break;
                        case 's':
                            payees.push({
                                name: response[i].name,
                                typeName: 'Static',
                                type: response[i].type,
                                payee: response[i].name
                            });
                            break;
                        case 'd':
                            payees.push({
                                name: response[i].name,
                                typeName: 'Discretionary',
                                type: response[i].type,
                                payee: response[i].name
                            });
                            break;
                        case 'f':
                            payees.push({
                                name: response[i].name,
                                typeName: 'Future',
                                type: response[i].type,
                                payee: response[i].name
                            });
                            break;
                        case 'o':
                            payees.push({
                                name: response[i].name,
                                typeName: 'Other',
                                type: response[i].type,
                                payee: response[i].name
                            });
                            break;
                        default:
                            payees.push({
                                name: response[i].name,
                                typeName: 'Unkown',
                                type: response[i].type,
                                payee: response[i].name
                            });
                            break;
                    }
                }




                $mdDialog.show({
                    templateUrl: 'transaction-dialog.html',
                    controller: transactionController,
                    resolve: {
                        transaction: function() {

                            if (angular.isUndefined(transaction)) {
                                var newTransaction = {
                                    memo: '',
                                    date: moment().toDate()
                                };
                                return newTransaction;
                            }

                            if (copy) {
                                transaction = angular.copy(transaction);
                                transaction.name = undefined;
                            }
                            return transaction;
                        },
                        payees: function() {
                            return payees;
                        }
                    }
                }).then(function(transaction) {

                    var failFn = function(status) {

                    }
                    var successFn = function(resp) {
                        if (angular.isUndefined(transaction.name)) {
                            transaction.name = resp.key.id;
                            $scope.transactions.push(transaction);
                            if ($scope.layout == 'grid') {
                                $scope.computeCashFlow();
                            }

                        }
                    }
                    Transaction.save(transaction, successFn, failFn);
                    $mdToast.show($mdToast.simple().content('Item saved'));


                }, function() {

                    $log.info('Modal cancelled');
                });




            });




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

        $scope.copyToNextMonth = function(t) {

            var copy = angular.copy(t);


            copy.name=null;
            copy.date = moment(copy.date).add(1, 'month').toDate();
            var failFn = function(status) {

            }
            var successFn = function(resp) {

                 $mdToast.show($mdToast.simple().content('Copied to next month'));
                    copy.name = resp.key.id;
                    $scope.transactions.push(copy);
                    if ($scope.layout == 'grid') {
                        $scope.computeCashFlow();
                    }


          }

            Transaction.save(copy, successFn, failFn);


        }
        $scope.remove = function(t,ev) {

          var confirm = $mdDialog.confirm()
	            .title('Would you like to delete this item?')
	            .content('The item will be permenently deleted.')
	            .ariaLabel('Inactivate')
	            .targetEvent(ev)
	            .ok('Do it!')
	            .cancel('Cancel');
	        $mdDialog.show(confirm).then(function() {


              $scope.transactions.splice(findTransactionIndex(t), 1);
              var aTransaction = new Transaction({
                  id: t.name,
                  parentid: t.payee
              });
              aTransaction.$remove();
              $mdToast.show($mdToast.simple().content('Item deleted'));


	        }, function() {

	        });


        }
    }
]);



cloudBalanceControllers.controller('UserController', ['$mdSidenav', '$scope', '$location', '$window', 'User',
    function($mdSidenav, $scope, $location, $window, User) {

        $scope.emailAddress = null;
        $scope.logoutURL = null;

        User.query(function(response) {

            $scope.emailAddress = response[0].email;
            $scope.logoutURL = response[0].logoutURL;
            var e = angular.element(document.querySelector('#signout'));
            e.html('<a title="Sign out" href="' + response[0].logoutURL + '">Sign out</a>');
        });

        $scope.toggleSidenav = function(menuId) {
            $mdSidenav("left").toggle().then(function() {});
        };

        $scope.signout = function() {
            var u = $location.protocol() + "://" + $location.host() + ":" + $location.port() + $scope.logoutURL;
            $window.location.href = u;
        }
    }
]);
