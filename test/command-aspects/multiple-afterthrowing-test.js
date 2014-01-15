"use strict";

describe("Multipe @AfterThrowing interception test", function() {

	var provider;
	var interceptor1Executed = false;
	var interceptor2Executed = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@AfterThrowing(/com\.test1.*/)', function(processor,lastError){

			return {

				execute:function() {

					expect(interceptor1Executed).toBe(true);
					expect(commandExecuted).toBe(false)
					expect(lastError.message).toBe('Error from command');
					interceptor2Executed = true;
				}
			}
			
		},2);

		commangular.aspect('@AfterThrowing(/com\.test1.*/)', function(processor,lastError){

			return {

				execute:function() {

					expect(commandExecuted).toBe(false)
					expect(lastError.message).toBe('Error from command');
					interceptor1Executed = true;
				}
			}
			
		},1);
	
		commangular.create('com.test1.Command1',function(){

			return {

				execute : function() {
										
						throw new Error('Error from command');
						commandExecuted = true;
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

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the commands and intercept exceptions", function() {
	
		provider.mapTo('AroundTestEvent').asSequence().add('com.test1.Command1');
		dispatch({event:'AroundTestEvent'},function(){

			expect(interceptor1Executed).toBe(true);
			expect(interceptor2Executed).toBe(true);
			expect(commandExecuted).toBe(false);
		});
	});
});