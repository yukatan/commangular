/**
 * Command pattern implementation for AngularJS
 * @version v0.3.0 - 2013-11-17
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
	CommandDescriptor.prototype.add = function(command) {

		this.descriptors.push(command);
	}
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
			
			var isError = false;
			var $q = this.context.$q;
			var $injector = this.context.$injector;

			this.deferred = $q.defer();
			var command = $injector.instantiate(this.command, this.context.getContextData());
			try {
				var result = $injector.invoke(command.execute, this.command, this.context.getContextData());
				var resultPromise = this.context.processResults(result, this.deferred,this.commandConfig);
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
	Command.prototype = CommandBase;
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
	CommandGroup.prototype = CommandBase;
	CommandGroup.prototype.constructor = CommandGroup;
	//----------------------------------------------------------------------------------------------------------------------

	function CommandSequence(context, descriptors) {

		CommandGroup.apply(this, [context, descriptors]);
		this.currentIndex = 0;

		this.execute = function() {
			var self = this;
			var commandDescriptor = this.descriptors[this.currentIndex];
			var command = this.context.instantiate(commandDescriptor);
			if (command instanceof CommandSequence || command instanceof CommandParallel)
				command.start().then(
					function() {
						self.nextCommand();
					},
					function(error) {
						self.deferred.reject(error);
					});
			if (command instanceof Command)
				command.execute().then(
					function() {
						self.nextCommand();
					},
					function(error) {
						self.deferred.reject(error);
					});

		};
		this.nextCommand = function() {

			if (++this.currentIndex == this.descriptors.length) {

				this.deferred.resolve();
				return;
			}
			this.execute();
		};
	}
	CommandSequence.prototype = CommandGroup;
	CommandSequence.prototype.constructor = CommandSequence;
	//----------------------------------------------------------------------------------------------------------------------
	function CommandParallel(context, descriptors) {

		CommandGroup.apply(this, [context, descriptors]);
		this.totalComplete = 0;

		this.execute = function() {

			var self = this;
			for (var x = 0; x < this.descriptors.length; x++) {

				var commandDescriptor = this.descriptors[x];
				var command = this.context.instantiate(commandDescriptor);
				if (command instanceof CommandSequence || command instanceof CommandParallel)
					command.start().then(
						function() {
							self.checkComplete();
						},
						function(error) {
							self.deferred.reject(error);
						});
				if (command instanceof Command)
					command.execute().then(
						function() {
							self.checkComplete();
						},
						function(error) {
							self.deferred.reject(error);
						});
			}
		};
		this.checkComplete = function() {

			if (++this.totalComplete == this.descriptors.length) {

				this.deferred.resolve();
			}


		};
	}

	CommandParallel.prototype = CommandGroup
	CommandParallel.prototype.constructor = CommandParallel;
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

	function CommandInstantiator() {

		return {

			instantiate: function(descriptor, context) {

				var command = {};
				if (descriptor.commandType == 'S') {

					command = new CommandSequence(context, descriptor.descriptors)
				}
				if (descriptor.commandType == 'P') {

					command = new CommandParallel(context, descriptor.descriptors)
				}
				if (descriptor.commandType == 'E') {

					command = new Command(descriptor.command, context, descriptor.commandConfig);
				}
				return command;
			}
		}

	}
	//----------------------------------------------------------------------------------------------------------------------

	//----------------------------------------------------------------------------------------------------------------------
	angular.module('commangular', [])
		.provider('$commangular', function() {

			var descriptors = {};
			var currentCommandDescriptor;
			var pendingDescriptors = [];

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
				asSequence: function() {

					if (currentCommandDescriptor) {

						pendingDescriptors.push(currentCommandDescriptor);
					}
					currentCommandDescriptor = new CommandDescriptor('S');
					return this;
				},

				asParallel: function() {

					if (currentCommandDescriptor) {

						pendingDescriptors.push(currentCommandDescriptor);
					}
					currentCommandDescriptor = new CommandDescriptor('P');
					return this;
				},

				add: function(command) {

					if (angular.isString(command)) {

						command = this.get(command);
					}

					if (command instanceof CommandDescriptor) {

						currentCommandDescriptor.add(command);
						return this;
					}
					var commandDescriptor = new CommandDescriptor('E');
					commandDescriptor.command = command.function;
					commandDescriptor.commandConfig = command.config;
					currentCommandDescriptor.add(commandDescriptor);
					return this;
				},

				mapTo: function(eventName) {

					if (pendingDescriptors.length > 0) {

						throw "Incorrect command structure on " + eventName;
					}
					descriptors[eventName] = currentCommandDescriptor;
					currentCommandDescriptor = null;
				},

				create: function() {

					var descriptor = currentCommandDescriptor;
					currentCommandDescriptor = (pendingDescriptors.length > 0) ? pendingDescriptors.pop() : null;
					return descriptor;
				},

				get: function(commandName) {

					return commangular.functions[commandName];
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

							console.log("Command Complete");
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