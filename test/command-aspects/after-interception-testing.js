describe("Aspect @After execution testing", function() {

	var provider;
	var scope;
	var interceptorExecutedAfter = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@After(/com\.test1.*/)', function(){

			return {

				execute : function () {

					interceptorExecutedAfter = true;
				}
			}
			
		});
		
		commangular.aspect('@After(/com\.test2.*/)', function(lastResult){
			
			return {

				execute : function() {

					expect(lastResult).toBeDefined();
					expect(lastResult).toBe('monkey');
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

		commangular.create('com.test2.Command2',function(){

			return {

				execute : function() {
										
					return "monkey";
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

	it("should execute the interceptor after the command", function() {
	
		var complete = false;
		provider.mapTo('AfterTestEvent').asSequence().add('com.test1.Command1');
		dispatch({event:'AfterTestEvent'},function(){

			expect(interceptorExecutedAfter).toBe(true);
			expect(commandExecuted).toBe(true);
		});
	});
});