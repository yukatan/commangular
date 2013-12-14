describe("On result handler test", function() {

	var provider;
	var scope;
	var eventName = 'TestEvent';
	var executeMethodExecuted = false;
	var onResultMethodExecuted = false;
	
	beforeEach(function() {
		
		commangular.commands = {};
		commangular.aspects = [];
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging');
					executeMethodExecuted = true;
					return 25;
				},
				onResult : function(result) {

					expect(result).toBe(25);
					onResultMethodExecuted = true;

				}
			};
		});
		
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($rootScope) {

			scope = $rootScope;
		});
	});

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
	});

	it('command should be executed', function() {

		var commandComplete = false;
		provider.mapTo(eventName).asSequence().add('Command1');
		runs(function() {

			scope.$apply(function() {

				scope.dispatch(eventName).then(function(){
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {

			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {
			
			expect(executeMethodExecuted).toBe(true);
			expect(onResultMethodExecuted).toBe(true);
		})
	});

	
});