describe("Aspect execution testing", function() {

	var provider;
	var scope;
	var interceptorExecutedBefore = false;
	var commandExecutedAfter = false;

	beforeEach(function() {

		commangular.commands = {};
		commangular.aspects = [];
		
		commangular.aspect('@Before(/com.test1/)', function(){

			interceptorExecutedBefore = true;
		});
		
		commangular.aspect('@Before(/com.test2/)', function(processor){
			
			expect(processor.getData('username')).toBe('userName');
			expect(processor.getData('password')).toBe('fuckingpassword');
			processor.setData('username','monkey');
			processor.setData('password','password');
		});

		commangular.aspect('@Before(/com.test3/)', function(processor){
			
			processor.cancel();
		});

		commangular.create('com.test1.Command1',function(){

			return {

				execute : function() {
										
					if(interceptorExecutedBefore) {
						
						commandExecutedAfter = true;
					}
				}
			};
		});

		commangular.create('com.test2.Command2',function(username,password){

			return {

				execute : function() {
										
					expect(username).toBe('monkey');
					expect(password).toBe('password');
				}
			};
		});

		commangular.create('com.test3.Command3',function(){

			return {

				execute : function() {
										
					expect(false).toBe(true); // this shouldn't be executed
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

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {
	
		var complete = false;
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test1.Command1');

		runs(function() {

			scope.$apply(function(){

				scope.dispatch('BeforeTestEvent').then(function(){

					complete = true;
				});
			});
		});

		waitsFor(function() {

			return complete;
		});
		
		runs(function() {

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecutedAfter).toBe(true);

		});

	});
	
	it("The interceptor should update the data passed to the command", function() {
	
		var complete = false;
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test2.Command2');

		runs(function() {

			scope.$apply(function(){

				scope.dispatch('BeforeTestEvent',{username:'userName',password:'fuckingpassword'}).then(function(){

					complete = true;
				});
			});
		});

		waitsFor(function() {

			return complete;
		});
		
		runs(function() {

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecutedAfter).toBe(true);

		});

	});

	it("The command execution has to be canceled", function() {
	
		var complete = false;
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test3.Command3');
		
		scope.$apply(function(){

			scope.dispatch('BeforeTestEvent').then(function(){

				complete = true;
			});
		});

	});
});