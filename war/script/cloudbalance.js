
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode

'use strict';

/**
 * @fileoverview
 * Provides methods for the Cloud Balance Google app engine application
 *
 * @author psnadolny@gmail.com (Paul Nadolny)
 */


/**
 * New Object.  Same as 
 * 
 * var mycloudbalance = new Object();
 * 
 * or 
 * 
 * var mycloudbalance = Object.create(Object.prototype);
 * 
 * 
 * The Module pattern encapsulates "privacy", state and organization using closures. 
 * It provides a way of wrapping a mix of public 
 * and private methods and variables, protecting pieces from leaking into the global scope and 
 * accidentally colliding with another developer's interface. 
 */


var mycloudbalance = mycloudbalance || {};

mycloudbalance.appspot = mycloudbalance.appspot || {};

mycloudbalance.appspot.transactionArchive = {};

mycloudbalance.appspot.config = {
		defaultAccountName: 'Cloud Balance',
		pageSize: 10,
		autoHideTransactionMonths:true
		
};
mycloudbalance.appspot.payeeTypes= {
		o:"Other",
		i:"Income",
		s:"Static",
		d:"Discretionary",
		f:"Future"
};
mycloudbalance.appspot.ENTITY_TRANSACTION='transaction';

mycloudbalance.appspot.ENTITY_PAYEE='payee';

mycloudbalance.appspot.CHARTS='charts';

mycloudbalance.appspot.MAPS='maps';

mycloudbalance.appspot.ADMINISTER='administer';


mycloudbalance.appspot.TOTAL_RECORDS='Total Records ';

mycloudbalance.appspot.reportConfiguration = function () {
  console.log( "Default account name: " + ( this.config.defaultAccountName) );
  console.log( "Page size is: " + ( this.config.pageSize) );
  console.log( "Auto Hide Transactions: " + ( this.config.autoHideTransactionMonths) );
}

mycloudbalance.appspot.updateConfiguration =  function( newConfig ) {
  if ( typeof newConfig === "object" ) {
    this.config = newConfig;
  }
}




mycloudbalance.appspot.payeeType =function(key) {
	if (typeof(key) == 'undefined') {
		return '';
	}
	return mycloudbalance.appspot.payeeTypes[key];
}

mycloudbalance.appspot.init =function() {

	if(typeof console === "undefined") {
		
		console = {
		        log: function() { },
		        debug: function() { }
		    };
	}

	
	this.reportConfiguration();
	
	$(document).bind("ajaxSend", function(){
		   $("#loading").fadeIn();
		   $("#errors").html('');
		 }).bind("ajaxComplete", function(){
		   $("#loading").fadeOut();
		 });
	
	 $.ajaxSetup({
	        error: function(jqXHR, exception) {
	            if (jqXHR.status === 0) {
	            	$("#errors").html('Not connecting.\n Verify Network.');
	            } else if (jqXHR.status == 404) {
	            	$("#errors").html('Requested page not found. [404]');
	            } else if (jqXHR.status == 500) {
	            	$("#errors").html('Internal Server Error [500].');
	            } else if (exception === 'parsererror') {
	            	$("#errors").html('Requested JSON parse failed.');
	            } else if (exception === 'timeout') {
	            	$("#errors").html('Time out error.');
	            } else if (exception === 'abort') {
	            	$("#errors").html('Ajax request aborted.');
	            } else {
	            	$("#errors").html('Uncaught Error.\n' + jqXHR.responseText);
	            }
	        }
	    });
	
	showTab(mycloudbalance.appspot.ENTITY_TRANSACTION);
	
	//adding event listeners to the tabs
	$('#tabs a').click(function(event) {
		showTab(event.currentTarget.id);
	});
	// set the logged on user, logout URL 
	showUserInformation();
	showAccountName();
	
	$( "#datepicker" ).datepicker({
      numberOfMonths: 2,
      showButtonPanel: true
 	});
	
	$('#amount').blur(function() {
		$(this).formatCurrency({ colorize: true, negativeFormat: '-%s%n', roundToDecimalPlace: 2 });
	})
 	
	// Auto hide previous 12 months (todo hide all previous months).  .
	if (this.config.autoHideTransactionMonths) {
		var m = new moment();
		for (var i = 0; i<12; i++) {
			m.subtract('months',1);
			mycloudbalance.appspot.transactionArchive[m.format("MMMYYYY")] = m.format("MMMYYYY");
		}
	}
	
}
 


Number.prototype.formatMoney = function(){
	
	return accounting.formatMoney(this, {
		symbol: "$",
		precision: 2,
		thousand: ",",
		format: {
			pos : "%s %v",
			neg : "%s (%v)",
			zero: "%s  --"
		}
	});

	
};

  
var updateAreaChart = function() {
	
	var buildKey = function(d) {
		return d.getMonth()+1 + '/'+d.getDate().toString() + '/'+d.getFullYear();
	}
	var failFn=function(resp){
		$('#areaChart_div').html('<h2>Failed drawing chart</h2>');
	}
	var successFn=function(resp){
		
		if (resp) {
			if (resp.data.length==0) {
				return;
			}
		}
		
		// 30 Day.....
		if (resp) {
			var data  ='';
			var balance =0;
			var dataTable = new google.visualization.DataTable();
			
			
			data = resp.data;
         	 dataTable.addColumn({type:'string',label:'Day'});
			dataTable.addColumn({type:'number',label:'Balance'});
			dataTable.addColumn({type:'string',role:'annotation'});
			dataTable.addColumn({type:'string',role:'tooltip'});
		
			// Could have also used []...push() method... 
			
			var set = {};
			for (var i=0;i<data.length;i++){
				balance += parseFloat(data[i].amount);
				set[buildKey(new Date(data[i].date))] = balance;
			}
			
			// Find the current balance
			var bal = 0;
			var today = new Date(Date.now());
			for (var i=0;i<data.length;i++){
				if (new Date(data[i].date).getTime() >= today.getTime()) {
					break;
				}
				bal += parseFloat(data[i].amount);
			}
			
			var thiryDaysAgo = new Date(Date.now());
			thiryDaysAgo.setDate(thiryDaysAgo.getDate() -30);
			var firstTransactionDate = new Date(data[0].date);
			for (var d =  new Date(); d >= thiryDaysAgo; d.setDate(d.getDate() - 1)) {
				var key = buildKey(d);
				if (d.getTime() < firstTransactionDate.getTime()) {
					bal = 0;
					dataTable.addRow([key,bal,d.getDate().toString(),(bal).formatMoney()]);
					continue;
				}
				var key = buildKey(d);
				if (key in set) {
					dataTable.addRow([key,set[key],d.getDate().toString(),(set[key]).formatMoney()]);
					bal = set[key];
				} else {
					dataTable.addRow([key,bal,d.getDate().toString(),(bal).formatMoney()]);
				}
					
			}
			 var options = {
			          title: 'Balance history',
			          titleTextStyle: {color : 'black', fontName:'arial', bold: false}, 
			          hAxis: {title: 'Day',  titleTextStyle: {color: '#333'}},
			          vAxis: {minValue: 0},
			          legend: {position:'none'}
			        };
			var chart = new google.visualization.AreaChart(document.getElementById('areaChartBalanceHistory_div'));
		    chart.draw(dataTable, options);
		}
	}
	getData('/cb/'+mycloudbalance.appspot.ENTITY_TRANSACTION,null,successFn,failFn,0);
}
	 
	 
	 

var updateMoneyMap = function() {

	var failFn = function(resp) {
		alert(resp);
	}

	var successFn = function(resp) {

		if (resp) {
			if (resp.data.length == 0) {
				return;
			}
		}
		if (resp) {
			
			var data = '';
			data = resp.data;
			var treeData = new google.visualization.DataTable();
			treeData.addColumn('string');
			treeData.addColumn('string');
			treeData.addColumn('number');
			treeData.addColumn('number');
			treeData.addRow([ 'All', null, 0, 0 ]);
			
			var set = {};
			for (var i = 0; i < data.length; i++) {
				if (data[i].type=='i') {
					continue;
				}
				set[data[i].type] = data[i].type;
			}
			var xx =1;
			for (var i in set) {
				var total = 0;
				var payeeType = mycloudbalance.appspot.payeeType(set[i]);
				for (var x = 0; x < data.length; x++) {
					if (data[x].type==set[i]) {
						total  = total + Math.abs(Number(data[x].total));
					}
				}
				xx = xx +1;
				treeData.addRow([payeeType +' '+(total).formatMoney(),'All', total,xx]);
			}
			

			/*
			treeData.addRow([ 'Money in ', 'All', 0, 0 ]);
			treeData.addRow([ 'Money out ', 'All', 0, 0 ]);

			var parent = 'Money in ';
			for (var i = 0; i < data.length; i++) {
				var total = parseFloat(data[i].total);
				if (total > 0) {
					treeData.addRow([
							data[i].name + ' '+(Math.abs(total)).formatMoney(), parent,
							total, i ]);
				}

			}
			parent = 'Money out ';
			for (var i = 0; i < data.length; i++) {
				var total = parseFloat(data[i].total);
				if (total < 0) {
					treeData.addRow([
							data[i].name + ' '+(Math.abs(total)).formatMoney(), parent,
							total * -1, i * -1 ]);
				}
			}
			
			*/
			
			var tree = new google.visualization.TreeMap(document
					.getElementById('moneyMap_div'));
			tree.draw(treeData, {
				minColor : '#f00',
				midColor : '#ddd',
				maxColor : '#0d0',
				headerHeight : 15,
				title : 'Money map (all time)',
	            titleTextStyle: {color : 'black', fontName:'arial', bold: false, fontSize:14}, 
				fontColor : 'black',
				showScale : false
			});
		}

		var monthlyTreeData = new google.visualization.DataTable();
		monthlyTreeData.addColumn('string');
		monthlyTreeData.addColumn('string');
		monthlyTreeData.addColumn('number');
		monthlyTreeData.addColumn('number');

		
		var r = moment().format("MMMM");
		monthlyTreeData.addRow([r, null, 0, 0 ]);
		var totalMonthlyCash = 0;
		var totalMonthlyExpenses = 0;

		for (var i = 0; i < data.length; i++) {
			if (parseFloat(data[i].thisMonth) > 0) {
				totalMonthlyCash = totalMonthlyCash
						+ parseFloat(data[i].thisMonth);
			} else {
				totalMonthlyExpenses = totalMonthlyExpenses
						+ parseFloat(data[i].thisMonth);
			}
		}
		var cashKey = 'Money in ' + (totalMonthlyCash).formatMoney();
		var expenseKey = 'Money out ' + (totalMonthlyExpenses).formatMoney();

		monthlyTreeData.addRow([ cashKey, r, totalMonthlyCash, 0 ]);
		monthlyTreeData.addRow([ expenseKey, r, totalMonthlyExpenses, 0 ]);
		
		for (var i = 0; i < data.length; i++) {
			var total = parseFloat(data[i].thisMonth);
			if (total > 0) {
				monthlyTreeData.addRow([
						data[i].name + ' '+ (Math.abs(total)).formatMoney(),
						cashKey, total, i ]);
			}
		}
		for (var i = 0; i < data.length; i++) {
			var total = parseFloat(data[i].thisMonth);
			if (total < 0) {
				monthlyTreeData.addRow([
						data[i].name + ' '+(Math.abs(total)).formatMoney(),
						expenseKey, total * -1, i * -1 ]);
			}
		}

		var monthlyTree = new google.visualization.TreeMap(document
				.getElementById('monthlyMoneyMap_div'));
		
		var today = $.datepicker.formatDate('DD MM dd, yy', new Date());
		monthlyTree.draw(monthlyTreeData, {
			minColor : '#f00',
			midColor : '#ddd',
			maxColor : '#0d0',
			headerHeight : 15,
			title : 'Money map as of '+today,
            titleTextStyle: {color : 'black', fontName:'arial', bold: false, fontSize:14}, 
			fontColor : 'black',
			showScale : false
		});

	}

	getData('/cb/' + mycloudbalance.appspot.ENTITY_PAYEE, null, successFn, failFn, -1);

}

var showAccountName = function() {
	
	var successFn=function(resp){
		$('#gc-accountName').html(mycloudbalance.appspot.config.defaultAccountName);
		var accountName = resp.data[0].accountName;
		if (accountName !==null) {
			$('#gc-accountName').html(accountName);
			//document.title = accountName;

		}
		
	}
	getData('/cb/'+ mycloudbalance.appspot.ADMINISTER,null,successFn,null,null);
}


var showUserInformation = function() {
	var successFn=function(resp){
		$('#gc-userinformation').hide();
		$('#gc-userinformation').html(resp.data[0].email + '&nbsp&nbsp&nbsp<a title="Feedback" href="https://code.google.com/p/cloudbalance/issues/list">Feedback</a>&nbsp&nbsp&nbsp<a title="Sign out" href="' + resp.data[2].logoutURL + '">Sign out</a>');
		$('#gc-userinformation').fadeIn();
	}
	var failFn=function(resp){
		$('#gc-userinformation').html('Failed getting user information!');
	}
	getData('/cb/user',null,successFn,failFn,null);
}


var showTab = function(entity) {
	//remove the active class from all the tabs
	$('.tab').removeClass("active");
	//setting the active class to the selected tab
	$('#'+entity).addClass("active");
	//hiding all the tabs
	$('.g-unit').hide();
	//showing the selected tab
	$('#' + entity + '-tab').show();
	//hiding the create block
	showHideCreate(entity, false,false);
	$('#'+entity+'-search-reset').click();
}

//function to show/hide create block for an entity in a tab 
var showHideCreate = function(entity, show, disablePopulateList) {
	//checking if the block is show or not
	if (show) {
		//hiding the search container
		$('#' + entity + '-search-ctr').hide();
		//hiding the list container
		$('#' + entity + '-list-ctr').hide();
		//showing the create container
		$('#' + entity + '-create-ctr').show();
	} else {
		//showing the search container
		$('#' + entity + '-search-ctr').show();
		//showing the list container
		$('#' + entity + '-list-ctr').show();
		//hiding the create container
		$('#' + entity + '-create-ctr').hide();
		if (!disablePopulateList) {
			populateList(entity,null,null);
					
		}
	}
}

//parameter object definition
var param=function(name,value){
	this.name=name;
	this.value=value;
}

//function to add an entity when user clicks on the add button in UI
var add = function(entity) {
	$('.message').hide();
	$('#'+entity+'-reset').click();
	//display the create container
	showHideCreate(entity, true,false);
	$("span.readonly input").attr('readonly', false);
	$("select[id$=item-payee-list] > option").remove();
	//checking the entity to populate the select box
	if (entity == mycloudbalance.appspot.ENTITY_TRANSACTION) {
		//populating the payee and contact by making an ajax call
		populateSelectBox('item-payee-list', '/cb/payee');
		$("input[type=hidden], textarea").val("");
		var date = new Date();
		var currentDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
		$('#datepicker').val(currentDate);
	}
}

//function to search an entity when user inputs the value in the search box
var search = function(entity) {
	$('.message').hide();
	// collecting the field values from the form
	 var formEleList = $('form#'+entity+'-search-form').serializeArray();
	 //assigning the filter criteria
	 var filterParam=new Array();
	 for(var i=0;i<formEleList.length;i++){
		 filterParam[filterParam.length]=new param(formEleList[i].name,formEleList[i].value); 
	 }
	 //calling population of the list through ajax
	 populateList(entity,filterParam,null);
}

var hideMessage = function(entity) {
	$('#'+entity+'-show-message').hide();
}

var showMessage = function(message, entity){
	$('#'+entity+'-show-message').show().html('<p class="note"><i class="fa fa-info-circle"></i>&nbsp<b>'+message+'</b>&nbsp;<a href="#" onclick=\'hideMessage("'+entity+'")\'>Ok</a></p>');
}

var formValidate = function(entity){
	var key;
	var formEleList = $('form#'+entity+'-create-form').serializeArray();
	key=formEleList[0].value;
	switch(entity){
		case mycloudbalance.appspot.ENTITY_TRANSACTION:
			var valuePayee = $('#item-payee-list').val();
			var memo =$('#memo').val();
			if(valuePayee == "" || key == ""){
				showMessage('Payee is required.', entity);
				return;
			}
			
			var valueDate = $('#datepicker').val();
			if(valueDate == ""){
				showMessage('Date is required.', entity);
				return;
			}
			
			var valueAmount = $('#amount').val();
			if(valueAmount == ""){
				showMessage('Amount is required.', entity);
				return;
			}
			if(/^[a-zA-Z0-9-() ]*$/.test(memo) == false) {
				showMessage('Memo contains illegal characters.', entity);
				return;
			}
			
			break;
			
		case mycloudbalance.appspot.ENTITY_PAYEE:
			var valuePayeeName = $('#name').val();
			var valuePayeeDescription = $('#description').val();

			if(valuePayeeName == ""){
				showMessage('Payee name is required.', entity);
				return;
			}
			if(/^[a-zA-Z0-9-() ]*$/.test(valuePayeeName) == false) {
				showMessage('Your payee name contains illegal characters.', entity);
				return;
			}
			if(/^[a-zA-Z0-9-() ]*$/.test(valuePayeeDescription) == false) {
				showMessage('Your payee description name contains illegal characters.', entity);
				return;
			}
			break;
			
		case mycloudbalance.appspot.ADMINISTER:
			var valueAccountName = $('#accountName').val();
			if (valueAccountName=="") {
				showMessage('Account name is required.', entity);
			}
			break;
	
		default :
			if(key==""){
				showMessage('Please check the values in the form.', entity);
				return;
			}
			break;
	}
	save(entity);
	$('#'+entity+'-show-message').hide();
}

//function to save an entity
var save = function(entity) {

	
	switch(entity){
		case mycloudbalance.appspot.ENTITY_TRANSACTION:
			var v =$('#amount').asNumber();
			$('#amount').val(v);
		break;
	default :
		break;
   }		
	
	// Yuck this is messy.  This method should not know about specific elements.
	var accountName =$('#accountName').val();

	$('#'+entity+'-show-message').hide();
	// creating the data object to be sent to backend
	 var data=new Array();
	// collecting the field values from the form
	 var formEleList = $('form#'+entity+'-create-form').serializeArray();
	 for(var i=0;i<formEleList.length;i++){
		data[data.length]=new param(formEleList[i].name,formEleList[i].value);
	 }
	 //setting action as PUT
	 data[data.length]=new param('action','PUT');
	 //making the ajax call
	 $.ajax({
			url : "/cb/"+entity,
			type : "POST",
			data:data,
			success : function(data) {
				 switch(entity){
	 				case mycloudbalance.appspot.ADMINISTER:
						$('#gc-accountName').html(accountName);
						$('#accountName').val(accountName);
						break;
					default :
						
						break;
				  }		
				showHideCreate(entity,false,false);
				
			},
			error : function(resp){
				showMessage(resp, entity);
			}
			
		});
	 $('#'+entity+'-reset').click();
	 $('#item-payee-list').reset();
	 
	
	 
}

//function to edit entity
var editEntity = function(entity, id, parent,copy){
	var parameters=new Array();
	parameters[parameters.length]=new param('q',id);
	parameters[parameters.length]=new param('p',parent);
    parameters[parameters.length]=new param('dayOfYear',moment().format("DDD"));
	parameters[parameters.length]=new param("year",moment().format("YYYY"));
	$.ajax({
		url : "/cb/"+entity,
		type : "GET",
		data:parameters,
		success : function(resp) {
			var data=resp.data[0];
			var formElements = $('form#'+entity+'-create-form :input');
			for(var i=0;i<formElements.length;i++){
				if(formElements[i].type !="button"){
					var ele=$(formElements[i]);
					
					if(formElements[i].type =="radio"){
						continue;
					}
					
					if(ele.attr('name')=="payee"){						
						$("select[id$=item-payee-list] > option").remove();
						ele.append('<option value="'+eval('data.'+ele.attr('name'))+'">'+eval('data.'+ele.attr('name'))+'</option>');	
					}
					else {
						ele.val(eval('data.'+ele.attr('name')));
					}
					if (copy) {
						if(ele.attr('type')=="hidden"){	
							$(ele).val("");
						}
					}
				}
			}
			
			if (entity == mycloudbalance.appspot.ENTITY_PAYEE) {
				if (data.type) {
					var $radios = $('input:radio[name=type]');
	   		        $radios.filter('[value='+data.type+']').prop('checked', true);	
				}
				
			}
			
			
			if (entity == mycloudbalance.appspot.ENTITY_TRANSACTION) {
				var transactionAmount = parseFloat(data.amount);
				var $radios = $('input:radio[name=transaction-type]');
				if (transactionAmount>=0) {
			      $radios.filter('[value=d]').prop('checked', true);
				} else {
	   			  $radios.filter('[value=w]').prop('checked', true);
	   			  
	   			  $('#amount').val(transactionAmount * -1);
	   			  
				}
			}
			
			showHideCreate(entity, true,false);
			$("span.readonly input").attr('readonly', true);
			$('.formatedNumber').formatCurrency({ colorize:false });
			$('.formatedNumber').removeClass("tableNumber");
			
		}
	});
	

}

var edit = function(entity, id, parent){
	
	editEntity(entity,id,parent,false);
	
}

var copy = function(entity, id, parent){
	
	editEntity(entity,id,parent,true);
	
}

//function called when user clicks on the cancel button
var cancel = function(entity) {
	$('.message').hide();
	//hiding the create container in the tab
	showHideCreate(entity, false,true);
}

//function to delete an entity
var deleteEntity = function(entity,id,parentid) {
	
	 $( "#dialog-confirm" ).dialog({
		 position:  { my: "top", at: "top", of: tabs },
	      resizable: false,
	      height:200,
	      modal: true,
	      buttons: {
	        "Delete": function() {
	        	var parameter=new Array();
	        	parameter[parameter.length]=new param('id',id);
	        	parameter[parameter.length]=new param('parentid', parentid);
	        	parameter[parameter.length]=new param('action','DELETE');
	        	//making the ajax call
	        	$.ajax({
	        		url : "/cb/"+entity,
	        		type : "POST",
	        		data:parameter,
	        		dataType:"html",
	        		success : function(resp) {
	        			showHideCreate(entity,false,false);
	        			if (resp!=''){
	        				showMessage(resp, entity);
	        			}
	        		},
	        		error : function(resp){
	        			showMessage(resp, entity);
	        		}
	        	});
	        	
	        	
	        	
	          $( this ).dialog( "close" );
	        },
	        Cancel: function() {
	          $( this ).dialog( "close" );
	        }
	      }
	    });
	
	
	
}

var starEntity = function(entity,id,parentid) {
	var parameter=new Array();
	parameter[parameter.length]=new param('id',id);
	parameter[parameter.length]=new param('parentid', parentid);
	parameter[parameter.length]=new param('action','STAR');
	$.ajax({
		url : "/cb/"+entity,
		type : "POST",
		data:parameter,
		dataType:"html",
		success : function(resp) {
			var p = parentid.replace(/\s/g, '');
			var s = $('#'+id+'_'+p);
			if (s.hasClass('fa-star')) {
				s.removeClass();
				s.addClass("fa fa-star-o");
			} else {
				s.removeClass();
				s.addClass("fa fa-star");
			}
		},
		error : function(resp){
			showMessage(resp, entity);
		}
	});
}


// function to get the data by setting url, filter, success function and error function
var getData=function(url,moreParameters,successFn,errorFn,offset){
    
	var parameters=new Array();
     if (moreParameters!==null) {
	      for(var i=0;i<moreParameters.length;i++){
	    	  parameters[parameters.length]=moreParameters[i]; 
		  }
     }
    parameters[parameters.length]=new param('dayOfYear',moment().format("DDD"));
    parameters[parameters.length]=new param("year",moment().format("YYYY"));
   	parameters[parameters.length]=new param("offset",offset);
	
	// making the ajax call
	$.ajax({
		url : url,
		type : "GET",
		data:parameters,
		success : function(resp) {
			//calling the user defined success function
			if(successFn)
			successFn(resp);	
		}
	});
}

//function to populate the select box which takes input as id of the selectbox element and url to get the data
var populateSelectBox = function(id, url) {
	//specifying the success function. When the ajax response is successful then the following function will be called
	var successFn=function(resp){
		//getting the select box element
		var selectBox=$('#'+id);
		//setting the content inside as empty
		selectBox.innerHTML = '';
		//getting the data from the response object
		var data=resp.data; 
		//appending the first option as select to the select box
		selectBox.append('<option value="">Select</option>');
		//adding all other values
		for (var i=0;i<data.length;i++) {
			selectBox.append('<option value="'+data[i].name+'">'+data[i].name+'</option>');
		}
	}
	//calling the getData function with the success function
	getData(url,null,successFn,null,-1);
}



var populateList=function(entity, parameters,offset){

    if (offset ==null) {
     	offset = 0;
    }
	$('#accountName').val(mycloudbalance.appspot.config.defaultAccountName);
	$('#currentBalance').fadeOut();
	$('#currentBalanceLabel').fadeOut();
	$('#currentBalance').html(0);

	if (entity == mycloudbalance.appspot.CHARTS ) {
		updateAreaChart();
		return;
	}
	if (entity == mycloudbalance.appspot.MAPS ) {
		updateMoneyMap();
		return;
	}
	
	var successFn=function(resp){
		var data='';
		if(resp){
			data=resp.data;
		}
		var htm='';
		if(data.length > 0){
			switch(entity) {
				case mycloudbalance.appspot.ENTITY_TRANSACTION:
					var balance =0;
					var m;
					var monthlyCashFlow =0;
					var monthlyIncome = 0;
					var monthlyStatic = 0;
					var monthlyDiscretionary=0;
					var monthlyFuture = 0;
					var monthlyOther = 0;
					var amount;
					console.log('Computing monthly totals');
					for (var i=0;i<data.length;i++){
						if (moment(data[i].date).format("MMM")!=m) {
							monthlyCashFlow = 0;
							monthlyIncome =0;
							monthlyDiscretionary =0;
							monthlyStatic = 0;
							monthlyOther = 0;
							monthlyFuture =0;
							m = moment(data[i].date).format("MMM");
						}
						
						amount = Number(data[i].amount);
						balance = balance + amount;

						switch (data[i].type) {
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
						
						// Cash flow
						monthlyCashFlow = monthlyCashFlow +  amount;
						data[i].balance = balance;
						data[i].monthlyCashFlow= monthlyCashFlow;
						data[i].monthlyIncome= monthlyIncome;
						data[i].monthlyStatic= monthlyStatic;
						data[i].monthlyDiscretionary= monthlyDiscretionary;
						data[i].monthlyFuture= monthlyFuture;
						data[i].monthlyOther= monthlyOther;
						
						
					}
					console.log('Done..Computing monthly totals');
					
					
					// Print the records in reverse order (descending date)
					var i = data.length;
					var month;
					var rowMonth;
					var starClass;
					var today = new Date(Date.now());
					var transaactionDate;
					var currentBalance;
					var transactionDate;
					
					console.log('Computing running balance and building html');
					
					while (i--) {
						transactionDate = new Date(data[i].date);
						if (transactionDate.getFullYear()  == today.getFullYear()) {
							if (transactionDate.getMonth()  == today.getMonth()) {
								if (transactionDate.getDate()  == today.getDate()) {
									if (!currentBalance) {
										currentBalance =data[i].balance 
										
									}
								}
							}
						}
						if (!currentBalance) {
							if (transactionDate.getTime()< today.getTime()) {
								currentBalance =data[i].balance 
							}
						}
						$('#currentBalance').html(currentBalance);
						$('#currentBalance').fadeIn();
						$('#currentBalanceLabel').fadeIn();
						

						rowMonth =moment(data[i].date).format("MMM");
						var monthYear = moment(data[i].date).format("MMMYYYY");
						
						if (rowMonth!=month) {
							var thElesLength=$('#'+entity+'-list-ctr table thead th').length;
					     	htm+='<tr>';
					     	var archiveHtml = '';
					     	if (monthYear in mycloudbalance.appspot.transactionArchive) {
					     		archiveHtml = '<div style="float:left;"><a href="#" title="Un-hide" class="archive-entity" onclick=\'unArchiveMonth("'+entity+'","'+data[i].date+'")\'><i class="fa fa-plus"></i></a></div>';
					     	} else {
					     		archiveHtml = '<div style="float:left;"><a href="#" title="Hide" class="archive-entity" onclick=\'archiveMonth("'+entity+'","'+data[i].date+'")\'><i class="fa fa-minus"></i></a></div>';
					     	}
					     	htm+='<td style="background-color:#F5F5F5;padding-top:6px; padding-bottom:0px;" colspan="'+thElesLength+'">'+archiveHtml+'<div style="float:left">&nbsp&nbsp'+moment(data[i].date).format("MMMM YYYY")+'</div>';
					
					 
					     	htm+='<div class="legendRowBox" style="border: none;">';
					     		//htm+='<span style="float:left;">CF</span>';
					     		htm+='<div class="formatedNumber" style="float: right;">'+data[i].monthlyCashFlow.formatMoney()+'</div>';
				     		htm+='</div>';


				     		
					     	
				     		htm+='<div class="legendRowBox">';
			     			htm+='<div class="formatedNumber" style="float:right">'+data[i].monthlyFuture.formatMoney()+'</div>';
			     			htm+='<span class="legend payee-type-f" style="float:left">F</span>';
			     		htm+='</div>';

					    	htm+='<div class="legendRowBox">';
					    		htm+='<div class="formatedNumber" style="float: right;">'+data[i].monthlyDiscretionary.formatMoney()+'</div>';
					    		htm+='<span class="legend payee-type-d" style="float:left">D</span>';
					    	htm+='</div>';

					     	
					    	htm+='<div class="legendRowBox" >';
				    		htm+='<div class="formatedNumber" style="float:right">'+data[i].monthlyStatic.formatMoney()+'</div>';
				    		htm+='<span class="legend payee-type-s" style="float:left">S</span>';
				    		htm+='</div>';

					     	htm+='<div class="legendRowBox">';
				     		htm+='<div class="formatedNumber" style="float:right;">'+data[i].monthlyIncome.formatMoney()+'</div>';
				     		htm+='<span class="legend payee-type-i" style="float:left">I</span>';
				    	htm+='</div>';

				    

			     	   	
			     		
				     		htm+='</td>';

				     		htm+='</tr>';
							month = rowMonth;
							
				     		htm+='<tr>';
				     //		htm+='<td colspan="'+thElesLength+'" style="background-color: #fffbe8;>';
				     //		htm+='</td>';
				     		htm+='</tr>';

						}
						// Skip archived transactions
						if (monthYear in mycloudbalance.appspot.transactionArchive) {
							continue;
						}
						htm+='<tr>';
						starClass = data[i].marked == "y" ? "fa fa-star" : "fa fa-star-o"
						htm+='<td ><i id="'+data[i].name+'_'+data[i].payee.replace(/\s/g, '')+'" class="'+starClass+'" style="cursor:pointer;" title="Star me" onclick=\'starEntity("'+entity+'","'+data[i].name+'","'+data[i].payee+'")\'"></i></td>';
						htm+='<td>'+moment(data[i].date).format("MMM Do")+'</td>';
						
						htm+='<td>';
						htm+='<span class="legend payee-type-'+data[i].type+'" style="float:left; margin-right:.5em">'+data[i].type+'</span>'+data[i].payee;
						htm+='</td>';
						htm+='<td>';
						
						htm+='<span class="formatedNumber"	 style="float:right">'+data[i].amount+'</span>';
						htm+='</td>';
						
						htm+='<td class="formatedNumber">'+data[i].balance+'</td>';
						htm+='<td><a href="#" title="Delete" class="delete-entity" onclick=\'deleteEntity("'+entity+'","'+data[i].name+'","'+data[i].payee+'")\'><i class="fa fa-trash-o fa-fw"></i></a> | <a href="#" title="Edit" class="edit-entity" onclick=\'edit("'+entity+'","'+data[i].name+'","'+data[i].payee+'")\'><i class="fa fa-pencil fa-fw"></i> </a> | <a href="#" title="Copy" class="edit-entity" onclick=\'copy("'+entity+'","'+data[i].name+'","'+data[i].payee+'")\'><i class="fa fa-files-o"></i></a></td>';
						htm+='</tr>';
					}
					console.log('Done..Computing running balance and building html');
					
			}
			
			
			
			var total =0;
				
			for (var i=0;i<data.length;i++){
				
				switch(entity)
				{
					case mycloudbalance.appspot.ENTITY_PAYEE:
						htm+='<tr>';
						//htm+='<td><span class="legend" style="margin-right:.5em; background: '+stringToColour(data[i].name)+' ; color:#F8F8FF">'+data[i].name.toUpperCase().charAt(0)+'</span>';
						
						htm+='<td>';
						htm+=data[i].name+'</td>';
						
						htm+='<td><span class="legend payee-type-'+data[i].type+'" style="margin-right:.5em; float:left; ">'+data[i].type+'</span>';
						
						htm+=mycloudbalance.appspot.payeeType(data[i].type)+'</td><td class="formatedNumber">'+data[i].lastAmount+'</td><td class="formatedNumber">'+data[i].thisMonth+'</td><td class="formatedNumber">'+data[i].lastMonth+'</td><td class="formatedNumber">'+data[i].total+'</td>';
						htm+='<td><a href="#" class="delete-entity" title="Delete" onclick=\'deleteEntity("'+entity+'","'+data[i].name+'")\'><i class="fa fa-trash-o fa-fw"></i></a> | <a href="#" class="edit-entity" title="Edit" onclick=\'edit("'+entity+'","'+data[i].name+'")\'><i class="fa fa-pencil fa-fw"></i></a></td>';
						htm+='</tr>';
						break;
					case mycloudbalance.appspot.ADMINISTER:
							$('#accountName').val(data[i].accountName);
						break;
					default:
					}
			}
			// Building out the footer..total records and pagination (if supported)
			switch(entity) 
			{
				case mycloudbalance.appspot.ENTITY_PAYEE:
					var entityCount = parseInt(resp.meta[0].entityCount);
					$('#'+entity+'-list-number-of-records').html(mycloudbalance.appspot.TOTAL_RECORDS+entityCount);
					var pageCount = entityCount / mycloudbalance.appspot.config.pageSize;
					if (pageCount > parseInt(entityCount /  mycloudbalance.appspot.config.pageSize))
        				pageCount = parseInt(pageCount + 1);
					else
        				pageCount = parseInt(pageCount);
					var footer ="";
					for (var x = 0; x < pageCount; x++) {
		       		    footer += '<a href="#" onclick=\'populateList("'+ entity+'","'+null+'","'+ (x *  mycloudbalance.appspot.config.pageSize) + '")\'>' + ( x + 1 ) + '</a> ';
		 			}
					
					if (entityCount >  mycloudbalance.appspot.config.pageSize) {
						if (( offset /  mycloudbalance.appspot.config.pageSize ) != ( pageCount - 1 ))  {
							footer += '<a href="#" onclick=\'populateList("'+ entity +'","'+null+'","'+ ( parseInt(offset) +  mycloudbalance.appspot.config.pageSize ) + '")\'>Next</a>' ;
						}
						 else  {
							 footer += '<a href="#" onclick=\'populateList("'+ entity +'","'+null+'","'+ ( pageCount - 1 ) *  mycloudbalance.appspot.config.pageSize + '")\'>Next</a>' ;
						 }
					}
					$('#'+entity+'-list-pagination').html("");
					if (pageCount > 1) {
						$('#'+entity+'-list-pagination').html(footer);						
					}
					break;
				default:
				
				}

		}
		else {
			//condition to show message when data is not available
			var thElesLength=$('#'+entity+'-list-ctr table thead th').length;
			htm+='<tr><td colspan="'+thElesLength+'">You have not entered any '+entity+'s yet.</td></tr>';
			$('#'+entity+'-list-number-of-records').html(mycloudbalance.appspot.TOTAL_RECORDS+data.length);

		}
		$('#'+entity+'-list-tbody').html(htm);
		$('.formatedNumber').formatCurrency({ colorize:true });
		$('.formatedNumber').addClass("tableNumber");
	}
	getData("/cb/"+entity,parameters,successFn,null,offset);
}

// source: http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

// source: http://jsfiddle.net/sUK45/
// http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
var stringToColour = function(str) {

    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

    return colour;
}

var archiveMonth = function(entity,date) {
	var monthYear = moment(date).format("MMMYYYY");
	mycloudbalance.appspot.transactionArchive[monthYear] = monthYear;
	showHideCreate(entity,false,false);
}

var unArchiveMonth = function(entity,date) {
	var monthYear = moment(date).format("MMMYYYY");
	delete mycloudbalance.appspot.transactionArchive[monthYear];
	showHideCreate(entity,false,false);
}




