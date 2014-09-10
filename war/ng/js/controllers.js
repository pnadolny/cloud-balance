'use strict';

var cloudBalanceControllers = angular.module('cloudBalanceControllers', []);

var ModalInstanceCtrl = function ($scope, $modalInstance, transaction,PayeeService) {
	
	  $scope.transaction = transaction;
	  $scope.payees = [];
	  $scope.memento = angular.copy(transaction);
	  $scope.alerts = [];
	  
	  if (transaction.amount <=0) {
		  transaction.amount = transaction.amount * -1;
	  } else {
		  if (typeof(transaction.amount)!='undefined') {
			  transaction.deposit = true;  
		  }
	  }
	  
	  PayeeService.query(function(data){
			$scope.payees = data;
	   });
	  
	  $scope.closeAlert = function(index) {
	   	    $scope.alerts.splice(index, 1);
	  };
	  $scope.ok = function () {
		 
        $scope.alerts = [];
        
        if (angular.isUndefined(transaction.amount)) {
        	$scope.alerts.push({type: 'danger', msg: 'Amount is missing'});
			return;
        }
        
        if (transaction.amount < 0) {
        	$scope.alerts.push({type: 'danger', msg: 'Amount is negative'});
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
        
        if ( /^-{0,1}\d*\.{0,1}\d+$/.test(transaction.amount) == false) {
    		$scope.alerts.push({type: 'danger', msg: 'Amount must be a number'});
			return;
		}
		
		if (angular.isUndefined(transaction.payee)) {
			$scope.alerts.push({type: 'danger', msg: 'Payee is missing'});
			return;
		}
		if (angular.isUndefined(transaction.date)) {
			$scope.alerts.push({type: 'danger', msg: 'Date is missing'});
			return;
		}
		for (var i=0; i<$scope.payees.length; i++) {
			if (transaction.payee === $scope.payees[i].name) {
				transaction.type = $scope.payees[i].type;
			}
		}
		
	    $modalInstance.close(transaction);
	    
	  };
	  $scope.cancel = function () {
		  angular.copy($scope.memento,transaction);
		  $modalInstance.dismiss();
	  };
	 
	  
};


var ModalPayeeInstanceCtrl = function ($scope, $modalInstance, payee) {
	
	  $scope.isEditing = typeof(payee.name)!='undefined';
	  $scope.payee = payee;
	  $scope.alerts = [];
	  
	  $scope.closeAlert = function(index) {
	   	    $scope.alerts.splice(index, 1);
	  };
	  
	  $scope.ok = function () {
		
		$scope.alerts = [];

		if (angular.isUndefined(payee.name)) {
			$scope.alerts.push({type: 'danger', msg: 'Payee Name is missing.'});
			return;
		}
		if (!angular.isString(payee.name)) {
			$scope.alerts.push({type: 'danger', msg: 'Payee Name is not a string'});
			return;
		}
		if (/^[a-zA-Z0-9-() ]*$/.test(payee.name) == false) {
			$scope.alerts.push({type: 'danger', msg: 'Payee Name contains illegal characters.'});
			return;
		}
		if (angular.isUndefined(payee.type)) {
			$scope.alerts.push({type: 'danger', msg: 'Payee type is missing.'});
			return;
		}
			  
	    $modalInstance.close($scope.payee);
	  };
	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
};



cloudBalanceControllers.controller('PayeeController', ['$scope','$modal', '$log','Payees',
  function($scope,$modal, $log,Payees) {

	init();

	function init() {
		$scope.currentPage = 0;
	    $scope.pageSize = 25;
	    $scope.payees =[];
	    $scope.alerts = [];

	    Payees.query(function(data){
			$scope.payees = data;
		});
		
		
	}

    $scope.numberOfPages=function(){
        return Math.ceil($scope.payees.length/$scope.pageSize);                
    }
    

   	$scope.remove = function(index) {
   	 	var failFn=function(message){
   			$scope.alerts.push({type: 'danger', msg: message});
   		}
   		var successFn=function(data){
   			$scope.alerts.push({msg: data});
   			$scope.payees.splice(index,1);
   		}
	    Payees.deletePayee($scope.payees[index].name, successFn, failFn);
    }

   	$scope.compose = function(payee) {
		if (typeof(payee) == 'undefined') {
			  payee = {lastAmount:0, thisMonth:0, total:0};
			  
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
		      modalInstance.result.then(function (payee) {
		          $log.info('Modal dismissed with: ' + payee);
		          $scope.save(payee);
		      }, function () {
		        $log.info('Modal dismissed at: ' + new Date());
		      });
   		
   	}
   	
    
   	
	$scope.closeAlert = function(index) {
   	    $scope.alerts.splice(index, 1);
    };
	$scope.save = function(payee) {
		var failFn=function(message){
   			$scope.alerts.push({msg: message});
   		}
   		var successFn=function(data){
   			// $scope.alerts.push({msg: data});
   			$scope.payees.push(payee);
   		}
		Payees.save(payee,successFn,failFn);
	}	
	
	
}]);


cloudBalanceControllers.controller('SwitchableGridTransactionController', ['$scope','$modal', '$log','Transactions','Payees',
  function($scope,$modal, $log,Transactions,Payees) {

	
	 init();

	function init() {
		
		
		
		$scope.currentPage = 0;
	    $scope.pageSize = 30;
	    $scope.layout = 'list';
	    $scope.alerts = [];
	    $scope.cashFlow = [];
	    
		$scope.transactions = [];
	    Transactions.fetchTransactions(function(data){
	    	$scope.transactions = data;
		});

	}


	$scope.currentBalance=function() {

		
		$log.log('Current Balance!');
		
		// Copy
		var trans = angular.copy($scope.transactions);
		
		// Sort
		trans.sort(function(a,b){
    		return moment(b.date).valueOf() - moment(a.date).valueOf();
    	});
    	
		// Compute Balance
		var b=trans.length;
		var balance =0;
		while (b--) {
			balance = balance + Number(trans[b].amount);
			trans[b].balance = balance;
		}
		
		// Sort
		trans.sort(function(a,b){
    		return moment(a.date).valueOf() - moment(b.date).valueOf();
    	});
    	
		
		// Find the current balance
		var today = new Date(Date.now());
		var transactionDate;
		var currentBalance;
		var i = trans.length;
		while (i--) {
			$log.log('Finding balance...'+ trans[i].date + ' '+trans[i].balance);
			
			transactionDate = new Date(trans[i].date);
			if (transactionDate.getFullYear()  == today.getFullYear()) {
				if (transactionDate.getMonth()  == today.getMonth()) {
					if (transactionDate.getDate()  == today.getDate()) {
						if (!currentBalance) {
							currentBalance =trans[i].balance; 
						}
					}
				}
			}
			if (!currentBalance) {
				if (transactionDate.getTime()< today.getTime()) {
					currentBalance =trans[i].balance;
				}
			}
		}
		return currentBalance;
	}
	

    $scope.numberOfPages=function(){
        return Math.ceil($scope.transactions.length/$scope.pageSize);                
    }
    
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
      };
  
    $scope.computeCashFlow = function() {

    	$scope.transactions.sort(function(a,b){
    		return moment(a.date).valueOf()  - moment(b.date).valueOf();
    	});
    	
    	
    	$scope.cashFlow = [];
    	$log.log('Computing cash flow and monthly totals');
		var m;
		var monthlyCashFlow =0;
		var monthlyIncome = 0;
		var monthlyStatic = 0;
		var monthlyDiscretionary=0;
		var monthlyFuture = 0;
		var monthlyOther = 0;
		var amount;
		var item = {};
		var i = $scope.transactions.length;
		while (i--) {
			if (i+1==$scope.transactions.length) {
				m = moment($scope.transactions[i].date).format("MMM");
			}
			if (moment($scope.transactions[i].date).format("MMM")!=m) {
				$log.log("new month "+moment($scope.transactions[i].date).format("MMM") + i);
				item = {month: m,income: monthlyIncome, future:monthlyFuture, static: monthlyStatic, other: monthlyOther,cashFlow: monthlyCashFlow, discretionary: monthlyDiscretionary};
				$log.log(item);
				$scope.cashFlow.push(item);
				monthlyCashFlow = 0;
				monthlyIncome =0;
				monthlyDiscretionary =0;
				monthlyStatic = 0;
				monthlyOther = 0;
				monthlyFuture =0;
			}

			amount = Number($scope.transactions[i].amount);
			monthlyCashFlow = monthlyCashFlow +  amount;
			switch ($scope.transactions[i].type) {
				case "i":
					monthlyIncome = monthlyIncome +amount;
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
			m = moment($scope.transactions[i].date).format("MMM");
		}
		item = {month: m,income: monthlyIncome, future:monthlyFuture, static: monthlyStatic, other: monthlyOther,cashFlow: monthlyCashFlow, discretionary: monthlyDiscretionary};
		$log.log(item);
		$scope.cashFlow.push(item);
		$log.log('Done..Computing monthly totals');
    }
    
    
    $scope.compose = function (transaction,copy) {
 		
      var modalInstance = $modal.open({
        templateUrl: 'transaction.html',
        controller: ModalInstanceCtrl,
        resolve: {
          transaction: function() {
        	  
        	  if (typeof(transaction) == 'undefined') {
        		    var date = new Date();
        		    var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
                    var newTransaction = {memo:'',date:today};
                    return newTransaction;
               }
        	  if (copy) {
        			transaction = angular.copy(transaction);
        			transaction.name =undefined;
              }
        	  return transaction;
          },
          PayeeService: function() {
        	  return Payees;
          }
        }
      });
      
      modalInstance.result.then(function (transaction) {
    	  
    	  var shouldPush = typeof(transaction.name) == 'undefined';
    	  $log.info('Modal dismissed with: ' + transaction);
    	  var failFn=function(status){
     			$scope.alerts.push({msg: status});
     	  }
     	  var successFn=function(resp){
     			if (shouldPush) {
         			var key = resp.key;
         			transaction.name= key.id;
     				$scope.transactions.push(transaction);
     			}
     			$scope.computeCashFlow();
     			
     	  }

     	  var date = new Date(transaction.date);
     	  transaction.date = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
  		  transaction.action = 'PUT';
          Transactions.saveTransaction(transaction, successFn, failFn);
          
          
      }, function () {
    	  $log.info('Modal cancelled at: ' + new Date());
      });
    };
    
    
    $scope.closeAlert = function(index) {
   	    $scope.alerts.splice(index, 1);
    };
	
    var findTransactionIndex = function(t) {
		var index =0;
	    for (var i=0; i<$scope.transactions.length; i++) {
	    	if ($scope.transactions[i].name ==t.name) {
	    		if ($scope.transactions[i].payee == t.payee) {
	    			index =i;
	    			break;
	    		}
	    	}
	    }
	    return index;
		
	}
	$scope.remove = function(t) {
	    $scope.transactions.splice(findTransactionIndex(t),1);
	    Transactions.deleteTransaction(t.name,t.payee);
    }
}]);


cloudBalanceControllers.controller('UserController', ['$scope','$location','$window','UserService',  function($scope,$location,$window,UserService) {
	
	$scope.emailAddress = {};
	$scope.logoutURL = {};
		
	UserService.query(function(data){
		   $scope.emailAddress = data[0].email;
		   $scope.logoutURL = data[2].logoutURL;
		   
		   // The following should be temporary as I figure how to do this the angular way...
		   var e = angular.element( document.querySelector( '#signout' ));
		   e.html('<a title="Sign out" href="' + data[2].logoutURL + '">Sign out</a>');
		});
	
	$scope.signout = function() {
		var u = $location.protocol() +"://" + $location.host() +":" + $location.port() + $scope.logoutURL; 
		$window.location.href = u;
	}
	// http://www.yearofmoo.com/2012/10/more-angularjs-magic-to-supercharge-your-webapp.html#apply-digest-and-phase
	var changeLocation = function(url, force) {
		
		  $location.path(url); //use $location.path(url).replace() if you want to replace the location instead

		  $scope = $scope || angular.element(document).scope();
		  if(force || !$scope.$$phase) {
		    //this will kickstart angular if to notice the change
		    $scope.$apply();
		  }
		};
		
                                                     	                                                     	
 }]);





