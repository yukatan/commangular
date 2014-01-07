describe("Throw exception on around interceptor testing", function() {

	var provider;
	var interceptorExecutedBefore = false;
	var afterThrowingExecuted = false;
	var commandExecutedAfter = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Around(/com\.test1.*/)', function(){

			return {

				execute : function() {

					throw new Error('This is an error');
					processor.invoke();
					interceptorExecutedBefore = true;
				}
			}
			
		});

		commangular.aspect('@AfterThrowing(/com\.test1.*/)', function(){

			return {

				execute : function() {

					afterThrowingExecuted = true;
				}
			}
			
		});
			

		commangular.create('com.test1.Command1',function(){

			return {

				execute : function() {
										
					if(interceptorExecutedBefore) {
						
						commandExecutedAfter = true;
					}
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

	it("should execute the interceptor before the command", function() {
	
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test1.Command1');
		dispatch({event:'BeforeTestEvent'},function(){

			expect(interceptorExecutedBefore).toBe(false);
			expect(commandExecutedAfter).toBe(false);
			expect(afterThrowingExecuted).toBe(true);
		});
	});
});