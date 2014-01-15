"use strict";

describe("Command Sequence execution testing", function() {

	var provider;
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
		inject();
	});

	it('testValue should be 26', function() {

		provider.mapTo(eventName).asSequence().add('Command1').add('Command2');
				
		dispatch({event:eventName},function() {

			expect(testValue).toBe(26);
		});
	});
});