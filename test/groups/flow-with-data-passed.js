describe("Command Flow With Data passed test", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var endValue = 0;
	
	beforeEach(function() {
		
		command2Executed = false;
		commangular.reset();
		
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					endValue = 1;
				}
			};
		});

		commangular.create('Command2', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					endValue = 2;
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

	it('endValue should be 1', function() {
		
		var commandComplete = false;
		
		provider.mapTo(eventName)
			.asFlow()
				.resultLink('data1',2).to('Command1')
				.resultLink('data1',3).to('Command2');
				
	
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName,{data1:2}).then(function(){
					
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {

			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {
						
			expect(endValue).toBe(1);
			
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
			.asFlow()
				.resultLink('data1',2).to('Command1')
				.resultLink('data1',3).to('Command2');
				
	
		runs(function() {

			scope.$apply(function() {

				dispatcher.dispatch(eventName,{data1:3}).then(function(){
					
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

	


});