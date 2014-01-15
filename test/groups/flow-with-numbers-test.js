"use strict";

describe("Command Flow With Numbers execution testing", function() {

	var provider;
	var eventName = 'TestEvent';
	var endValue = 0;
	
	beforeEach(function() {
				
		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function() {
					
					return 2;
				}
			};
		},{resultKey:'result1'});

		commangular.create('Command2', function() {

			return {

				execute: function() {
					
					endValue = 2;
				}
			};
		});

		commangular.create('Command3', function() {

			return {

				execute: function() {
					
					endValue = 3;
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

	it('endValue should be 2', function() {
		
				
		commangular.create('Command1', function() {

			return {

				execute: function() {

					return 2;
				}
			};
		},{resultKey:'result1'});

		provider.mapTo(eventName)
			.asSequence()
				.add('Command1')
				.add(provider.asFlow()
					.link('result1 == 2').to('Command2')
					.link('result1 == 3').to('Command3'));
				
		dispatch({event:eventName},function(){

			expect(endValue).toBe(2);
		});
	});

	it('endValue should be 3', function() {
		
		var commandComplete = false;
		
		commangular.create('Command1', function() {

			return {

				execute: function() {
					
					return 3;
				}
			};
		},{resultKey:'result1'});

		provider.mapTo(eventName)
			.asSequence()
				.add('Command1')
				.add(provider.asFlow()
					.link('lastResult == 2').to('Command2')
					.link('lastResult == 3').to('Command3'));
	
		dispatch({event:eventName},function(){

			expect(endValue).toBe(3);
		});
	});
});