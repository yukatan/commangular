describe("Multiple @Around execution testing", function() {

	var provider;
	var scope;
	var interceptor1Executed = false;
	var interceptor2Executed = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.commands = {};
		commangular.aspects = [];
		
		commangular.aspect('@Around(/com.test1/)', function(processor){

			return {

				execute:function() {

					interceptor1Executed = true;
					expect(commandExecuted).toBe(false)
					expect(interceptor2Executed).toBe(false);
					processor.invoke();
					expect(commandExecuted).toBe(true);
					expect(interceptor2Executed).toBe(true);
					
				}
			}
			
		},1);

		commangular.aspect('@Around(/com.test1/)', function(processor){

			return {

				execute:function() {

					expect(interceptor1Executed).toBe(true);
					expect(commandExecuted).toBe(false);
					processor.invoke();
					expect(commandExecuted).toBe(true);
					interceptor2Executed = true;
				}
			}
			
		},2);
				

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

			expect(interceptor1Executed).toBe(true);
			expect(commandExecuted).toBe(true);
			expect(interceptor2Executed).toBe(true);
		});
	});

});