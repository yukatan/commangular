describe("@Around with promise testing", function() {

	var provider;
	var scope;
	var timeout;
	var interceptorExecutedBefore = false;
	var commandExecuted = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Around(/com\.test1.*/)', function(processor,data){

			return {

				execute:function() {

					expect(data).toBe('monkey');
					processor.setData('data','updatedMonkey');
					expect(commandExecuted).toBe(false)
					processor.invoke().then(function(){
						expect(commandExecuted).toBe(true);
						interceptorExecutedBefore = true;
					});
					expect(commandExecuted).toBe(false);
				}
			}
			
			
		});
				

		commangular.create('com.test1.Command1',function($q,$timeout,data){

			return {

				execute : function() {
									
					expect(data).toBe('updatedMonkey');
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
		provider.mapTo('AroundTestEvent').asSequence().add('com.test1.Command1');

		runs(function() {

			scope.$apply(function(){

				scope.dispatch('AroundTestEvent',{data:'monkey'}).then(function(){

					complete = true;
				});
			});
		});

		waitsFor(function() {

			timeout.flush();
			return complete;
		});
		
		runs(function() {

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecuted).toBe(true);
		});
	});

});