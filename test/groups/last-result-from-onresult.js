"use strict";

describe("The last result should be the result from onResult method", function() {

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
		});
		
		commangular.create('Command2', function() {

			return {

				execute: function(lastResult) {
					
					resultInjected = lastResult;
				}
			};
		});
		commangular.create('Command3', function() {

			return {

				execute: function($timeout, $q) {

					var deferred = $q.defer()
					$timeout(function() {
						deferred.resolve(75);
					}, 500);
					return deferred.promise;
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

	it('command should work with promise resolution as well', function() {

		provider.mapTo(eventName).asSequence().add('Command3').add('Command2');
	
		dispatch({event:eventName},function() {
			
			expect(resultInjected).toBe(75);
		});
		timeout.flush();
	});

	
});