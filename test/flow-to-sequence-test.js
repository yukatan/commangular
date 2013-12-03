describe("Flow To Sequence execution testing", function() {

	var provider;
	var dispatcher;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	var command2Executed = false;
	var command3Executed = false;
	
	beforeEach(function() {
		
		command2Executed = false;
		commangular.commands = {};
		commangular.aspects = [];
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					return true;
				}
			};
		},{resultKey:'result1'});

		commangular.create('Command2', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					command2Executed = true;
				}
			};
		});

		commangular.create('Command3', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					command3Executed = true;
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

	it('command 2 and 3 should be executed', function() {
		
		var commandComplete = false;
		var sequence = provider.asSequence().add('Command2');
		provider.mapTo(eventName)
			.asSequence()
				.add('Command1')
				.add(provider.asFlow()
						.resultLink('result1',true).to(
							provider.asSequence()
								.add('Command2')
								.add('Command3')));
								
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
						
			expect(command2Executed).toBe(true);
			expect(command3Executed).toBe(true);
		})
	});

	


});