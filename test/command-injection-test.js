describe("Command execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	
	var injectedScope;
	var injectedInjector;
	var injectedLog;

	beforeEach(function() {

		executed = false;
		commangular.commands = {};
		commangular.aspects = [];
		commangular.create('Command1', function($log, $rootScope) {

			injectedLog = $log;
			injectedScope = $rootScope;

			return {

				execute: function($injector) {

					injectedInjector = $injector;
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

		var commmandComplete = false;
		provider.mapTo(eventName).asSequence().add('Command1');
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName).then(function(){
					commmandComplete = true;
				});
			});
		});

		waitsFor(function() {

			return commmandComplete;
		}, 'The command should be executed', 1000)


		runs(function() {
			
			expect(injectedInjector).toBeDefined();
			expect(injectedInjector).toEqual(injector);
			expect(injectedScope).toBeDefined();
			expect(injectedScope).toEqual(scope);
			expect(injectedLog).toBeDefined();
		})
	});
});