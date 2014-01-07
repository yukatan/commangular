describe("@AfterThrowing interception test", function() {

	var provider;
	var interceptorExecuted = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@AfterThrowing(/com\.test1.*/)', function(processor,lastError){

			return {

				execute:function() {

					expect(commandExecuted).toBe(false)
					expect(lastError.message).toBe('Error from command');
					interceptorExecuted = true;
				}
			}
			
		});
	
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

	it("should execute the interceptor after throw an exception", function() {
	
		provider.mapTo('AfterThrowingTestEvent').asSequence().add('com.test1.Command1');

		dispatch({event:'AfterThrowingTestEvent'},function() {

			expect(interceptorExecuted).toBe(true);
			expect(commandExecuted).toBe(false);
		});
	});
});