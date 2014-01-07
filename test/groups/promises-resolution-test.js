describe("Injection from preceding command whit promise result test", function() {

	var provider;
	var resultInjected;
	var $timeout;

	beforeEach(function() {
		
		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function($timeout, $q) {

					var deferred = $q.defer()
					$timeout(function() {
						deferred.resolve(25);
					}, 500);
					return deferred.promise;
				}
			};
		},{resultKey:'result1'});

		commangular.create('Command2', function($timeout) {

			return {

				execute: function(result1) {
										
					console.log('TRALALALA');
					resultInjected = result1;
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function(_$timeout_) {

			$timeout = _$timeout_;
		});
	});

	it('command should be executed and resultInjected has to be 25', function() {

		provider.mapTo('TestEvent').asSequence().add('Command1').add('Command2');
						
		dispatch({event:'TestEvent'},function(exc) {

			expect(resultInjected).toBe(25);
			/*expect(exc.resultKey('result1')).toBe(25);
			expect(exc.canceled()).toBe(false);
			expect(exc.commandExecuted('Command2')).toBe(true);*/
		});
		$timeout.flush();
	});


});