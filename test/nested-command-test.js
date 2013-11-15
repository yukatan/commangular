describe("Command parallel and sequence nested execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var executed = false;
	var executed2 = false;
	var executed3 = false;
	var executed4 = false;

	beforeEach(function() {

		executed = false;
		executed2 = false;
		executed3 = false;
		executed4 = false;
		commangular.functions = {};
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					executed = true;

				}
			};
		});
		commangular.create('Command2', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					executed2 = true;

				}
			};
		});
		commangular.create('Command3', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					executed3 = true;

				}
			};
		});
		commangular.create('Command4', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					executed4 = true;

				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($commangular, $rootScope, $injector) {

			dispatcher = $commangular;
			scope = $rootScope;
			injector = $injector;
		});
	});

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
	});

	it('dispatcher should be defined', function() {

		expect(dispatcher).toBeDefined();
	});

	it('injector should be defined', function() {

		expect(injector).toBeDefined();
	});

	it('command parallel nested should be executed', function() {

		var parallel = provider.asParallel().add('Command3').add('Command4').create();
		provider.asSequence().add('Command1').add('Command2').add(parallel).mapTo(eventName);
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName);
			});

		});

		waitsFor(function() {

			return executed && executed2 && executed3 && executed4;

		}, 'The command should be executed', 1000)


		runs(function() {

			expect(executed).toBe(true);
			expect(executed2).toBe(true);
			expect(executed3).toBe(true);
			expect(executed4).toBe(true);
			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
		})
	});

	it('command sequence nested should be executed', function() {

		var sequence = provider.asSequence().add('Command3').add('Command4').create();
		provider.asSequence().add('Command1').add('Command2').add(sequence).mapTo(eventName);
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName);
			});

		});

		waitsFor(function() {

			return executed && executed2 && executed3 && executed4;

		}, 'The command should be executed', 1000)


		runs(function() {

			expect(executed).toBe(true);
			expect(executed2).toBe(true);
			expect(executed3).toBe(true);
			expect(executed4).toBe(true);
			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
		})
	});

	it('command.execute method should be called four times', function() {

		var parallel = provider.asParallel().add('Command3').add('Command4').create();
		var command = {

			execute: function() {

				executed = true;
			}
		};
		provider.asSequence().add('Command1').add('Command2').add(parallel).mapTo(eventName);
		spyOn(injector, 'instantiate').andReturn(command);
		spyOn(command, 'execute').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName);
			});

		});

		waitsFor(function() {

			return executed;

		}, 'The command should be executed', 1000)


		runs(function() {

			expect(executed).toBe(true);
			expect(command.execute).toHaveBeenCalled();
			expect(command.execute.callCount).toBe(4);
		})
	});
	it('command.execute method should be called four times', function() {

		var sequence = provider.asParallel().add('Command3').add('Command4').create();
		var command = {

			execute: function() {

				executed = true;
			}
		};
		provider.asSequence().add('Command1').add('Command2').add(sequence).mapTo(eventName);
		spyOn(injector, 'instantiate').andReturn(command);
		spyOn(command, 'execute').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName);
			});

		});

		waitsFor(function() {

			return executed;

		}, 'The command should be executed', 1000)


		runs(function() {

			expect(executed).toBe(true);
			expect(command.execute).toHaveBeenCalled();
			expect(command.execute.callCount).toBe(4);
		})
	});
});