
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
			if(context.currentCommandInstance && context.currentCommandInstance.execute === func){
				excInfo.exeChain = excInfo.exeChain || [];
				excInfo.exeChain.push({name:this.currentDescriptor.commandName});
			}
			return context.invoke(func,self);
		}

		this.instantiateDescriptor = function(descriptor) {

			this.currentDescriptor = descriptor;
			return context.instantiateDescriptor.call(this,descriptor);
		}

		this.instantiate = function(funct,isCommand) {

			return context.instantiate(funct,isCommand);
		}

		this.processResults = function(result,config) {

			return context.processResults(result,config);
		}
		
	
		this.intercept = function(poincut,interceptors,command) {
			
			return context.intercept(poincut,interceptors,command);
		}

		this.getContextData = function(resultKey) {

			return context.getContextData(resultKey);
		}

		this.exeOnResult = function(result) {

			context.exeOnResult(result);
		}

		this.exeOnError = function(error) {

			context.exeOnError(error);
		}

		this.setCurrentCommand = function(command) {

			context.currentCommand = command;
		}

	
	}

		
	angular.module('commangularMock',['commangular']).config(function($provide,$commangularProvider) {
		
		commangularProvider = $commangularProvider;
		$provide.decorator('commandExecutor',function($delegate){
						
			/*var createContext = $delegate.createContext;

			$delegate.createContext = function(data) {
								
				proxy = new ContextProxy(createContext(data),{initData:angular.copy(data),contextData:data});
				return proxy;
			}*/
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
			
			currentCommandInfo = null;
		});

		window.dispatch = commangular.mock.dispatch = function(ec,callback) {

			if(currentSpect && !currentSpect.$injector)
				throw new Error('Injector still not ready to execute ' + commandName);

			if(ec.command){
				ec.event = randomEventName();
				console.log(ec.event);
				commangularProvider.mapTo(ec.event).asSequence().add(ec.command);
			}
			scope = currentSpect.$injector.get('$rootScope');
			scope.$apply(execute(ec.event,ec.data,callback));
		};  
	}

})(window,angular);