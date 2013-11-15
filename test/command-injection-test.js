describe("Command execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var executed = false;

	var injectedScope;
	var injectedInjector;
	var injectedLog;

	beforeEach(function() {

		executed = false;
		commangular.functions = {};
		commangular.create('Command1', function($log, $rootScope) {

			injectedLog = $log;
			injectedScope = $rootScope;

			return {

				execute: function($injector) {

					injectedInjector = $injector;
					executed = true;

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

	it('injection should be working', function() {

		provider.asSequence().add('Command1').mapTo(eventName);
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
			expect(injectedInjector).toBeDefined();
			expect(injectedInjector).toEqual(injector);
			expect(injectedScope).toBeDefined();
			expect(injectedScope).toEqual(scope);
			expect(injectedLog).toBeDefined();
		})
	});
});