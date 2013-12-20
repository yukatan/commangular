describe("Before event aspect execution testing", function() {

	var provider;
	var dispatcher;
	var scope;

	var beforeInterceptorExecuted = false;
	var beforeInterceptorExecuted2 = false;
	var beforeInterceptorExecuted3 = false;
	var commandExecuted = false;
	
	
	beforeEach(function() {

		commangular.reset();
		commangular.eventAspect('@Before(/TestEvent/)', function(){

			return {

				execute:function () {
					
					beforeInterceptorExecuted = true;
				}
			}
			
		});
		commangular.eventAspect('@Before(/TestEvent[0-9]/)', function(){

			return {

				execute : function() {

					beforeInterceptorExecuted2 = true;
				}
			}
		},1);

		commangular.eventAspect('@Before(/TestEvent2/)', function(){

			return {

				execute : function() {

					expect(beforeInterceptorExecuted2).toBe(true);
					beforeInterceptorExecuted3 = true;
				}
			}
		},2);

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
					
					expect(beforeInterceptorExecuted2).toBe(true);
					expect(beforeInterceptorExecuted3).toBe(true);
					commandExecuted = true;
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
		},'Command has to complete its  execution',1000);

		runs(function() {

			expect(commandExecuted).toBe(true);
			expect(beforeInterceptorExecuted).toBe(true);
		});



	});

	it("should execute the interceptors before the command", function() {
		
		var complete = false;
		
		runs(function() {

			scope.$apply(function () {

					dispatcher.dispatch('TestEvent2').then(function(){
					complete = true;
				});
			});
		});

		waitsFor(function () {

			return complete;
		},'Command has to complete its  execution',1000);

		runs(function() {

			expect(commandExecuted).toBe(true);
			expect(beforeInterceptorExecuted2).toBe(true);
			expect(beforeInterceptorExecuted3).toBe(true);
		});



	});

});