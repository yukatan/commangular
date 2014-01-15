"use strict";

describe("@Around execution testing", function() {

	var provider;
	var scope;
	var interceptorExecutedBefore = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Around(/com\.test1.*/)', function(processor){

			return {

				execute:function() {

					expect(commandExecuted).toBe(false)
					processor.invoke();
					expect(commandExecuted).toBe(true);
					interceptorExecutedBefore = true;
				}
			}
			
		});

		commangular.create('com.test1.Command1',function(){

			return {

				execute : function() {
										
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

	it("should execute the interceptor around the command", function() {
	
		provider.mapTo('AroundTestEvent').asSequence().add('com.test1.Command1');

		dispatch({event:'AroundTestEvent'},function() {

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecuted).toBe(true);
		});
	});
});