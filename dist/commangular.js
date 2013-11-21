/**
 * Command pattern implementation for AngularJS
 * @version v0.4.1 - 2013-11-21
 * @link https://github.com/yukatan/commangular
 * @author Jesús Barquín Cheda <yukatan@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(window, angular, undefined) {

	var commangular = window.commangular || (window.commangular = {});

	commangular.create = function(commandName, commandFunction, commandConfig) {

		if (!commangular.functions) {
			commangular.functions = {};
		}
		commangular.functions[commandName] = {
			function: commandFunction,
			config: commandConfig
		};
	}

	//----------------------------------------------------------------------------------------------------------------------

	function CommandDescriptor(commandType) {

		this.commandType = commandType;
		this.descriptors = [];
		this.command = null;
		this.commandConfig;
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

			command = commangular.functions[command];
		}

		if (command instanceof CommandDescriptor) {

			this.descriptors.push(command);
			return this;
		}
		var commandDescriptor = new CommandDescriptor('E');
		commandDescriptor.command = command.function;
		commandDescriptor.commandConfig = command.config;
		this.descriptors.push(commandDescriptor);
		return this;
	};
	CommandDescriptor.prototype.resultLink = function(key, value) {

		var descriptor = new ResultKeyLinkDescriptor(key, value,this);
		this.descriptors.push(descriptor); 
		return descriptor;
	};
	CommandDescriptor.prototype.serviceLink = function(service,property,value) {

		var descriptor = new ServiceLinkDescriptor(service, property,value,this);
		this.descriptors.push(descriptor); 
		return descriptor;
	};
	//----------------------------------------------------------------------------------------------------------------------
	function LinkDescriptor(parent) {

		this.commandDescriptor;
		this.parent = parent;
	}

	LinkDescriptor.prototype.to = function(command){

		if (angular.isString(command)) {

			command = commangular.functions[command];
		}

		if (command instanceof CommandDescriptor) {

			this.commandDescriptor = command;
			return this.parent;
		}
		var commandDescriptor = new CommandDescriptor('E');
		commandDescriptor.command = command.function;
		commandDescriptor.commandConfig = command.config;
		this.commandDescriptor = commandDescriptor;
		return this.parent;
	}; 
	
	//----------------------------------------------------------------------------------------------------------------------
	function ResultKeyLinkDescriptor(key, value,parent) {

		LinkDescriptor.apply(this,[parent])
		this.key = key;
		this.value = value;
				
	}
	ResultKeyLinkDescriptor.prototype = new LinkDescriptor();
	ResultKeyLinkDescriptor.prototype.constructor = ResultKeyLinkDescriptor;
	//----------------------------------------------------------------------------------------------------------------------
	function ServiceLinkDescriptor(service,property, value,parent) {

		LinkDescriptor.apply(this,[parent])
		this.service = service;
		this.property = property;
		this.value = value;
	}
	ServiceLinkDescriptor.prototype = new LinkDescriptor();
	ServiceLinkDescriptor.prototype.constructor = ServiceLinkDescriptor;
	//----------------------------------------------------------------------------------------------------------------------
	function CommandBase(context) {

		this.context = context;
		this.deferred = null;

	}
	//----------------------------------------------------------------------------------------------------------------------

	function Command(command, context, config) {

		CommandBase.apply(this, [context]);
		this.command = command;
		this.commandConfig = config;

		this.execute = function() {

			var self = this;
			var isError = false;
			var $q = this.context.$q;
			var $injector = this.context.$injector;

			this.deferred = $q.defer();
			var command = $injector.instantiate(this.command, this.context.getContextData());
			try {
				var result = $injector.invoke(command.execute, this.command, this.context.getContextData());
				var resultPromise = this.context.processResults(result, this.deferred, this.commandConfig);
			} catch (error) {
				isError = true;
				if (command.hasOwnProperty('onError')) {

					var contextData = this.context.getContextData();
					contextData.lastError = error;
					$injector.invoke(command.onError, this.command, this.context.getContextData());
				}
				this.deferred.reject(error);
			}
			if (command.hasOwnProperty('onComplete') && !isError) {

				resultPromise.then(function() {

					$injector.invoke(command.onComplete, self.command, self.context.getContextData());
				});
			}
			return this.deferred.promise;
		}
	}
	Command.prototype = new CommandBase();
	Command.prototype.constructor = Command;

	//----------------------------------------------------------------------------------------------------------------------
	function CommandGroup(context, descriptors) {

		CommandBase.apply(this, [context]);
		this.descriptors = descriptors;

		this.start = function() {

			this.deferred = this.context.$q.defer();
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
			var command = this.context.instantiate(commandDescriptor);

			if (command instanceof Command)
				command.execute().then(
					function() {
						self.nextCommand();
					},
					function(error) {
						self.deferred.reject(error);
					});
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
				var command = this.context.instantiate(commandDescriptor);

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
			if (descriptor instanceof ResultKeyLinkDescriptor) {
				if (this.context.contextData[descriptor.key] === descriptor.value) {
						
					var command = this.context.instantiate(descriptor.commandDescriptor);
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
			}
			if (descriptor instanceof ServiceLinkDescriptor) {
								
				var service = this.context.$injector.get(descriptor.service);
				if (service[descriptor.property] === descriptor.value) {
						
					var command = this.context.instantiate(descriptor.commandDescriptor);
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
	function CommandContext($injector, $q, instantiator, data) {

		this.contextData = data || {};
		this.instantiator = instantiator;
		this.$injector = $injector;
		this.$q = $q;
		this.contextData.commandModel = {};
	}

	CommandContext.prototype.instantiate = function(descriptor) {

		var command = this.instantiator.instantiate(descriptor, this);
		return command;
	};

	CommandContext.prototype.processResults = function(result, deferred, config) {

		var self = this;
		if (!result) {

			deferred.resolve();
			return;
		}

		var promise = this.$q.when(result).then(function(data) {

			self.contextData.lastResult = data;
			if (config && config.resultKey) {
				self.contextData[config.resultKey] = data;
			}
			deferred.resolve();
		});
		return promise;
	};

	CommandContext.prototype.getContextData = function(resultKey) {

		return this.contextData;
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
				return new Command(descriptor.command, context, descriptor.commandConfig);
			case 'F':
				return new CommandFlow(context, descriptor.descriptors);
		}
	};
	//----------------------------------------------------------------------------------------------------------------------

	//----------------------------------------------------------------------------------------------------------------------
	angular.module('commangular', [])
		.provider('$commangular', function() {

			var descriptors = {};
						
			return {
				$get: ['commandExecutor',
					function(commandExecutor) {

						commandExecutor.descriptors = descriptors;
						return {
							dispatch: function(eventName, data) {

								return commandExecutor.execute(eventName, data);
							}
						}
					}
				],
		
				mapTo: function(eventName) {

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
				}

			};

		});

	//-----------------------------------------------------------------------------------------------------------------

	angular.module('commangular')
		.service('commandExecutor', ['$injector', '$q',
			function($injector, $q) {

				return {

					descriptors: {},

					execute: function(eventName, data) {
						var deferred = $q.defer();
						var context = new CommandContext($injector, $q, new CommandInstantiator(), data);
						var commandDescriptor = this.descriptors[eventName];
						var command = context.instantiate(commandDescriptor);
						command.start().then(function(data) {
							
							deferred.resolve();
						}, function(error) {

							console.log("Command context end with error :" + error);
							deferred.reject(error);
						});
						return deferred.promise;
					},

				};
			}
		]);
	//------------------------------------------------------------------------------------------------------------------  
})(window, angular);