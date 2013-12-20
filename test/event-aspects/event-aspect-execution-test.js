describe("EventAspect execution testing", function() {

	var provider;
	var dispatcher;
	var scope;

	var beforeInterceptorExecuted = false;
	var commandExecuted = false;
	var afterInterceptorExecuted = false;
	var afterThrowingInterceptorExecuted = false;
	
	beforeEach(function() {

		commangular.reset();
		commangular.eventAspect('@Before(/TestEvent/)', function(){

			return {

				execute:function () {
					
					beforeInterceptorExecuted = true;
				}
			}
			
		});
		commangular.eventAspect('@After(/TestEvent/)', function(){

			return {

				execute : function() {

					expect(beforeInterceptorExecuted).toBe(true);
					expect(commandExecuted).toBe(true);
					afterInterceptorExecuted = true;
				}
			}
		});

		commangular.eventAspect('@AfterThrowing(/TestEvent2/)', function(){

			return {

				execute : function() {

					afterThrowingInterceptorExecuted = true;
				}
			}
		});

		commangular.create('Command1',function(){

			return {

				execute : function() {
					
					expect(beforeInterceptorExecuted).toBe(true);
					commandExecuted = true;
				}
			};
		});

		commangular.create('Command2',function(){

			return {

				execute : function() {
					
					throw new Error('Event aspect Error');
				}
			};
		});
		
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;
			provider.mapTo('TestEvent').asSequence().add('Command1');
			provider.mapTo('TestEvent2').asSequence().add('Command2');
		});
		inject(function($commangular,$rootScope) {

			dispatcher = $commangular;
			scope = $rootScope;
		});
	});

	it("provider should be defined", function() {	var afterThrowingInterceptorExecuted = false;


		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {
		
		var complete = false;
		
		runs(function() {

			scope.$apply(function () {

					dispatcher.dispatch('TestEvent').then(function() {
					complete = true;
				});
			});
		});

		waitsFor(function () {

			return complete;
		},'The interceptor should be executed and then the command',1000);

		runs(function() {

			expect(commandExecuted).toBe(true);
			expect(beforeInterceptorExecuted).toBe(true);
			expect(afterInterceptorExecuted).toBe(true);
		});



	});

	it("should execute the interceptor before the command", function() {
		
		var complete = false;
		
		runs(function() {

			scope.$apply(function () {

					dispatcher.dispatch('TestEvent2').then(function() {},function(){
					complete = true;
				});
			});
		});

		waitsFor(function () {

			return complete;
		},'The interceptor should be executed and then the command',1000);

		runs(function() {

			expect(afterThrowingInterceptorExecuted).toBe(true);
		});



	});

});