"use strict";

describe("@Around with promise testing", function() {

	var provider;
	var $timeout;
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
					var promise = processor.invoke();
					interceptorExecutedBefore = true;
					expect(commandExecuted).toBe(false);
					return promise;
				}
			}
			
			
		});
				

		commangular.create('com.test1.Command1',function($q,$timeout,data){

			return {

				execute : function() {
									
					expect(data).toBe('updatedMonkey');
					return $timeout(function(){
						commandExecuted = true;
					},2000);
					
				}
			};
		});

		
		
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {
			provider = $commangularProvider;
		});
		inject(function(_$timeout_) {
			
			$timeout = _$timeout_;
		});
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor around the command and change some data with the processor", function() {
	
		provider.mapTo('AroundTestEvent').asSequence().add('com.test1.Command1');
		dispatch({event:'AroundTestEvent',data:{data:'monkey'}},function() {

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecuted).toBe(true);
		});
		$timeout.flush();
	});

});