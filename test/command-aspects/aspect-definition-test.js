"use strict";

describe("Aspect definition testing", function() {

	var provider;
	function aspectTest(){};
	
	beforeEach(function() {

		commangular.reset();
		commangular.aspect('@Before(/com\.services.*/)', aspectTest);
		commangular.aspect('@AfterExecution(/.*Command3.*/)', aspectTest);
		commangular.aspect('@AfterThrowing(/com\.services.*/)', aspectTest);
		commangular.aspect('@Around(/.*Command3.*/)', aspectTest);
		commangular.create('com.services.Command3',function(){});
	});

	beforeEach(function() {

		module('commangular', function($commangularProvider) {

			provider = $commangularProvider;
		});
		inject(function() {});
	});

	it("provider should be defined", function() {

		expect(provider).toBeDefined();
	});

	//TODO: Use commangular mocks
	/*it("should create the interceptor Before on com.services.Command3", function() {

		expect(commangular.commands['com.services.Command3'].interceptors).toBeDefined();
		expect(commangular.commands['com.services.Command3'].interceptors['Before']).toBeDefined();
		expect(commangular.commands['com.services.Command3'].interceptors['Before'][0].func).toEqual(aspectTest);
	});

	it("should create the interceptor After on com.services.Command3", function() {

		expect(commangular.commands['com.services.Command3'].interceptors).toBeDefined();
		expect(commangular.commands['com.services.Command3'].interceptors['After']).toBeDefined();
		expect(commangular.commands['com.services.Command3'].interceptors['After'][0].func).toEqual(aspectTest);
	});

	it("should create the interceptor AfterThrowing on com.services.Command3", function() {

		expect(commangular.commands['com.services.Command3'].interceptors).toBeDefined();
		expect(commangular.commands['com.services.Command3'].interceptors['AfterThrowing']).toBeDefined();
		expect(commangular.commands['com.services.Command3'].interceptors['AfterThrowing'][0].func).toEqual(aspectTest);
	});

	it("should create the interceptor Around on com.services.Command3", function() {

		expect(commangular.commands['com.services.Command3'].interceptors).toBeDefined();
		expect(commangular.commands['com.services.Command3'].interceptors['Around']).toBeDefined();
		expect(commangular.commands['com.services.Command3'].interceptors['Around'][0].func).toEqual(aspectTest);
	});*/

	
});