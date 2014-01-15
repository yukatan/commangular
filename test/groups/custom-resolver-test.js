"use strict";

describe("Custom resolver test", function() {

	var provider;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.resolver('com.exec.Command1', function(result){

			expect(result).toBe(50);
			return 75;
		});
		
		
		commangular.create('com.exec.Command1',function(){

			return {

				execute : function() {
										
						commandExecuted = true;
						return 50;
				}
			};
		},{resultKey:'result'});
		
	
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {
			provider = $commangularProvider;
		});
		inject();
	});
	//TODO: Add more expectations to test result returned
	it("The resolver should be executed", function() {
	
		provider.mapTo('CustomResolverEvent').asSequence().add('com.exec.Command1');

		dispatch({event:'CustomResolverEvent'},function() {

			expect(commandExecuted).toBe(true);
		})
	});
});