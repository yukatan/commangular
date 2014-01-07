describe("After event aspect execution testing", function() {

	var provider;
	var afterInterceptorExecuted = false;
	var afterInterceptorExecuted2 = false;
	var afterInterceptorExecuted3 = false;
	var commandExecuted = false;
	var commandExecuted2 = false;
	
	
	beforeEach(function() {

		commangular.reset();
		commangular.eventAspect('@After(/TestEvent/)', function(){

			return {

				execute:function () {
					
					expect(commandExecuted).toBe(true);
					afterInterceptorExecuted = true;
				}
			}
			
		});
		commangular.eventAspect('@After(/TestEvent[0-4]/)', function(){

			return {

				execute : function() {

					afterInterceptorExecuted2 = true;
				}
			}
		},1);

		commangular.eventAspect('@After(/TestEvent2/)', function(){

			return {

				execute : function() {

					expect(commandExecuted2).toBe(true);
					expect(afterInterceptorExecuted2).toBe(true);
					afterInterceptorExecuted3 = true;
				}
			}
		},2);

		commangular.create('Command1',function(){

			return {

				execute : function() {
					
					commandExecuted = true;
				}
			};
		});

		commangular.create('Command2',function(){

			return {

				execute : function() {
										
					commandExecuted2 = true;
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

	it("should execute the interceptor after the command", function() {
		
		
		dispatch({event:'TestEvent'},function() {

			expect(commandExecuted).toBe(true);
			expect(afterInterceptorExecuted).toBe(true);
		});
	});

	it("should execute interceptor after the command", function() {
		
		
		dispatch({event:'TestEvent2'},function() {

			expect(commandExecuted2).toBe(true);
			expect(afterInterceptorExecuted2).toBe(true);
			expect(afterInterceptorExecuted3).toBe(true);
		});
	});
});