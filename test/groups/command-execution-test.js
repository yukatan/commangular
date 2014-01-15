"use strict";

describe("Command execution testing", function() {

	var provider;
	var $injector;
		
	beforeEach(function() {

		commangular.reset();
		commangular.create('Command1', function() {

			return {

				execute: function($log) {

					$log.log('logging from commandObject');
				}
			};
		});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;

		});
		inject(function(_$injector_){

			$injector = _$injector_;
		});
	});

	it('provider should be defined', function() {

		expect(provider).toBeDefined();
	});

	it('injector should be defined', function() {

		expect($injector).toBeDefined();
	});

	//TODO: Use commangular mocks
	/*
	it('command should be executed', function() {

		provider.mapTo('TestEvent').asSequence().add('Command1');
		spyOn($injector, 'instantiate').andCallThrough();
		spyOn($injector, 'invoke').andCallThrough();
		dispatch({event:'TestEvent'},function(){

			expect($injector.instantiate).toHaveBeenCalled();
			expect($injector.invoke).toHaveBeenCalled();
		});
	});

	it('command.execute method should be called', function() {

		var command = {execute: function(){}};
		provider.mapTo('TestEvent').asSequence().add('Command1');
		spyOn($injector, 'instantiate').andReturn(command);
		spyOn(command, 'execute').andCallThrough();
		dispatch({event:'TestEvent'},function(){

			expect(command.execute).toHaveBeenCalled();
		});
	});*/
});