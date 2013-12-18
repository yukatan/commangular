describe("Throw exception on before interceptor testing", function() {

	var provider;
	var scope;
	var interceptorExecutedBefore = false;
	var afterThrowingExecuted = false;
	var commandExecutedAfter = false;

	beforeEach(function() {

		commangular.commands = {};
		commangular.aspects = [];
		
		commangular.aspect('@Before(/com.test1/)', function(){

			return {

				execute : function() {

					throw new Error('This is an error');
					interceptorExecutedBefore = true;
				}
			}
			
		});

		commangular.aspect('@AfterThrowing(/com.test1/)', function(){

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
		inject(function($rootScope) {
			scope = $rootScope;
		});
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {
	
		var complete = false;
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test1.Command1');

		runs(function() {

			scope.$apply(function(){

				scope.dispatch('BeforeTestEvent').then(function(){

					complete = true;
				},function(){complete=true});
			});
		});

		waitsFor(function() {

			return complete;
		});
		
		runs(function() {

			expect(interceptorExecutedBefore).toBe(false);
			expect(commandExecutedAfter).toBe(false);
			expect(afterThrowingExecuted).toBe(true);

		});

	});
	
});