"use strict";

describe("Command Flow execution testing", function() {

	var provider;
	var eventName = 'TestEvent';
	var command2Executed = false;
	
	beforeEach(function() {
		
		command2Executed = false;
		commangular.reset();
		commangular.create('Command2', function() {

			return {

				execute: function() {

					command2Executed = true;
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

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
	});

	it('command 2 should be executed', function() {

		
		commangular.create('Command1', function() {

			return {

				execute: function() {

					return true;
				}
			};
		},{resultKey:'result1'});


		var commandComplete = false;
		provider.mapTo(eventName).asSequence()
			.add('Command1')
			.add(provider.asFlow()
				.link('result1 == true').to('Command2'));
			
		dispatch({event:eventName},function() {
			
			expect(command2Executed).toBe(true);
		});
	});

	it('command 2 should not be executed', function() {

		
		commangular.create('Command1', function() {

			return {

				execute: function() {

					return false;
				}
			};
		},{resultKey:'result1'});


		var commandComplete = false;
		provider.mapTo(eventName).asSequence()
			.add('Command1')
			.add(provider.asFlow()
				.link('result1 == true').to('Command2'));
		
		dispatch({event:eventName},function() {

			expect(command2Executed).toBe(false);
		});
	});
});