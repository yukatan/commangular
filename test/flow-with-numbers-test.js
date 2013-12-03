describe("Command Flow With Numbers execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var endValue = 0;
	
	beforeEach(function() {
		
		command2Executed = false;
		commangular.commands = {};
		commangular.aspects = [];
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					return 2;
				}
			};
		},{resultKey:'result1'});

		commangular.create('Command2', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					endValue = 2;
				}
			};
		});

		commangular.create('Command3', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					endValue = 3;
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

	it('endValue should be 2', function() {
		
		var commandComplete = false;
		
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					return 2;
				}
			};
		},{resultKey:'result1'});

		provider.mapTo(eventName)
			.asSequence()
				.add('Command1')
				.add(provider.asFlow()
					.resultLink('result1',2).to('Command2')
					.resultLink('result1',3).to('Command3'));
				
	
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
						
			expect(endValue).toBe(2);
			
		})
	});

	it('endValue should be 3', function() {
		
		var commandComplete = false;
		
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					return 3;
				}
			};
		},{resultKey:'result1'});

		provider.mapTo(eventName)
			.asSequence()
				.add('Command1')
				.add(provider.asFlow()
					.resultLink('lastResult',2).to('Command2')
					.resultLink('lastResult',3).to('Command3'));
	
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
						
			expect(endValue).toBe(3);
			
		})
	});

	


});