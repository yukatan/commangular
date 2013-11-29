describe("Aspect execution testing", function() {

	var provider;
	var scope;
	var interceptorExecutedAfter = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.commands = {};
		commangular.aspects = [];
		
		commangular.aspect('@After(/com.test1/)', function(){

			interceptorExecutedAfter = true;
		});
		
		commangular.aspect('@After(/com.test2/)', function(lastResult){
			
			expect(lastResult).toBeDefined();
			expect(lastResult).toBe('monkey');
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
				});
			});
		});

		waitsFor(function() {

			return complete;
		});
		
		runs(function() {

			expect(interceptorExecutedAfter).toBe(true);
			expect(commandExecuted).toBe(true);

		});

	});
	
	
	
});