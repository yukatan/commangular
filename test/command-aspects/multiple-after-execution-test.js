describe("Multiple After execution testing", function() {

	var provider;
	var interceptor1Executed = false;
	var interceptor2Executed = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@After(/com\.test1.*/)', function(){

			return {

				execute : function () {

					expect(commandExecuted).toBe(true);
					interceptor1Executed = true;
				}
			}
			
		},1);
		
		commangular.aspect('@After(/com\.test1.*/)', function(lastResult){
			
			return {

				execute : function() {

					expect(interceptor1Executed).toBe(true);;
					expect(lastResult).toBe(50);
					interceptor2Executed = true;
				}
			}
			
		},2);

		commangular.create('com.test1.Command1',function(){

			return {

				execute : function() {
										
						commandExecuted = true;
						return 50;
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

			expect(interceptor1Executed).toBe(true);
			expect(commandExecuted).toBe(true);
		});
	});
});