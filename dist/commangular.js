/**
 * Command pattern implementation for AngularJS
 * @version v0.9.0 - 2015-03-15
 * @link https://github.com/yukatan/commangular
 * @author Jesús Barquín Cheda <yukatan@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

(function(window, angular, undefined) {

	var commangular = window.commangular || (window.commangular = {});
	var commands = {};
	var commandNameString = "";
	var eventNameString = "";
	var aspects = [];
	var eventAspects = [];
	var descriptors = {};
	var eventInterceptors= {};
	var interceptorExtractor = /\/(.*)\//;
	var aspectExtractor = /@([^(]*)\((.*)\)/;
	var debugEnabled = false;	

	function escapeRegExp(str) {
  		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	commangular.create = function(commandName, commandFunction, commandConfig) {
				
		commands[commandName] = {
			commandFunction: commandFunction,
			config: commandConfig,
			interceptors:{},
			commandName:commandName
		};
		commandNameString = commandNameString.concat("%" + commandName + "%{" + commandName + "}\n");
	}
	commangular.command = commangular.create;

	commangular.aspect = function(aspectDescriptor,aspectFunction,order) {
		
		var result = aspectExtractor.exec(aspectDescriptor);
		var poincut = result[1];
		var matcherString = interceptorExtractor.exec(result[2])[1];
		var matcher = new RegExp("^%" + matcherString + "%\{(.*)\}$","mg");
		var aspectOrder = order || (order = 0);
		if(!/(\bBefore\b|\bAfterExecution\b|\bAfter\b|\bAfterThrowing\b|\bAround\b)/.test(poincut))
			throw new Error('aspect descriptor ' + aspectDescriptor + ' contains errors');
		aspects.push({poincut:poincut,
			matcher:matcher,
			aspectFunction:aspectFunction,
			order:aspectOrder,
			descriptor:aspectDescriptor});
	}

	commangular.eventAspect = function(aspectDescriptor,aspectFunction,order) {
		
		var result = aspectExtractor.exec(aspectDescriptor);
		var poincut = result[1];
		var matcherString = interceptorExtractor.exec(result[2])[1];
		var matcher = new RegExp("^%" + matcherString + "%\{(.*)\}$","mg");
		var aspectOrder = order || (order = 0);
		if(!/(\bBefore\b|\bAfter\b|\bAfterThrowing\b)/.test(poincut))
			throw new Error('aspect descriptor ' + aspectDescriptor + ' contains errors');
		eventAspects.push({poincut:poincut,
			matcher:matcher,
			aspectFunction:aspectFunction,
			order:aspectOrder,
			descriptor:aspectDescriptor});
	}

	commangular.resolver = function (commandName,resolverFunction) {

		var aspectResolverFunction = ['lastResult','processor','$injector',function(lastResult,processor,$injector) {
			return {
				execute : function() {
					var result = $injector.invoke(resolverFunction,this,{result:lastResult});
					processor.setData('lastResult',result);
					if(commands[commandName] && 
						commands[commandName].config &&
						commands[commandName].config.resultKey)
							processor.setData(commands[commandName].config.resultKey,result);
					return result;	
				}
			}
		}];	
		var aspectDescriptor = "@AfterExecution(/" + escapeRegExp(commandName) + "/)";
		commangular.aspect(aspectDescriptor,aspectResolverFunction,-100);
	}

	commangular.reset = function() {
		
		aspects = eventAspects = [];
		commands = eventInterceptors = {};
		commandNameString = eventNameString = "";
	}

	commangular.debug = function(enableDebug){

		debugEnabled = enableDebug;
	}


	commangular.build = function(){

		(function processInterceptors(collection,stringList,targets) {

				angular.forEach(collection,function(aspect){
					var result;		
					while((result = aspect.matcher.exec(stringList)) != null) {
						
						if(!targets[result[1]].interceptors[aspect.poincut])
							targets[result[1]].interceptors[aspect.poincut] = [];
						targets[result[1]].interceptors[aspect.poincut]
								.push({func:aspect.aspectFunction,order:aspect.order});
					}
				});
				return processInterceptors;
			}(aspects,commandNameString,commands)(eventAspects,eventNameString,eventInterceptors));
			
	}

	//----------------------------------------------------------------------------------------------------------------------

	function CommandDescriptor(ctype,command) {

		this.ctype = ctype;
		this.command = command;
		this.descriptors = [];
	}

	CommandDescriptor.prototype.asSequence = function() {

		this.ctype = 'S';
		return this;
	};

	CommandDescriptor.prototype.asParallel = function() {

		this.ctype = 'P';
		return this;			
	};

	CommandDescriptor.prototype.asFlow = function() {

		this.ctype = 'F';
		return this;			
	};

	CommandDescriptor.prototype.add =  function(command) {

		this.descriptors.push((angular.isString(command)) ? new CommandDescriptor('E',commands[command]):command);
		return this;
	};
	CommandDescriptor.prototype.link = function(expresion, services) {

		this.descriptors.push({expresion:expresion,services:services}); 
		return this;
	};
	CommandDescriptor.prototype.to = function(command) {

		this.descriptors[this.descriptors.length -1].commandDescriptor = (angular.isString(command) ? 
			new CommandDescriptor('E',commands[command]):command);
		return this;
	};
	
	//----------------------------------------------------------------------------------------------------------------------
	function CommandContext(data,$q,$injector,$parse) {

		this.contextData = data || {};
		this.contextData.commandModel = {};
		this.currentDeferred;
		this.currentCommandInstance;
		this.canceled = false;

		this.processDescriptor = function(descriptor) {

			switch (descriptor.ctype) {
				case 'S':
					return this.processSequence(descriptor);
				case 'P':
					return this.processParallel(descriptor);
				case 'E':
					return this.processCommand(descriptor);
				case 'F':
					return this.processFlow(descriptor);
			}
		}

		this.processSequence = function(descriptor) {

			var defer = $q.defer();
			var index = 0;
			var self = this;
			(function sequenceChain(){
				self.processDescriptor(descriptor.descriptors[index]).then(function(){
					if(++index === descriptor.descriptors.length){
						defer.resolve();
						return;
					}
					sequenceChain();
				},function(error){defer.reject(error)});
			}());
			return defer.promise;
		}

		this.processParallel = function(descriptor) {

			var self = this;
			var defer = $q.defer();
			var index = 0;
			angular.forEach(descriptor.descriptors,function(desc){
				self.processDescriptor(desc).then(function(){
					if(++index === descriptor.descriptors.length){
						defer.resolve();
						return;
					}
				},function(error){defer.reject(error)});
			});
			return defer.promise;

		}

		this.processFlow = function(descriptor) {

			var self = this;
			var defer = $q.defer();
			var index = 0;
			(function flowChain() {
				var locals = {};
				var desc = descriptor.descriptors[index];
				if(desc.services) {
				
					angular.forEach(desc.services.split(','), function(service, key){
						locals[service] = $injector.get(service);
					});
				}
				var result = $parse(desc.expresion)(self.contextData,locals);
				if(typeof result !== 'boolean')
					throw new Error('Result from expresion :' + descriptor.expresion + ' is not boolean');
				if(result){
					self.processDescriptor(desc.commandDescriptor).then(function(){
						if(++index === descriptor.descriptors.length){
							defer.resolve();
							return;
						}
						flowChain();
					},function(error){defer.reject(error)});
				}
				else{
					if(++index === descriptor.descriptors.length){
							defer.resolve();
							return;
					}
					flowChain();
				}
			}());
			return defer.promise;
		}

		this.processCommand = function(descriptor) {

			var self = this;
			var result;
			var deferExecution = $q.defer();
			deferExecution.resolve();
			return deferExecution.promise
				.then(function () {
					return self.intercept('Before',descriptor.command.interceptors);
				})
				.then(function() {
					var deferred = $q.defer();
					try{
						if(descriptor.command.interceptors['Around']) 
							result = self.intercept('Around',descriptor.command.interceptors,descriptor.command.commandFunction);
						else {
							var command = self.instantiate(descriptor.command.commandFunction,true);
							result = self.invoke(command.execute, command);
						}
						self.processResults(result,descriptor.command.config).then(function(){
							deferred.resolve();
						},function(error){
							deferred.reject(error);
						});	
					}catch(error){
						deferred.reject(error);
					}
					return deferred.promise;
				})
				.then(function(){
					return self.intercept('AfterExecution',descriptor.command.interceptors);
				})
				.then(function(){
					result = self.exeOnResult(self.contextData.lastResult);
					return self.processResults(result,descriptor.command.config);
				})
				.then(function(){
					return self.intercept('After',descriptor.command.interceptors);
				},function(error) {
					var deferred = $q.defer();
					if(self.canceled){
						deferred.reject(error);
						return deferred.promise;
					}
					self.exeOnError(error);
					self.getContextData().lastError = error;
					self.intercept('AfterThrowing',descriptor.command.interceptors).then(function(){
						deferred.reject(error)
					},function(){deferred.reject(error)});
					return deferred.promise;
				});
		}

		this.intercept = function(poincut,interceptors,command) {

			var self = this;
			var deferred = $q.defer();
			if(!interceptors[poincut]){
				deferred.resolve();
				return deferred.promise;
			}
			interceptors[poincut].sort(function(a,b){
				return b.order - a.order;
			})
			switch(poincut) {
				case 'Around' : {
					var processor = new AroundProcessor(command,null,self,deferred,$q);
					angular.forEach(interceptors[poincut],function(value){
						processor = new AroundProcessor(value.func,processor,self,deferred,$q);
					});
					$q.when(processor.invoke()).then(function(result){
						deferred.resolve(result);
					},function(error){
						deferred.reject(error);});
					break;
				}
				default : {
					var processor = this.contextData.processor = new InterceptorProcessor(self,deferred);
					interceptors[poincut].reverse();
					var x = 0;
					(function invocationChain(){
						try{
							if(x === interceptors[poincut].length || self.canceled){
								deferred.resolve();
								return;
							}
							var interceptor = self.instantiate(interceptors[poincut][x++].func,false);
							$q.when(self.invoke(interceptor.execute,interceptor)).then(function(){
								invocationChain();
							},function(error){});
						}catch(error){deferred.reject(error)};
					}());
					break;
				}
			}
			return deferred.promise;
		}
	
	
		this.instantiate = function(funct,isCommand) {

			var instance = $injector.instantiate(funct,this.contextData);
			if(isCommand) this.currentCommandInstance = instance;
			return instance;
		}
		
		this.exeOnResult = function(result) {

			if(this.currentCommandInstance && this.currentCommandInstance.hasOwnProperty('onResult'))
				return this.currentCommandInstance.onResult(result);
		}

		this.exeOnError = function(error) {

			if(this.currentCommandInstance && this.currentCommandInstance.hasOwnProperty('onError'))
				this.currentCommandInstance.onError(error);
		}

		this.processResults = function(result,config) {

			var self = this;
			var defer = $q.defer();
			if (!result) {
				defer.resolve();
				return defer.promise;
			}
			var promise = $q.when(result).then(function(data) {
			
				self.contextData.lastResult = data;
				if (config && config.resultKey) {
					self.contextData[config.resultKey] = data;
				}
				defer.resolve();
			},function(error){defer.reject(error)});
			return defer.promise;
		}

		this.invoke = function(func, self) {
				
			return $injector.invoke(func,self,this.contextData);
		}
		
		this.getContextData = function(resultKey) {

			return this.contextData;
		}
	}
	
	//----------------------------------------------------------------------------------------------------------------------
	function InterceptorProcessor(context,deferred) {

		this.deferred = deferred;
		this.context = context;
		
	}
	InterceptorProcessor.prototype.cancel = function(reason) {
		
		this.context.canceled = true;		
		this.deferred.reject(reason);
	}
	InterceptorProcessor.prototype.setData = function(key,value) {
		
		this.context.contextData[key] = value;		
	}
	InterceptorProcessor.prototype.getData = function(key) {
		
		return this.context.contextData[key];		
	}
	//----------------------------------------------------------------------------------------------------------------------
	function AroundProcessor(executed,next,context,deferred,$q) {
		
		InterceptorProcessor.apply(this,[context,deferred]);
		this.executed = executed;
		this.next = next;
		this.$q = $q;
	}
	AroundProcessor.prototype = new InterceptorProcessor();
	AroundProcessor.prototype.constructor = AroundProcessor;

	AroundProcessor.prototype.invoke = function() {
			
		this.context.contextData.processor = this.next;
		var instance = this.context.instantiate(this.executed,this.next == null);
		return this.$q.when(this.context.invoke(instance.execute,instance))
	}
		
	//----------------------------------------------------------------------------------------------------------------------
	angular.module('commangular', [])
		.provider('$commangular', function() {
						
			return {
				$get: ['commandExecutor',function(commandExecutor) {
						
					return {
						dispatch: function(eventName, data) {

							return commandExecutor.execute(eventName, data);
						}
					}
				}],
		
				mapTo: function(eventName) {

					var interceptorChain = eventInterceptors[eventName] || (eventInterceptors[eventName] = {});
					if(!interceptorChain.interceptors)
						interceptorChain.interceptors = {};
					eventNameString = eventNameString.concat("%" + eventName + "%{" + eventName + "}\n");
					descriptors[eventName] = new CommandDescriptor();
					return descriptors[eventName];
				},

				asSequence : function() {

					return new CommandDescriptor('S');
				},
				asParallel : function() {

					return new CommandDescriptor('P');
				},
				asFlow : function() {

					return new CommandDescriptor('F');
				},
				
				findCommand: function(eventName) {

					return descriptors[eventName];
				}
			};
		});
	//-----------------------------------------------------------------------------------------------------------------
	angular.module('commangular')
		.service('commandExecutor',['$q','$injector','$parse','$exceptionHandler',
			function($q,$injector,$parse,$exceptionHandler) {

				return {
					
					execute: function(eventName, data) {
						var self = this;
						var defer = $q.defer();
						var context = self.createContext(data);
						var descriptor = descriptors[eventName];
						var interceptors = eventInterceptors[eventName].interceptors;
						defer.resolve();
						return defer.promise.then(function() {
												
							return context.intercept('Before',interceptors);
						}).then(function() {
								
							return context.processDescriptor(descriptor);
						}).then(function(){
								
							return context.intercept('After',interceptors);	
						}).then(function() {
							
							return self.returnData(context);
						},function(error){
							if(debugEnabled) $exceptionHandler(error);
							var def = $q.defer();
							context.intercept('AfterThrowing',interceptors).then(function(){
								def.reject(error);
							},function(){defer.reject(error)});
							return def.promise;
						});
						
					},
					createContext: function(data) {
						
						return new CommandContext(data,$q,$injector,$parse);
					},
					returnData : function(context) {

						return context.contextData;
					}
				};
			}
		]);
	//------------------------------------------------------------------------------------------------------------------
	angular.module('commangular')
		.run(commangular.build); 
	//------------------------------------------------------------------------------------------------------------------ 
	angular.module('commangular')
		.config(['$provide',function($provide) {
					
			$provide.decorator('$rootScope',['$injector','$delegate',function($injector,$delegate){
				
				$delegate.dispatch = function(eventName,data) {
					return $injector.get('commandExecutor').execute(eventName,data);
				}
				return $delegate;
			}]);
		}]); 
})(window, window.angular);