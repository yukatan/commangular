describe("Aspect execution testing", function() {

	var provider;
	var scope;
	var interceptorExecuted = false;
	var afterThrowingExecuted = false;
	var onErrorExecuted = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		

		commangular.aspect('@AfterThrowing(/com\.test1.*/)', function(){

			return {

				execute : function() {

					afterThrowingExecuted = true;
				}
			}
			
		});

		commangular.aspect('@Before(/com\.test1.*/)', function(processor){

			return {

				execute : function() {

					processor.cancel('Canceling');
					interceptorExecuted = true;
				}
			}
			
		});
			

		commangular.command('com.test1.Command1',function(){

			return {

				execute : function() {
										
						commandExecuted = true;
					
				},
				onError : function() {

					onErrorExecuted = true;
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

			expect(interceptorExecuted).toBe(true);
			expect(commandExecuted).toBe(false);
			expect(afterThrowingExecuted).toBe(false);

		});

	});
	
});