"use strict";

describe("Command execution testing", function() {

	var provider;
	var scope;
	var injector;
	var eventName = 'TestEvent';
	
	var injectedScope;
	var injectedInjector;
	var injectedLog;

	beforeEach(function() {

		commangular.reset();
		commangular.create('Command1', function($log, $rootScope) {

			injectedLog = $log;
			injectedScope = $rootScope;

			return {

				execute: function($injector) {

					injectedInjector = $injector;
				}
			};
		});
	});


	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function($rootScope, $injector) {
	
			scope = $rootScope;
			injector = $injector;
		});
	});

	it('injection should be working', function() {

		provider.mapTo(eventName).asSequence().add('Command1');
		dispatch({event:eventName},function() {

			expect(injectedInjector).toBeDefined();
			expect(injectedInjector).toEqual(injector);
			expect(injectedScope).toBeDefined();
			expect(injectedScope).toEqual(scope);
			expect(injectedLog).toBeDefined();
		});
	});
});