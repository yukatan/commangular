"use strict";

describe("On error handler test", function() {

	var provider;
	var eventName = 'TestEvent';
	var executeMethodExecuted = false;
	var onErrorMethodExecuted = false;
	
	beforeEach(function() {
		
		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function() {

					throw new Error("Test Error");
					executeMethodExecuted = true;
					return 25;
				},
				onError : function(error) {

					expect(executeMethodExecuted).toBe(false);
					expect(error.message).toEqual("Test Error");
					onErrorMethodExecuted = true;
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

	it('OnError callback should be executed', function() {

		provider.mapTo(eventName).asSequence().add('Command1');
		dispatch({event:eventName},function(){

			expect(executeMethodExecuted).toBe(false);
			expect(onErrorMethodExecuted).toBe(true);
		});
	});

	
});