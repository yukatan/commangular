"use strict";

describe("Testing decorator", function() {
	
	var $timeout = null;
	var provider;

	beforeEach(function() {
		
		commangular.reset();

		commangular.command('Command1',function(lastResult,$timeout){

			return {

				execute: function() {
					
					return $timeout(function(){
						
						return lastResult;
					},2000);
				}
			};

		},{resultKey:'mandril'});

	});


	beforeEach(function() {
		
		module('commangular', function($commangularProvider) {
			provider = $commangularProvider;
		});
		inject(function(_$timeout_){

			$timeout = _$timeout_;
		});

	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	it("provider should be defined", function() {
		
		dispatch({command:'Command1',data:{lastResult:35}},function(exc){

			/*expect(exc.dataPassed('lastResult')).toBe(35);
			expect(exc.canceled()).toBeFalsy();
			expect(exc.resultKey('mandril')).toBe(35);*/
		});
		$timeout.flush();
	});
	
});