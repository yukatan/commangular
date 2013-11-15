describe("Command Parallel execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var executed = false;
	var executed2 = false;

	beforeEach(function() {

		executed = false;
		executed2 = false;
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

	it('command should be executed', function() {

		provider.asParallel().add('Command1').add('Command2').mapTo(eventName);
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName);
			});

		});

		waitsFor(function() {

			return executed && executed2;

		}, 'The command should be executed', 1000)


		runs(function() {

			expect(executed).toBe(true);
			expect(executed2).toBe(true);
			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(injector.instantiate.callCount).toBe(2);
			expect(injector.invoke.callCount).toBe(2);
		})
	});

	it('command.execute method should be called twice', function() {

		var command = {

			execute: function() {

				executed = true;
			}
		};
		provider.asParallel().add('Command1').add('Command2').mapTo(eventName);
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
			expect(command.execute.callCount).toBe(2);
			
		})
	});
});
