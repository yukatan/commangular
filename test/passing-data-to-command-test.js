describe("Pasing data to commands test", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var executed = false;
	var executed2 = false;
	var plusResultValue;
	var minusResultValue

	beforeEach(function() {

		executed = false;
		executed2 = false;
		commangular.functions = {};
		commangular.create('Command1', function(data1,data2) {

			return {

				execute: function() {

					plusResultValue = data1 + data2;
					executed = true;

				}
			};
		});
		commangular.create('Command2', function(data2,data1) {

			return {

				execute: function() {

					minusResultValue = data2 - data1;
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

	it('calculation has to be 12 and 2', function() {

		provider.asSequence().add('Command1').add('Command2').mapTo(eventName);
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName,{data1:5,data2:7});
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
			expect(plusResultValue).toBe(12);
			expect(minusResultValue).toBe(2);
		})
	});

	
});