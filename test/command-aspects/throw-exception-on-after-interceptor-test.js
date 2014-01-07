describe("Throw exception on after interception testing", function() {

	var provider;
	var interceptorExecutedBefore = false;
	var afterThrowingExecuted = false;
	var commandExecutedBefore = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@After(/com\.test1.*/)', function(){

			return {

				execute : function() {

					throw new Error('This is an error');
					interceptorExecutedBefore = true;
				}
			}
			
		});

		commangular.aspect('@AfterThrowing(/com\.test1.*/)', function(){

			return {

				execute : function() {

					console.log('Mandril!!')
					afterThrowingExecuted = true;
				}
			}
			
		});
			

		commangular.create('com.test1.Command1',function(){

			return {

				execute : function() {
																
					commandExecutedBefore = true;
					
				}
			};
		});
	
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {
			provider = $commangularProvider;
		});
		inject(function($rootScope) {
			scope = $rootScope;
		});
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {
	
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test1.Command1');
		dispatch({event:'BeforeTestEvent'},function(){

			expect(interceptorExecutedBefore).toBe(false);
			expect(commandExecutedBefore).toBe(true);
			expect(afterThrowingExecuted).toBe(true);
		});
	});
});