describe("Injection using lastResult test", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var executed = false;
	var executed2 = false;
	var resultInjected;
	var timeout;

	beforeEach(function() {

		executed = false;
		executed2 = false;
		commangular.functions = {};
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					executed = true;
					return 25;

				}
			};
		});
		
		commangular.create('Command2', function() {

			return {

				execute: function(lastResult,$log) {

					$log.log(lastResult);
					resultInjected = lastResult;
					executed2 = true;

				}
			};
		});
		commangular.create('Command3', function() {

			return {

				execute: function($log, $timeout, $q) {

					var deferred = $q.defer()
					$timeout(function() {
						executed = true;
						deferred.resolve(25);
					}, 500);
					$log.log('logging');
					return deferred.promise;
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($commangular, $rootScope, $injector,$timeout) {

			dispatcher = $commangular;
			scope = $rootScope;
			injector = $injector;
			timeout = $timeout;
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

	it('command should be executed and result injected has to be 25', function() {

		provider.asSequence().add('Command1').add('Command2').mapTo(eventName);
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
			expect(resultInjected).toBe(25)
		})
	});

	it('command should work with promise resolution as well', function() {

		provider.asSequence().add('Command3').add('Command2').mapTo(eventName);
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName);
			});

		});

		waitsFor(function() {

			timeout.flush();
			return executed && executed2;

		}, 'The command should be executed', 1000)


		runs(function() {

			expect(executed).toBe(true);
			expect(executed2).toBe(true);
			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(resultInjected).toBe(25)
		})
	});

	
});