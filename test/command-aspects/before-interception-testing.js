"use strict";

describe("Before interception testing", function() {

	var provider;
	var interceptorExecutedBefore = false;
	var commandExecutedAfter = false;

	beforeEach(function() {

		commangular.reset();
		
		commangular.aspect('@Before(/com\.test1.*/)', function(){

			return {

				execute : function() {

					interceptorExecutedBefore = true;
				}
			}
			
		});
		
		commangular.aspect('@Before(/com\.test2.*/)', function(processor){
			
			return {

				execute : function() {

					expect(processor.getData('username')).toBe('userName');
					expect(processor.getData('password')).toBe('fuckingpassword');
					processor.setData('username','monkey');
					processor.setData('password','password');
				}
			}
			
		});

		commangular.aspect('@Before(/com\.test3.*/)', function(processor){
			
			return {

				execute:function() {
					
					processor.cancel();
				}
			}
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
		inject();
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("should execute the interceptor before the command", function() {
	
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test1.Command1');
		dispatch({event:'BeforeTestEvent'},function(){

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecutedAfter).toBe(true);
		});
	});
	
	it("The interceptor should update the data passed to the command", function() {
	
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test2.Command2');
		dispatch({event:'BeforeTestEvent',data:{username:'userName',password:'fuckingpassword'}},function(){

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecutedAfter).toBe(true);
		});
	});

	it("The command execution has to be canceled", function() {
	
		var complete = false;
		provider.mapTo('BeforeTestEvent').asSequence().add('com.test3.Command3');
		dispatch({event:'BeforeTestEvent'},function(){

			expect(interceptorExecutedBefore).toBe(true);
			expect(commandExecutedAfter).toBe(true);
		});
	});
});