"use strict";

describe("Command execution testing", function() {

	var provider;
	var eventName = 'TestEvent';
	
	beforeEach(function() {

		commangular.reset();
		
		commangular.create('Command1', function() {

			return {

				execute: function() {

					return 45;
				}
			};
		},{resultKey:'resultKeyTest'});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;
			

		});
		inject();
	});

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
	});
	

	it('Context data has to contain the result key', function() {

		provider.mapTo(eventName).asSequence().add('Command1');
		var commandComplete = false;
		
		dispatch({event:eventName},function(exc) {

			expect(exc.resultKey('resultKeyTest')).toBe(45);
		});
		
	});
	
});