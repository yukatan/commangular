describe("Command Sequence execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var executed = false;
	var executed2 = false;
	var testValue;

	beforeEach(function() {

		executed = false;
		executed2 = false;
		commangular.functions = {};
		commangular.create('Command1', function(commandModel) {

			return {

				execute: function() {
					
					commandModel.value1 = 25;
					executed = true;

				}
			};
		});
		commangular.create('Command2', function(commandModel) {

			return {

				execute: function($log) {

					commandModel.value1++;
					testValue = commandModel.value1;
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

	it('testValue should be 26', function() {

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
			expect(testValue).toBe(26);
		})
	});
	
});