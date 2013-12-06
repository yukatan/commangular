describe("Custom resolver test", function() {

	var provider;
	var scope;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.commands = {};
		commangular.aspects = [];
		
		commangular.resolver('Command1', function(result){

			expect(result).toBe(50);
			return 75;
		});
		
		
		commangular.create('Command1',function(){

			return {

				execute : function() {
										
						commandExecuted = true;
						return 50;
				}
			};
		});

		commangular.create('Command2',function(lastResult){

			return {

				execute : function() {
										
					console.log('command2 executed');
					expect(lastResult).toBe(75)
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
		provider.mapTo('CustomResolverEvent').asSequence().add('Command1');

		runs(function() {

			scope.$apply(function(){

				scope.dispatch('CustomResolverEvent').then(function(){

					complete = true;
				});
			});
		});

		waitsFor(function() {

			return complete;
		});
		
		runs(function() {
			
			expect(commandExecuted).toBe(true);

		});

	});
	
	
	
});