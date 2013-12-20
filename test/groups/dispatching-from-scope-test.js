describe("Dispatching from scope testing", function() {

	var provider;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	
	beforeEach(function() {
		
		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
				}
			};
		});
		commangular.create('Command2', function() {

			return {

				execute: function($log) {

					$log.log('logging');
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($rootScope, $injector) {
	
			scope = $rootScope;
			injector = $injector;
		});
	});

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
	});

	it('injector should be defined', function() {

		expect(injector).toBeDefined();
	});

	it('command should be executed', function() {

		var commandComplete = false;
		provider.mapTo(eventName).asSequence().add('Command1').add('Command2');
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				scope.dispatch(eventName).then(function(){
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {

			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {
			
			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
		})
	});

	it('command.execute method should be called twice', function() {

		var commandComplete = false;
		var command = {

			execute: function() {
				
			}
		};
		provider.mapTo(eventName).asSequence().add('Command1').add('Command2');
		spyOn(injector, 'instantiate').andReturn(command);
		spyOn(command, 'execute').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				scope.dispatch(eventName).then(function(){
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {

			return commandComplete

		}, 'The command should be executed', 1000)


		runs(function() {
			
			expect(command.execute).toHaveBeenCalled();
			expect(command.execute.callCount).toBe(2);
		})
	});
});