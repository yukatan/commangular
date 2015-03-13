"use strict";

describe("The result key should be the result from onResult method", function() {

	var provider;
	var injector;
	var eventName = 'TestEvent';
	var resultInjected;
	var timeout;

	beforeEach(function() {
		
		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function() {
					
					return 25;
				},
				onResult: function(result){

					expect(result).toBe(25);
					return 26;
				}
			};
		},{resultKey:'resultValue'});
		
		commangular.create('Command2', function() {

			return {

				execute: function(resultValue) {
					
					resultInjected = resultValue;
				}
			};
		});
		
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($timeout) {

			timeout = $timeout;
		});
	});
	
	it('command should be executed and result injected has to be 26', function() {

		provider.mapTo(eventName).asSequence().add('Command1').add('Command2');
			
		dispatch({event:eventName},function() {
			
			expect(resultInjected).toBe(26)
		});
	});
	
});