'use strict';


var volleyballApp = angular.module('volleyballApp',[]);

volleyballApp.controller('VolleyballController', ['$scope', function($scope) {
  
     $scope.hideVisitor =false;
	 $scope.hideServing =false;
     $scope.hideSetting =false;
  
  
     $scope.homeScore = 0;
     $scope.visitorScore = 0;
     $scope.homeSubs = 0;
     $scope.visitorSubs = 0;
  
    $scope.init = function() {
  	 $scope.homeScore = 0;
     $scope.visitorScore = 0;
     $scope.homeSubs = 0;
     $scope.visitorSubs = 0;
     
     $scope.resetSetting();
     $scope.resetServer();
  	}
  
  
  // Setting
	$scope.setExcellant = 0;
    // Number of sets mistakes that result in oppenent score
    $scope.setFault = 0;
    // Number of sets that are not excellent and not faults
    $scope.setStill = 0;
    $scope.setKill = 0;

    $scope.resetSetting = function() {
    
    	$scope.setExcellant = 0;
    	// Number of sets mistakes that result in oppenent score
    	$scope.setFault = 0;
    	// Number of sets that are not excellent and not faults
    	$scope.setStill = 0;
    	$scope.setKill = 0;
    
    };
    
  
  // Serving
    $scope.servingAce = 0;
    $scope.servingAttempt = 0;
    $scope.servingFault = 0;
    
  	$scope.resetServer = function() {
  		$scope.servingAce = 0;
    	$scope.servingAttempt = 0;
    	$scope.servingFault = 0;
  	
  	}
  
  
  	// Scoring
  	$scope.spike = 0;
    $scope.block = 0;
    
    
    // Spikers
    $scope.attackShots = 0;
    $scope.attackFault = 0; // attack error, oppenent scores directly
    $scope.attackSpike = 0; // scoring attack
    

	// Blocking
    $scope.blockKill = 0;
    $scope.blockFault = 0;
    $scope.blockRebound = 0;
    $scope.blockAttempt = 0;

	// Digging
	$scope.digExcellent = 0;
	$scope.digFault = 0;
	$scope.digReception = 0;
	$scope.digAttempt = 0;
	
	// Receivers
    $scope.receiveExcellent = 0;
	$scope.receiveFault = 0;
	$scope.receiveAttempt = 0;
	
	
    
	
      
    
    $scope.rotation = 1;
    $scope.pass = 0;
    $scope.set = 0;
    $scope.setMiddle = 0;
    
    $scope.bumpHomeScore = function() {
  		$scope.homeScore = $scope.homeScore + 1;
  	}
  	$scope.bumpVisitorScore = function() {
 		  $scope.visitorScore = $scope.visitorScore +1;
 
  	}
  	
  	
  	$scope.bumpRotation = function() {
  	
		if ($scope.rotation == 6) {
			$scope.rotation = 1;
			return;
		}
		  	
  		$scope.rotation = $scope.rotation +1 ;
  
  	
  	}
  
  
}]);

