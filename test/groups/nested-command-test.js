"use strict";

describe("Command parallel and sequence nested execution testing", function() {

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
		commangular.create('Command3', function() {

			return {

				execute: function($log) {

					$log.log('logging');
				}
			};
		});
		commangular.create('Command4', function() {

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

	it('command parallel nested should be executed', function() {

		var parallel = provider.asParallel().add('Command3').add('Command4');
		provider.mapTo(eventName).asSequence().add('Command1').add('Command2').add(parallel);
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		dispatch({event:eventName},function() {

			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
		});
	});

	it('command sequence nested should be executed', function() {

		var sequence = provider.asSequence().add('Command3').add('Command4');
		provider.mapTo(eventName).asSequence().add('Command1').add('Command2').add(sequence);
		spyOn(injector, 'instantiate').andCallThrough();
		spyOn(injector, 'invoke').andCallThrough();
		dispatch({event:eventName},function() {

			expect(injector.instantiate).toHaveBeenCalled();
			expect(injector.invoke).toHaveBeenCalled();
		});
	});

	it('command.execute method should be called four times', function() {

		var parallel = provider.asParallel().add('Command3').add('Command4');
		var command = {

			execute: function() {
				
			}
		};
		provider.mapTo(eventName).asSequence().add('Command1').add('Command2').add(parallel);
		spyOn(injector, 'instantiate').andReturn(command);
		spyOn(command, 'execute').andCallThrough();
		
		dispatch({event:eventName},function() {

			expect(command.execute).toHaveBeenCalled();
			expect(command.execute.callCount).toBe(4);
		});
	});
	
	it('command.execute method should be called four times', function() {

		var sequence = provider.asParallel().add('Command3').add('Command4');
		var command = {

			execute: function() {
				
			}
		};
		provider.mapTo(eventName).asSequence().add('Command1').add('Command2').add(sequence);
		spyOn(injector, 'instantiate').andReturn(command);
		spyOn(command, 'execute').andCallThrough();
		
		dispatch({event:eventName},function() {

			expect(command.execute).toHaveBeenCalled();
			expect(command.execute.callCount).toBe(4);
		});
	});
});