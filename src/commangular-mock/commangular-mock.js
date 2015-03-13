"use strict";

(function(window, angular, undefined) {

	
	commangular.mock = {};

	var currentSpect = null;
	var proxy = null;
	var commangularProvider = null;
	var scope = null;


	function execute(event,data,callback) {
		
		return scope.dispatch(event,data || {}).then(
			
			function(){
				callback.call(currentSpect,createCommandInfo(proxy));		
			},
			function(error){
				callback.call(currentSpect,createCommandInfo(proxy));				
		});
	};

	function randomEventName() {

		return Math.floor((1 + Math.random()) * 0x10000).toString(16);
	}

	function createCommandInfo(proxy) {
		return {
			dataPassed: function(key) {
				try {return proxy.excInfo.initData[key];}
				catch(error){return undefined};
			},
			resultKey : function(key) {
				try {return proxy.excInfo.contextData[key];}
				catch(error){return undefined};					
			},
			canceled : function() {
				return proxy.context.canceled;
			},
			commandExecuted : function(commandName) {
				var found = false;
				angular.forEach(proxy.excInfo.exeChain,function(value){
					if(value.name == commandName) 
						found = true;
				});
				return found;
			}	
		}	
	}

	function ContextProxy(context,excInfo) {
		
		this.context = context;
		this.contextData = context.contextData;
		this.excInfo = excInfo;
		this.currentDescriptor;
		
		this.invoke = function(func,self) {
			
			return context.invoke(func,self);
		}

		this.processSequence = function(descriptor) {

			return context.processSequence.call(this,descriptor);
		}

		this.processParallel = function(descriptor) {

			return context.processParallel.call(this,descriptor);
		}

		this.processFlow = function(descriptor) {

			return context.processFlow.call(this,descriptor);
		}

		this.processCommand = function(descriptor) {

			this.excInfo.exeChain = this.excInfo.exeChain || (this.excInfo.exeChain = []);
			this.excInfo.exeChain.push({name:descriptor.command.commandName});
			return context.processCommand.call(this,descriptor);
		}

		this.processDescriptor = function(descriptor) {

			return context.processDescriptor.call(this,descriptor);
		}
		
		this.instantiate = function(funct,isCommand) {

			return context.instantiate.call(this,funct,isCommand);
		}

		this.processResults = function(result,config) {

			return context.processResults.call(this,result,config);
		}
		
	
		this.intercept = function(poincut,interceptors,command) {
			
			return context.intercept.call(this,poincut,interceptors,command);
		}

		this.getContextData = function(resultKey) {

			return context.getContextData.call(this,resultKey);
		}

		this.exeOnResult = function(result) {

			return context.exeOnResult.call(this,result);
		}

		this.exeOnError = function(error) {

			context.exeOnError.call(this,error);
		}
	}

		
	angular.module('commangularMock',['commangular']).config(function($provide,$commangularProvider) {
		
		commangularProvider = $commangularProvider;
		$provide.decorator('commandExecutor',function($delegate){
						
			var createContext = $delegate.createContext;

			$delegate.createContext = function(data) {
								
				proxy = new ContextProxy(createContext(data),{initData:angular.copy(data),contextData:data});
				return proxy;
			}
			return $delegate;
		});
	});
		

	if(window.jasmine || window.mocha) {
		
		beforeEach(function() {
			
			currentSpect = this;
			var modules = currentSpect.$modules || [];
      		modules.unshift('commangularMock');
      		currentSpect.$modules = modules;
      	});

		afterEach(function(){
						
		});

		window.dispatch = commangular.mock.dispatch = function(ec,callback) {

			if(currentSpect && !currentSpect.$injector)
				throw new Error('Injector still not ready to execute ' + commandName);

			if(ec.command){
				ec.event = randomEventName();
				commangularProvider.mapTo(ec.event).asSequence().add(ec.command);
			}
			scope = currentSpect.$injector.get('$rootScope');
			scope.$apply(execute(ec.event,ec.data,callback));
		};  
	}

})(window,window.angular);