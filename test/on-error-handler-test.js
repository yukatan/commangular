describe("On error handler test", function() {

	var provider;
	var scope;
	var eventName = 'TestEvent';
	var executeMethodExecuted = false;
	var onErrorMethodExecuted = false;
	
	beforeEach(function() {
		
		commangular.commands = {};
		commangular.aspects = [];
		commangular.create('Command1', function() {

			return {

				execute: function() {

					throw new Error("Test Error");
					executeMethodExecuted = true;
					return 25;
				},
				onError : function(error) {

					expect(executeMethodExecuted).toBe(false);
					expect(error.message).toEqual("Test Error");
					onErrorMethodExecuted = true;
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

				scope.dispatch(eventName).then(function(){},function(){
					commandComplete = true;
				});
			});

		});

		waitsFor(function() {

			return commandComplete;

		}, 'The command should be executed', 1000)


		runs(function() {
			
			expect(executeMethodExecuted).toBe(false);
			expect(onErrorMethodExecuted).toBe(true);
		})
	});

	
});