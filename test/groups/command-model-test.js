describe("Command Sequence execution testing", function() {

	var provider;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var testValue;

	beforeEach(function() {
		
		commangular.reset();
		commangular.create('Command1', function(commandModel) {

			return {

				execute: function() {
					
					commandModel.value1 = 25;
				}
			};
		});
		commangular.create('Command2', function(commandModel) {

			return {

				execute: function() {

					commandModel.value1++;
					testValue = commandModel.value1;
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($rootScope, $injector) {

			scope = $rootScope;
			injector = $injector;
		});
	});

	it('testValue should be 26', function() {

		provider.mapTo(eventName).asSequence().add('Command1').add('Command2');
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		
		dispatch({event:eventName},function() {

			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(testValue).toBe(26);
		});
	});
});