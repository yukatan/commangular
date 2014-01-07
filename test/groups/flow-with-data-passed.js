describe("Command Flow With Data passed test", function() {

	var provider;
	var eventName = 'TestEvent';
	var endValue = 0;
	
	beforeEach(function() {
		
		command2Executed = false;
		commangular.reset();
		
		commangular.create('Command1', function() {

			return {

				execute: function() {
					
					endValue = 1;
				}
			};
		});

		commangular.create('Command2', function() {

			return {

				execute: function() {
					
					endValue = 2;
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

	it('endValue should be 1', function() {
		
		provider.mapTo(eventName)
			.asFlow()
				.link('data1 == 2').to('Command1')
				.link('data1 == 3').to('Command2');
		
		dispatch({event:eventName,data:{data1:2}},function(){

			expect(endValue).toBe(1);
		});		
	});

	it('endValue should be 3', function() {
		
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
				.link('data1 == 2').to('Command1')
				.link('data1 == 3').to('Command2');
				
		dispatch({event:eventName,data:{data1:3}},function(){

			expect(endValue).toBe(2);
		});		
	});
});