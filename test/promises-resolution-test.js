describe("Injection from preceding command whit promise result test", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var resultInjected;
	var timeout;

	beforeEach(function() {
		
		commangular.functions = {};
		commangular.create('Command1', function() {

			return {

				execute: function($log, $timeout, $q) {

					var deferred = $q.defer()
					$timeout(function() {
						deferred.resolve(25);
					}, 500);
					$log.log('logging');
					return deferred.promise;
				}
			};
		},{resultKey:'result1'});
		commangular.create('Command2', function() {

			return {

				execute: function(result1, $log) {

					$log.log(result1);
					resultInjected = result1;
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($commangular, $rootScope, $injector, $timeout) {

			dispatcher = $commangular;
			scope = $rootScope;
			injector = $injector;
			timeout = $timeout
		});
	});

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
	});

	it('dispatcher should be defined', function() {

		expect(dispatcher).toBeDefined();
	});

	it('injector should be defined', function() {

		expect(injector).toBeDefined();
	});

	it('command should be executed and resultInjected has to be 25', function() {

		var commandComplete = false;
		provider.mapTo(eventName).asSequence().add('Command1').add('Command2');
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName).then(function(){
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {
			
			timeout.flush();
			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {

			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(resultInjected).toBe(25)
		})
	});


});