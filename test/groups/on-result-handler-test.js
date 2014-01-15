"use strict";

describe("On result handler test", function() {

	var provider;
	var eventName = 'TestEvent';
	var executeMethodExecuted = false;
	var onResultMethodExecuted = false;
	
	beforeEach(function() {
		
		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function() {

					executeMethodExecuted = true;
					return 25;
				},
				onResult : function(result) {

					expect(result).toBe(25);
					onResultMethodExecuted = true;

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

		
		provider.mapTo(eventName).asSequence().add('Command1');
		dispatch({event:eventName},function() {

			expect(executeMethodExecuted).toBe(true);
			expect(onResultMethodExecuted).toBe(true);
		});
	});

	
});