describe("Passing data to commands test", function() {

	var provider;
	var eventName = 'TestEvent';
	var plusResultValue;
	var minusResultValue

	beforeEach(function() {

		commangular.reset();
		commangular.create('Command1', function(data1,data2) {

			return {

				execute: function() {

					plusResultValue = data1 + data2;
				}
			};
		});
		commangular.create('Command2', function(data2,data1) {

			return {

				execute: function() {

					minusResultValue = data2 - data1;
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

	it('calculation has to be 12 and 2', function() {

		provider.mapTo(eventName).asSequence().add('Command1').add('Command2');
		dispatch({event:eventName,data:{data1:5,data2:7}},function(){

			expect(plusResultValue).toBe(12);
			expect(minusResultValue).toBe(2);
		});
	});

	
});