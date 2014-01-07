describe("Command Parallel execution testing", function() {

	var provider;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	
	beforeEach(function() {
		
		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
				}
			};
		});
		commangular.create('Command2', function() {

			return {

				execute: function($log) {

					$log.log('logging');
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function( $rootScope, $injector) {

			scope = $rootScope;
			injector = $injector;
		});
	});

	it('command should be executed', function() {

		provider.mapTo(eventName).asParallel().add('Command1').add('Command2');
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		
		dispatch({event:eventName},function() {

			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(injector.instantiate.callCount).toBe(2);
			expect(injector.invoke.callCount).toBe(2);
		});
	});

	it('command.execute method should be called twice', function() {

		var command = {execute: function() {}};
		provider.mapTo(eventName).asParallel().add('Command1').add('Command2');
		spyOn(injector, 'instantiate').andReturn(command);
		spyOn(command, 'execute').andCallThrough();
		
		dispatch({event:eventName},function() {

			expect(command.execute).toHaveBeenCalled();
			expect(command.execute.callCount).toBe(2);
		});
	});
});
