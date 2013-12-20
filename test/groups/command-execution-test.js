describe("Command execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	
	beforeEach(function() {

		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging from commandObject');
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($commangular, $rootScope, $injector) {

			dispatcher = $commangular;
			scope = $rootScope;
			injector = $injector;
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

	it('command should be executed', function() {

		var commandComplete = false;
		provider.mapTo(eventName).asSequence().add('Command1');
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

			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {
			
			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
		})
	});

	it('command.execute method should be called', function() {

		var commandComplete = false;
		var command = {

			execute: function() {
							
			}
		};

		provider.mapTo(eventName).asSequence().add('Command1');
		spyOn(injector, 'instantiate').andReturn(command);
		spyOn(command, 'execute').andCallThrough();
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName).then(function(){
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {

			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {
			
			expect(command.execute).toHaveBeenCalled();
		})
	});
});