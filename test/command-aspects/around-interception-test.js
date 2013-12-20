describe("@Around execution testing", function() {

	var provider;
	var scope;
	var interceptorExecutedBefore = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Around(/com\.test1.*/)', function(processor){

			return {

				execute:function() {

					expect(commandExecuted).toBe(false)
					processor.invoke();
					expect(commandExecuted).toBe(true);
					interceptorExecutedBefore = true;
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

					complete = true;
				});
			});
		});

		waitsFor(function() {

			return complete;
		});
		
		runs(function() {

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecuted).toBe(true);
		});
	});

});