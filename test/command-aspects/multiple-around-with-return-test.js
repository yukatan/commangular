describe("Multiple @Around with return execution testing", function() {

	var provider;
	var scope;
	var timeout;
	var interceptor1Executed = false;
	var interceptor2Executed = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Around(/com\.test1\.Command1/)', function(processor){

			return {

				execute:function() {

					interceptor1Executed = true;
					expect(commandExecuted).toBe(false)
					expect(interceptor2Executed).toBe(false);
					var promise = processor.invoke().then(function(result){
						expect(result).toBe(25);
						expect(commandExecuted).toBe(true);
						expect(interceptor2Executed).toBe(true);
						return 10;
					});
					expect(commandExecuted).toBe(true)
					expect(interceptor2Executed).toBe(false);
					return promise;
				}
			}
			
		},1);

		commangular.aspect('@Around(/com\.test1\.Command1/)', function(processor,$timeout){

			return {

				execute:function() {

					expect(interceptor1Executed).toBe(true);
					expect(commandExecuted).toBe(false);
					return processor.invoke().then(function(result){

						expect(result).toBe(50);
						expect(commandExecuted).toBe(true);
						interceptor2Executed = true;
						return 25;
					});

					
				}
			}
			
		},2);
				

		commangular.create('com.test1.Command1',function($timeout){

			return {

				execute : function() {
										
						commandExecuted = true;
						return 50;
				}
			};
		},{resultKey:'result1'});

		commangular.create('com.test1.Command2',function(result1){

			return {

				execute : function() {
										
						expect(result1).toBe(10);
				}
			};
		});

		
		
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {
			provider = $commangularProvider;
		});
		inject(function($rootScope,$timeout) {
			scope = $rootScope;
			timeout = $timeout;
		});
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {
	
		var complete = false;
		provider.mapTo('AroundTestEvent').asSequence().add('com.test1.Command1').add('com.test1.Command2');

		runs(function() {

			scope.$apply(function(){

				scope.dispatch('AroundTestEvent').then(function(){

					complete = true;
				});
			});
		});

		waitsFor(function() {

			//timeout.flush();
			return complete;
		});
		
		runs(function() {

			expect(interceptor1Executed).toBe(true);
			expect(commandExecuted).toBe(true);
			expect(interceptor2Executed).toBe(true);
		});
	});

});