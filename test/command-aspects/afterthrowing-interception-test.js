describe("@AfterThrowing interception test", function() {

	var provider;
	var scope;
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
		inject(function($rootScope) {
			scope = $rootScope;
		});
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {
	
		var complete = false;
		provider.mapTo('AroundTestEvent').asSequence().add('com.test1.Command1');

		runs(function() {

			scope.$apply(function(){

				scope.dispatch('AroundTestEvent').then(function(){

					
				},function() {

					complete = true;
				});
			});
		});

		waitsFor(function() {

			return complete;
		},500);
		
		runs(function() {

			expect(interceptorExecuted).toBe(true);
			expect(commandExecuted).toBe(false);
		});
	});

});