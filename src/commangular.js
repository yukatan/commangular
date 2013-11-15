(function(window, angular, undefined) {

	var commangular = window.commangular || (window.commangular = {});

	commangular.create = function(commandName, commandFunction) {

		if (!commangular.functions) {
			commangular.functions = {};
		}
		commangular.functions[commandName] = commandFunction;
	}

	//----------------------------------------------------------------------------------------------------------------------

	function CommandDescriptor(commandType) {

		this.commandType = commandType;
		this.descriptors = [];
		this.command = null;
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

	function Command(command, context) {

		CommandBase.apply(this, [context]);
		this.command = command;

		this.execute = function() {
			var self = this;
			var isError = false;
			this.deferred = this.context.$q.defer();
			var command = this.context.$injector.instantiate(this.command, this.context.getContextData());
			try {
				var result = this.context.$injector.invoke(command.execute, this.command, this.context.getContextData());
				var resultPromise = this.context.processResults(result, this.deferred);
			} catch (error) {
				isError = true;
				if (command.hasOwnProperty('onError')) {

					var contextData = this.context.getContextData();
					contextData.lastError = error;
					this.context.$injector.invoke(command.onError, this.command, this.context.getContextData());
				}
				this.deferred.reject(error);
			}
			if (command.hasOwnProperty('onComplete') && !isError) {

				resultPromise.then(function() {

					self.context.$injector.invoke(command.onComplete, self.command, self.context.getContextData());
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
			var command = this.context.instanciate(commandDescriptor);
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
				var command = this.context.instanciate(commandDescriptor);
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

	function CommandContext($injector, $q, instanciator, data) {

		this.contextData = data || {};
		this.instanciator = instanciator;
		this.$injector = $injector;
		this.$q = $q;

	}

	CommandContext.prototype.instanciate = function(descriptor) {

		var command = this.instanciator.instanciate(descriptor, this);
		return command;
	};

	CommandContext.prototype.processResults = function(resultValues, deferred) {

		var self = this;
		if (!resultValues) {

			deferred.resolve();
			return;
		}
		var promises = [];
		var keys = [];
		for (var prop in resultValues) {

			var value = this.$q.when(resultValues[prop]);
			promises.push(value);
			keys.push(prop);
		}
		var promise = this.$q.all(promises).then(function(data) {

			for (var x = 0; x < data.length; x++) {

				self.contextData[keys[x]] = data[x];
			}
			deferred.resolve();
		});
		return promise;

	};

	CommandContext.prototype.getContextData = function(resultKey) {

		return this.contextData;
	};

	//----------------------------------------------------------------------------------------------------------------------

	function CommandInstanciator() {

		return {

			instanciate: function(descriptor, context) {

				var command = {};
				if (descriptor.commandType == 'S') {

					command = new CommandSequence(context, descriptor.descriptors)
				}
				if (descriptor.commandType == 'P') {

					command = new CommandParallel(context, descriptor.descriptors)
				}
				if (descriptor.commandType == 'E') {

					command = new Command(descriptor.command, context);
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

								commandExecutor.execute(eventName, data);
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
					commandDescriptor.command = command;
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
						var context = new CommandContext($injector, $q, new CommandInstanciator(), data);
						var commandDescriptor = this.descriptors[eventName];
						var command = context.instanciate(commandDescriptor);
						command.start().then(function(data) {

							console.log("Command Complete");
						}, function(error) {

							console.log("Command context end with error :" + error);
						});
					},

				};

			}
		]);
	//------------------------------------------------------------------------------------------------------------------  
})(window, angular);