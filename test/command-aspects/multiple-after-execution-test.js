describe("Multiple After execution testing", function() {

	var provider;
	var scope;
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

			expect(interceptor1Executed).toBe(true);
			expect(commandExecuted).toBe(true);

		});

	});
	
	
	
});