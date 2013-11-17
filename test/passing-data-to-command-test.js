describe("Passing data to commands test", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var plusResultValue;
	var minusResultValue

	beforeEach(function() {

		commangular.functions = {};
		commangular.create('Command1', function(data1,data2) {

			return {

				execute: function() {

					plusResultValue = data1 + data2;
				}
			};
		});
		commangular.create('Command2', function(data2,data1) {

			return {

				execute: function() {

					minusResultValue = data2 - data1;
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

		var commandComplete = false;
		provider.asSequence().add('Command1').add('Command2').mapTo(eventName);
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName,{data1:5,data2:7}).then(function(){
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {

			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {
			
			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(plusResultValue).toBe(12);
			expect(minusResultValue).toBe(2);
		})
	});

	
});