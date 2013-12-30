describe("Command Flow execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var command2Executed = false;
	
	beforeEach(function() {
		
		command2Executed = false;
		commangular.reset();
		commangular.create('Command2', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					command2Executed = true;
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

	it('command 2 should be executed', function() {

		
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					return true;
				}
			};
		},{resultKey:'result1'});


		var commandComplete = false;
		provider.mapTo(eventName).asSequence()
			.add('Command1')
			.add(provider.asFlow()
				.link('result1 == true').to('Command2'));
			

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
			expect(command2Executed).toBe(true);
		})
	});

	it('command 2 should not be executed', function() {

		
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					return false;
				}
			};
		},{resultKey:'result1'});


		var commandComplete = false;
		provider.mapTo(eventName).asSequence()
			.add('Command1')
			.add(provider.asFlow()
				.link('result1 == true').to('Command2'));
			

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
			expect(command2Executed).toBe(false);
		})
	});


});