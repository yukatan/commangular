describe("Flow To Sequence execution testing", function() {

	var provider;
	var eventName = 'TestEvent';
	var command2Executed = false;
	var command3Executed = false;
	
	beforeEach(function() {
		
		command2Executed = false;
		commangular.reset();
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
		inject();
	});

	it('command 2 and 3 should be executed', function() {
		
		var commandComplete = false;
		var sequence = provider.asSequence().add('Command2');
		provider.mapTo(eventName)
			.asSequence()
				.add('Command1')
				.add(provider.asFlow()
						.link('result1 == true').to(
							provider.asSequence()
								.add('Command2')
								.add('Command3')));
								
		dispatch({event:eventName},function(){

			expect(command2Executed).toBe(true);
			expect(command3Executed).toBe(true);
		});		
	});
});