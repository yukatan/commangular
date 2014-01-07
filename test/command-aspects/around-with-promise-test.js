describe("@Around with promise testing", function() {

	var provider;
	var scope;
	var timeout;
	var interceptorExecutedBefore = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Around(/com\.test1.*/)', function(processor){

			return {

				execute:function() {

					expect(commandExecuted).toBe(false)
					var promise = processor.invoke().then(function(){
						expect(commandExecuted).toBe(true);
						interceptorExecutedBefore = true;
					});
					expect(commandExecuted).toBe(false);
					return promise;
				}
			}
		});
				

		commangular.create('com.test1.Command1',function($q,$timeout){

			return {

				execute : function() {
									
					var deferred = $q.defer();
					$timeout(function(){
						commandExecuted = true;
						deferred.resolve("Resolved");
					},1000);
					return deferred.promise;
				}
			};
		});

		
		
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {
			provider = $commangularProvider;
		});
		inject(function($timeout) {
			timeout = $timeout;
		});
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor around the command and works with promises", function() {
	
		provider.mapTo('AroundTestEvent').asSequence().add('com.test1.Command1');
		dispatch({event:'AroundTestEvent'},function() {

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecuted).toBe(true);
		});
		timeout.flush();
	});
});