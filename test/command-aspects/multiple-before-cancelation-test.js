"use strict";

describe("Multiple @Before execution testing", function() {

	var provider;
	var interceptor1Executed = false;
	var interceptor2Executed = false;
	var commandExecutedAfter = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Before(/com\.test1.*/)', function(processor){

			return {

				execute : function() {
					
					interceptor1Executed = true;
					processor.cancel('Cancelation');
				}
			}
			
		},1);
		
		commangular.aspect('@Before(/com\.test1.*/)', function(processor){
			
			return {

				execute : function() {
					
					expect(false).toBe(true); //Error if this is executed
					
				}
			}
			
		},2);

		
		commangular.create('com.test1.Command1',function(){

			return {

				execute : function() {
										
					expect(false).toBe(true); //Error if this is executed
					
				}
			};
		});

		commangular.create('com.test2.Command2',function(){

			return {

				execute : function() {
										
					expect(interceptor1Executed).toBe(true);
					expect(interceptor2Executed).toBe(false);
					expect(commandExecutedAfter).toBe(false);

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

	it("should execute the interceptor and cancel the command group", function() {
	
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test1.Command1').add('com.test2.Command2');
		dispatch({event:'BeforeTestEvent'},function(){

			expect(interceptor1Executed).toBe(true);
			expect(interceptor2Executed).toBe(false);
			expect(commandExecutedAfter).toBe(false);
		});
	});
});