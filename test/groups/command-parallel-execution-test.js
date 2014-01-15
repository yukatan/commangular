"use strict";

describe("Command Parallel execution testing", function() {

	var provider;
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
		inject();
	});

	it('command should be executed', function() {

		provider.mapTo(eventName).asParallel().add('Command1').add('Command2');
				
		dispatch({event:eventName},function() {

			//TODO:Use commangular mocks to test execution.

			/*expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(injector.instantiate.callCount).toBe(2);
			expect(injector.invoke.callCount).toBe(2);*/
		});
	});

	it('command.execute method should be called twice', function() {

		/*var command = {execute: function() {}};
		provider.mapTo(eventName).asParallel().add('Command1').add('Command2');
		
		dispatch({event:eventName},function() {

			expect(command.execute).toHaveBeenCalled();
			expect(command.execute.callCount).toBe(2);
		});*/
	});
});
