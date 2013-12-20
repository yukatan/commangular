describe("Command execution testing", function() {

	var provider;
	var scope;
	var eventName = 'TestEvent';
	
	beforeEach(function() {

		commangular.reset();
		
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging from commandObject');
					return 45;
				}
			};
		},{resultKey:'resultKeyTest'});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;
			provider.mapTo(eventName).asSequence().add('Command1');

		});
		inject(function($rootScope) {

			scope = $rootScope;
		});
	});

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
	});
	

	it('Context data has to contain the result key', function() {

		var commandComplete = false;
		runs(function() {

			scope.$apply(function() {

				scope.dispatch(eventName).then(function(result){
					expect(result.resultKeyTest).toBe(45);
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {

			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {
			
			
		})
	});
	
});