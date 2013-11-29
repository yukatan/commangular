describe("Aspect execution testing", function() {

	var provider;
	var dispatcher;
	var scope;

	var interceptorExecutedBefore = false;
	var commandExecutedAfter = false;
	var afterInterceptorExecutedAfterCommand = false;
	var afterThrowingInterceptorExecutedAfterCommand = false;
	beforeEach(function() {

		commangular.commands = {};
		commangular.aspects = [];
		commangular.aspect('@Before(/Command(.*)/)', function(){

			interceptorExecutedBefore = true;
		});
		commangular.aspect('@After(/Command(.*)/)', function(){

			if(commandExecutedAfter)
				afterInterceptorExecutedAfterCommand = true;
		});

		commangular.aspect('@AfterThrowing(/Command(.*)/)', function(){

			if(commandExecutedAfter)
				afterThrowingInterceptorExecutedAfterCommand = true;
		});

		commangular.aspect('@Around(/Command(.*)/)', function(processor){

			
			var result = processor.invoke();
			return "Return from around 1";
		});

		commangular.aspect('@Around(/Command(.*)/)', function(processor){

			var result = processor.invoke();
			return result;
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
					
					throw new Error("This is an error");
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;
		});
		inject(function($commangular,$rootScope) {

			dispatcher = $commangular;
			scope = $rootScope;
		});
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		var complete = false;
		
		runs(function() {

			scope.$apply(function () {

					dispatcher.dispatch('AspectTestEvent').then(function() {
					complete = true;
				});
			});
		});

		waitsFor(function () {

			return complete;
		},'The interceptor should be executed and then the command',1000);

		runs(function() {

			expect(commandExecutedAfter).toBe(true);
			expect(interceptorExecutedBefore).toBe(true);
		});



	});

	it("should execute the interceptor after the command", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		var complete = false;
		
		runs(function() {

			scope.$apply(function () {

					dispatcher.dispatch('AspectTestEvent').then(function() {
					complete = true;
				});
			});
		});

		waitsFor(function () {

			return complete;
		},'The interceptor should be executed and then the command',1000);

		runs(function() {

			expect(commandExecutedAfter).toBe(true);
			expect(interceptorExecutedBefore).toBe(true);
			expect(afterInterceptorExecutedAfterCommand).toBe(true);

		});



	});

	it("should execute the interceptor after throwing an exception", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command2');
		var complete = false;
		
		runs(function() {

			scope.$apply(function () {

					dispatcher.dispatch('AspectTestEvent').then(function() {},function(){

						complete = true;
				});
			});
		});

		waitsFor(function () {

			return complete;
		},'The interceptor should be executed and then the command',1000);

		runs(function() {

			expect(afterThrowingInterceptorExecutedAfterCommand).toBe(true);
		});



	});

	it("should execute the interceptor Around ", function() {

		provider.mapTo('AspectTestEvent').asSequence().add('Command1');
		var complete = false;
		
		runs(function() {

			scope.$apply(function () {

					dispatcher.dispatch('AspectTestEvent').then(function() {

						complete = true;
					});

						
				});
			});
		
		waitsFor(function () {

			return complete;
		},'The interceptor should be executed and then the command',1000);

		runs(function() {

			//expect(afterThrowingInterceptorExecutedAfterCommand).toBe(true);
		});



	});

	

	
});