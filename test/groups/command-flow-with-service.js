describe("Command Flow link to service execution testing", function() {

	var provider;
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
		inject(function($injector) {

			injector = $injector;
		});
	});

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
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
				.link("UserDomainModel.username == 'monkey'",'UserDomainModel').to('Command2'));
			

		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		dispatch({event:eventName},function() {

			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(command2Executed).toBe(true);
		});
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
		provider.mapTo(eventName)
			.asSequence()
				.add('Command1')
				.add(provider.asFlow()
					.link("UserDomainModel.username == 'notMonkey'",'UserDomainModel').to('Command2'));
			

		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		dispatch({event:eventName},function() {

			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
			expect(command2Executed).toBe(false);
		})
	});
});