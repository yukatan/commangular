describe("Aspect execution testing", function() {

	var provider;
	
	var interceptorExecutedBefore = false;
	var commandExecutedAfter = false;
	var afterInterceptorExecutedAfterCommand = false;
	var afterThrowingInterceptorExecutedAfterCommand = false;
	
	beforeEach(function() {

		commangular.reset();
		commangular.aspect('@Before(/Command[1-9]/)', function(){

			return {

				execute:function () {
					
					interceptorExecutedBefore = true;
				}
			}
			
		});
		commangular.aspect('@After(/Command[1-9]/)', function(){

			return {

				execute : function() {

					if(commandExecutedAfter)
						afterInterceptorExecutedAfterCommand = true;
				}
			}
		});

		commangular.aspect('@AfterThrowing(/Command[1-9]/)', function(){

			return {

				execute : function() {

					console.log('After throwing running');
					afterThrowingInterceptorExecutedAfterCommand = true;
				}
			}
		});

		commangular.aspect('@Around(/Command[1-9]/)', function(processor){

			return {

				execute : function() {

					var result = processor.invoke();
					return "Return from around 1";
				}
			}
		});

		commangular.aspect('@Around(/Command[1-9]/)', function(processor){

			
			return {

				execute : function() {

					var result = processor.invoke();
					return result;
				}
			}
		});

		commangular.create('Command1',function(){

			return {

				execute : function() {
					
					if(interceptorExecutedBefore) {
						commandExecutedAfter = true;
					}
					return "return From command1";
				}
			};
		});

		commangular.create('Command2',function(){

			return {

				execute : function() {
					
					console.log('Command running');
					throw new Error("This is an error");
				}
			};
		});

		commangular.create('Command3',function(){

			return {

				execute : function() {
					
					console.log('Command running');
					throw new Error("This is an error");
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;
		});
		inject();
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		dispatch({event:'AspectTestEvent'},function() {

			expect(commandExecutedAfter).toBe(true);
			expect(interceptorExecutedBefore).toBe(true);
		});		
	});

	it("should execute the interceptor after the command", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		dispatch({event:'AspectTestEvent'},function() {

			expect(commandExecutedAfter).toBe(true);
			expect(interceptorExecutedBefore).toBe(true);
			expect(afterInterceptorExecutedAfterCommand).toBe(true);
		});				
	});

	it("should execute the interceptor after throwing an exception", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command2');
		dispatch({event:'AspectTestEvent'},function() {

			expect(afterThrowingInterceptorExecutedAfterCommand).toBe(true);
		});		
	});

	it("should execute the interceptor Around ", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		dispatch({event:'AspectTestEvent'},function() {

			expect(afterThrowingInterceptorExecutedAfterCommand).toBe(true);
		});				
	});
});