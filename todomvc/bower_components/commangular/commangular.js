(function(window, angular, undefined) {

	var commangular = window.commangular || (window.commangular = {});
	var injector;
	var q;
	var parse;
	var commands;
	var commandNameString = "";
	var eventNameString = "";
	var aspects = [];
	var eventAspects = [];
	var descriptors = {};
	var eventInterceptors= {};
	var interceptorExtractor = /\/(.*)\//;
	var aspectExtractor = /@([^(]*)\((.*)\)/;

	function escapeRegExp(str) {
  		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	commangular.create = function(commandName, commandFunction, commandConfig) {
				
		commands = commangular.commands || (commangular.commands = {});
		commands[commandName] = {
			function: commandFunction,
			config: commandConfig,
			interceptors:{},
			commandName:commandName
		};
		commandNameString = commandNameString.concat("%" + commandName + "%{" + commandName + "}\n");
	}
	commangular.command = commangular.create;

	commangular.aspect = function(aspectDescriptor,aspectFunction,order) {
		
		aspects = commangular.aspects || (commangular.aspects = []);
		var result = aspectExtractor.exec(aspectDescriptor);
		var poincut = result[1];
		var matcherString = interceptorExtractor.exec(result[2])[1];
		var matcher = new RegExp("^%" + matcherString + "%\{(.*)\}$","mg");
		aspectOrder = order || (order = 0);
		if(!/(\bBefore\b|\bAfter\b|\bAfterThrowing\b|\bAround\b)/.test(poincut))
			throw new Error('aspect descriptor ' + aspectDescriptor + ' contains errors');
		aspects.push({poincut:poincut,
			matcher:matcher,
			aspectFunction:aspectFunction,
			order:aspectOrder,
			descriptor:aspectDescriptor});
	}

	commangular.eventAspect = function(aspectDescriptor,aspectFunction,order) {
		
		eventAspects = commangular.eventAspects || (commangular.eventAspects = []);
		var result = aspectExtractor.exec(aspectDescriptor);
		var poincut = result[1];
		var matcherString = interceptorExtractor.exec(result[2])[1];
		var matcher = new RegExp("^%" + matcherString + "%\{(.*)\}$","mg");
		aspectOrder = order || (order = 0);
		if(!/(\bBefore\b|\bAfter\b|\bAfterThrowing\b)/.test(poincut))
			throw new Error('aspect descriptor ' + aspectDescriptor + ' contains errors');
		eventAspects.push({poincut:poincut,
			matcher:matcher,
			aspectFunction:aspectFunction,
			order:aspectOrder,
			descriptor:aspectDescriptor});
	}

	commangular.resolver = function (commandName,resolverFunction) {

		var aspectResolverFunction = ['lastResult','processor',function(lastResult,processor) {
			return {
				execute : function() {
					var result = injector.invoke(resolverFunction,this,{result:lastResult});
					processor.setData('lastResult',result);
					if(commands[commandName] && 
						commands[commandName].config &&
						commands[commandName].config.resultKey)
							processor.setData(commands[commandName].config.resultKey,result);
					return result;	
				}
			}
		}];	
		var aspectDescriptor = "@After(/" + escapeRegExp(commandName) + "/)";
		commangular.aspect(aspectDescriptor,aspectResolverFunction,-100);
	}

	commangular.reset = function() {

		aspects = [];
		eventAspects = [];
		commands = {};
		commangular.aspects = [];
		commangular.eventAspects = [];
		commangular.commands = {};
		eventInterceptors = {};
		commandNameString = "";
		eventNameString = "";

	}

	//----------------------------------------------------------------------------------------------------------------------

	function CommandDescriptor(commandType) {

		this.commandType = commandType;
		this.descriptors = [];
		this.command = null;
		this.commandConfig;
		this.interceptors;
	}

	CommandDescriptor.prototype.asSequence = function() {

		this.commandType = 'S';
		return this;
	};

	CommandDescriptor.prototype.asParallel = function() {

		this.commandType = 'P';
		return this;			
	};

	CommandDescriptor.prototype.asFlow = function() {

		this.commandType = 'F';
		return this;			
	};

	CommandDescriptor.prototype.add =  function(command) {

		if (angular.isString(command)) {

			command = commangular.commands[command];
		}

		if (command instanceof CommandDescriptor) {

			this.descriptors.push(command);
			return this;
		}
		var commandDescriptor = new CommandDescriptor('E');
		commandDescriptor.command = command.function;
		commandDescriptor.commandConfig = command.config;
		commandDescriptor.interceptors = command.interceptors;
		this.descriptors.push(commandDescriptor);
		return this;
	};
	CommandDescriptor.prototype.link = function(expresion, services) {

		var descriptor = new LinkDescriptor(expresion,services,this);
		this.descriptors.push(descriptor); 
		return descriptor;
	};
	
	//----------------------------------------------------------------------------------------------------------------------
	function LinkDescriptor(expresion,services,parent) {

		this.commandDescriptor;
		this.expresion = expresion;
		this.services = services;
		this.parent = parent;
	}

	LinkDescriptor.prototype.to = function(command){

		if (angular.isString(command)) {

			command = commangular.commands[command];
		}

		if (command instanceof CommandDescriptor) {

			this.commandDescriptor = command;
			return this.parent;
		}
		var commandDescriptor = new CommandDescriptor('E');
		commandDescriptor.command = command.function;
		commandDescriptor.commandConfig = command.config;
		commandDescriptor.interceptors = command.interceptors;
		this.commandDescriptor = commandDescriptor;
		return this.parent;
	}; 
		
	//----------------------------------------------------------------------------------------------------------------------
	function CommandBase(context) {

		this.context = context;
		this.deferred = null;

	}
	//----------------------------------------------------------------------------------------------------------------------

	function Command(command, context, config,interceptors) {

		CommandBase.apply(this, [context]);
		this.command = command;
		this.commandConfig = config;
		this.interceptors = interceptors;
		
		this.execute = function() {

			var self = this;
			var context = this.context;
			var result;					
			var deferExecution = q.defer();
			deferExecution.resolve();
			return deferExecution.promise
				.then(function () {
					return context.intercept('Before',interceptors);
				})
				.then(function() {
					var deferred = q.defer();
					try{
						if(interceptors['Around']) 
							result = context.intercept('Around',interceptors,self.command);
						else {
							command = context.instantiate(self.command,true);
							result = context.invoke(command.execute, command);
						}
						context.processResults(result,config).then(function(){
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
					return context.intercept('After',interceptors);
				})
				.then(function(){
					if(context.currentCommand.hasOwnProperty('onResult'))
						context.currentCommand.onResult(result);
				},function(error) {
					var deferred = q.defer();
					if(context.canceled){
						deferred.reject(error);
						return deferred.promise;
					}
					if(context.currentCommand && context.currentCommand.hasOwnProperty('onError'))
						context.currentCommand.onError(error);
					context.getContextData().lastError = error;
					context.intercept('AfterThrowing',interceptors).then(function(){
						deferred.reject(error)
					},function(){deferred.reject(error)});
					return deferred.promise;
				});
			}
	}
	Command.prototype = new CommandBase();
	Command.prototype.constructor = Command;

	//----------------------------------------------------------------------------------------------------------------------
	function CommandGroup(context, descriptors) {

		CommandBase.apply(this, [context]);
		this.descriptors = descriptors;

		this.start = function() {

			this.deferred = q.defer();
			this.execute();
			return this.deferred.promise;
		}
	}
	CommandGroup.prototype = new CommandBase();
	CommandGroup.prototype.constructor = CommandGroup;
	//----------------------------------------------------------------------------------------------------------------------

	function CommandSequence(context, descriptors) {

		CommandGroup.apply(this, [context, descriptors]);
		var currentIndex = 0;

		this.execute = function() {
			var self = this;
			var commandDescriptor = this.descriptors[currentIndex];
			var command = this.context.instantiateDescriptor(commandDescriptor);

			if (command instanceof Command) {
				command.execute().then(
					function() {
						self.nextCommand();
					},
					function(error) {
						self.deferred.reject(error);
					});
		}
			else
				command.start().then(
					function() {
						self.nextCommand();
					},
					function(error) {
						self.deferred.reject(error);
					});
		};
		this.nextCommand = function() {

			if (++currentIndex == this.descriptors.length) {

				this.deferred.resolve();
				return;
			}
			this.execute();
		};
	}
	CommandSequence.prototype = new CommandGroup();
	CommandSequence.prototype.constructor = CommandSequence;
	//----------------------------------------------------------------------------------------------------------------------
	function CommandParallel(context, descriptors) {

		CommandGroup.apply(this, [context, descriptors]);
		var totalComplete = 0;

		this.execute = function() {

			var self = this;
			for (var x = 0; x < this.descriptors.length; x++) {

				var commandDescriptor = this.descriptors[x];
				var command = this.context.instantiateDescriptor(commandDescriptor);

				if (command instanceof Command)
					command.execute().then(
						function() {
							self.checkComplete();
						},
						function(error) {
							self.deferred.reject(error);
						});
				else
					command.start().then(
						function() {
							self.checkComplete();
						},
						function(error) {
							self.deferred.reject(error);
						});
			}
		};
		this.checkComplete = function() {

			if (++totalComplete == this.descriptors.length)
				this.deferred.resolve();
		};
	}

	CommandParallel.prototype = new CommandGroup();
	CommandParallel.prototype.constructor = CommandParallel;
	//----------------------------------------------------------------------------------------------------------------------
	function CommandFlow(context, descriptors) {

		CommandGroup.apply(this, [context, descriptors]);
		var currentIndex = 0;
		this.execute = function() {

			var self = this;
			var descriptor = this.descriptors[currentIndex];
			var locals = {};
			if(descriptor.services) {
				
				angular.forEach(descriptor.services.split(','), function(service, key){
					locals[service] = injector.get(service);
				});
			}
			var result = parse(descriptor.expresion)(this.context.contextData,locals);
			if(typeof result != 'boolean')
				throw new Error('Result from expresion :' + descriptor.expresion + ' is not boolean');
			if(result){

				var command = this.context.instantiateDescriptor(descriptor.commandDescriptor);
				if (command instanceof Command)
					command.execute().then(function() {
						self.next();
					});
				else
					command.start().then(function() {
						self.next();
				});
			} else {
				this.next();
			}
			
		};

		this.next = function() {

			if (++currentIndex == this.descriptors.length) {

				this.deferred.resolve();
				return;
			}
			this.execute();
		};
	}

	CommandParallel.prototype = new CommandGroup();
	CommandParallel.prototype.constructor = CommandFlow;
	//----------------------------------------------------------------------------------------------------------------------
	function CommandContext(data) {

		this.contextData = data || {};
		this.instantiator = new CommandInstantiator();
		this.contextData.commandModel = {};
		this.currentDeferred;
		this.currentCommand;
		this.canceled = false;
	}

	CommandContext.prototype.instantiateDescriptor = function(descriptor) {

		var command = this.instantiator.instantiate(descriptor, this);
		return command;
	};

	CommandContext.prototype.instantiate = function(funct,isCommand) {

		instance = injector.instantiate(funct,this.contextData);
		if(isCommand) this.currentCommand = instance;
		return instance;
	}

	CommandContext.prototype.processResults = function(result,config) {

		var self = this;
		var deferred = q.defer();
		if (!result) {

			deferred.resolve();
			return deferred.promise;
		}

		var promise = q.when(result).then(function(data) {

			self.contextData.lastResult = data;
			if (config && config.resultKey) {
				self.contextData[config.resultKey] = data;
			}
			deferred.resolve();
		},function(error){deferred.reject(error)});
		return deferred.promise;
	};

	CommandContext.prototype.invoke = function(theFunction, self) {

		return injector.invoke(theFunction,self,this.contextData);
	};
	
	CommandContext.prototype.getContextData = function(resultKey) {

		return this.contextData;
	};
	
	CommandContext.prototype.intercept = function(poincut,interceptors,command) {

		var self = this;
		var deferred = q.defer();
		if(!interceptors[poincut]){
			deferred.resolve();
			return deferred.promise;
		}
		interceptors[poincut].sort(function(a,b){
			return b.order - a.order;
		})
		switch(poincut) {
			case 'Around' : {
				var processor = new AroundProcessor(command,null,self,deferred);
				angular.forEach(interceptors[poincut],function(value){
					processor = new AroundProcessor(value.func,processor,self,deferred);
				});
				q.when(processor.invoke()).then(function(result){
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
						if(x == interceptors[poincut].length || self.canceled){
							deferred.resolve();
							return;
						}
						var interceptor = self.instantiate(interceptors[poincut][x++].func,false);
						q.when(self.invoke(interceptor.execute,interceptor)).then(function(){
							invocationChain();
						});
					}catch(error){deferred.reject(error)};
					
				})();
				break;
			}
		}
		return deferred.promise;
	};
	//----------------------------------------------------------------------------------------------------------------------

	function CommandInstantiator() {};

	CommandInstantiator.prototype.instantiate = function(descriptor,context) {

		switch (descriptor.commandType) {

			case 'S':
				return new CommandSequence(context, descriptor.descriptors);
			case 'P':
				return new CommandParallel(context, descriptor.descriptors);
			case 'E':
				return new Command(descriptor.command, context, descriptor.commandConfig,descriptor.interceptors);
			case 'F':
				return new CommandFlow(context, descriptor.descriptors);
		}
	};
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
	function AroundProcessor(executed,next,context,deferred) {
		
		InterceptorProcessor.apply(this,[context,deferred]);
		this.executed = executed;
		this.next = next;
	}
	AroundProcessor.prototype = new InterceptorProcessor();
	AroundProcessor.prototype.constructor = AroundProcessor;

	AroundProcessor.prototype.invoke = function() {
			
		var self = this;
		var deferred = q.defer();
		self.context.contextData.processor = self.next;
		var instance = self.context.instantiate(self.executed,this.next == null);
				
		q.when(self.context.invoke(instance.execute,instance)).then(function(data){
			deferred.resolve(data);
		},function(error){
			deferred.reject(error)
		});
		return deferred.promise;
	}
		
	//----------------------------------------------------------------------------------------------------------------------
	angular.module('commangular', [])
		.provider('$commangular', function() {
						
			return {
				$get: ['commandExecutor',
					function(commandExecutor) {
						
						return {
							dispatch: function(eventName, data) {

								return commandExecutor.execute(eventName, data);
							}
						}
					}
				],
		
				mapTo: function(eventName) {

					var interceptorChain = eventInterceptors[eventName] || (eventInterceptors[eventName] = {});
					if(!interceptorChain.interceptors)
						interceptorChain.interceptors = {};
					eventNameString = eventNameString.concat("%" + eventName + "%{" + eventName + "}\n");
					var descriptor = new CommandDescriptor();
					descriptors[eventName] = descriptor;
					return descriptor
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
				},
				modelBinding : function(eventName,serviceName,resultKey) {

					
				}
			};
		});
	//-----------------------------------------------------------------------------------------------------------------
	angular.module('commangular')
		.service('commandExecutor',function() {

				return {
					
					execute: function(eventName, data) {
						var deferred = q.defer();
						var context = new CommandContext(data);
						var command = context.instantiateDescriptor(descriptors[eventName]);
						var interceptors = eventInterceptors[eventName].interceptors;
						deferred.resolve();
						return deferred.promise.then(function() {
														
							return context.intercept('Before',interceptors);
						}).then(function() {

							return command.start();
						}).then(function(){

							return context.intercept('After',interceptors);	
						}).then(function() {
							
							return context.contextData;
						},function(error){
							var defer = q.defer();
							context.intercept('AfterThrowing',interceptors).then(function(){
								defer.reject(error);
							},function(){defer.reject(error)});
							return defer.promise;
						});
						
					},
				};
			}
		);
	//------------------------------------------------------------------------------------------------------------------
	angular.module('commangular')
		.run(['$rootScope','$commangular','$injector','$q','$parse',function($rootScope,$commangular,$injector,$q,$parse) {
			
			injector = $injector;
			q = $q;
			parse = $parse; 
			angular.forEach(aspects,function(aspect){
							
				while((result = aspect.matcher.exec(commandNameString)) != null) {
					
					if(!commands[result[1]].interceptors[aspect.poincut])
						commands[result[1]].interceptors[aspect.poincut] = [];
					commands[result[1]].interceptors[aspect.poincut]
							.push({func:aspect.aspectFunction,order:aspect.order});
				}
			});
			commandNameString = "";
			angular.forEach(eventAspects,function(aspect){
							
				while((result = aspect.matcher.exec(eventNameString)) != null) {
										
					if(eventInterceptors[result[1]] &&
						!eventInterceptors[result[1]].interceptors[aspect.poincut])
						eventInterceptors[result[1]].interceptors[aspect.poincut] = [];
					eventInterceptors[result[1]].interceptors[aspect.poincut]
							.push({func:aspect.aspectFunction,order:aspect.order});
				}
			});
			eventNameString = "";

			$rootScope.dispatch = function(eventName,data) {

				return $commangular.dispatch(eventName,data);
			}

		}]); 
	//------------------------------------------------------------------------------------------------------------------ 
})(window, angular);