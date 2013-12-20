describe("Multiple @Before execution testing", function() {

	var provider;
	var scope;
	var interceptor1Executed = false;
	var interceptor2Executed = false;
	var commandExecutedAfter = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Before(/com\.test1.*/)', function(){

			return {

				execute : function() {
							
					interceptor1Executed = true;
				}
			}
			
		},1);
		
		commangular.aspect('@Before(/com\.test1.*/)', function(processor){
			
			return {

				execute : function() {
									
					expect(interceptor1Executed).toBe(true);
					interceptor2Executed = true;
				}
			}
			
		},2);

		
		commangular.create('com.test1.Command1',function(){

			return {

				execute : function() {
										
					expect(interceptor1Executed).toBe(true);
					expect(interceptor2Executed).toBe(true);
					commandExecutedAfter = true;
					
				}
			};
		});

		commangular.create('com.test2.Command2',function(){

			return {

				execute : function() {
										
					expect(interceptor1Executed).toBe(true);
					expect(interceptor2Executed).toBe(true);
					expect(commandExecutedAfter).toBe(true);

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
	
		var complete = false;
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test1.Command1').add('com.test2.Command2');

		runs(function() {

			scope.$apply(function(){

				scope.dispatch('BeforeTestEvent').then(function(){

					complete = true;
				});
			});
		});

		waitsFor(function() {

			return complete;
		},500);
		
		runs(function() {

			expect(interceptor1Executed).toBe(true);
			expect(interceptor2Executed).toBe(true);
			expect(commandExecutedAfter).toBe(true);

		});

	});
	
	
});