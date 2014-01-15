"use strict";

describe("EventAspect execution testing", function() {

	var provider;
	
	var beforeInterceptorExecuted = false;
	var commandExecuted = false;
	var afterInterceptorExecuted = false;
	var afterThrowingInterceptorExecuted = false;
	
	beforeEach(function() {

		commangular.reset();
		commangular.eventAspect('@Before(/TestEvent/)', function(){

			return {

				execute:function () {
					
					beforeInterceptorExecuted = true;
				}
			}
			
		});
		commangular.eventAspect('@After(/TestEvent/)', function(){

			return {

				execute : function() {

					expect(beforeInterceptorExecuted).toBe(true);
					expect(commandExecuted).toBe(true);
					afterInterceptorExecuted = true;
				}
			}
		});

		commangular.eventAspect('@AfterThrowing(/TestEvent2/)', function(){

			return {

				execute : function() {

					afterThrowingInterceptorExecuted = true;
				}
			}
		});

		commangular.create('Command1',function(){

			return {

				execute : function() {
					
					expect(beforeInterceptorExecuted).toBe(true);
					commandExecuted = true;
				}
			};
		});

		commangular.create('Command2',function(){

			return {

				execute : function() {
					
					throw new Error('Event aspect Error');
				}
			};
		});
		
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;
			provider.mapTo('TestEvent').asSequence().add('Command1');
			provider.mapTo('TestEvent2').asSequence().add('Command2');
		});
		inject();
	});

	it("should execute the interceptor before the command", function() {
		
		dispatch({event:'TestEvent'},function() {

			expect(commandExecuted).toBe(true);
			expect(beforeInterceptorExecuted).toBe(true);
			expect(afterInterceptorExecuted).toBe(true);
		});	
	});

	it("should execute the interceptor before the command", function() {
						
		dispatch({event:'TestEvent2'},function() {

			expect(afterThrowingInterceptorExecuted).toBe(true);
		});	
	});

});