"use strict";

describe("Provider Testing", function() {

	var provider;
	function command1() {};
	function command2() {};

	beforeEach(function() {

		commangular.reset();
		commangular.create('Command1', command1);
		commangular.create('Command2', command2);
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
	
	it("should create the correct commandType", function() {

		expect(provider).toBeDefined();

		var sequence = provider.asSequence().add('Command1');
		expect(sequence).toBeDefined();
		expect(sequence.ctype).toBe('S');

		var parallel = provider.asParallel().add('Command1');
		expect(parallel).toBeDefined();
		expect(parallel.ctype).toBe('P');

		var command = parallel.descriptors[0];
		expect(command).toBeDefined();
		expect(command.ctype).toBe('E');

	});

	it("descriptor should have the correct command function", function() {

		expect(provider).toBeDefined();

		var sequence = provider.asSequence().add('Command1');
		expect(sequence).toBeDefined();
		expect(sequence.command).toBeUndefined();

		var parallel = provider.asParallel().add('Command2');
		expect(parallel).toBeDefined();
		expect(parallel.command).toBeUndefined();

		var com1 = sequence.descriptors[0];
		expect(com1).toBeDefined();
		expect(com1.command.commandFunction).toEqual(command1);

		var com2 = parallel.descriptors[0];
		expect(com2).toBeDefined();
		expect(com2.command.commandFunction).toEqual(command2);

	});

	it("should map to the correct event string", function() {

		expect(provider).toBeDefined();
		var eventName = 'TestEvent';
		provider.mapTo(eventName).asSequence().add('Command1');
		var commandDescriptor = provider.findCommand(eventName);
		expect(commandDescriptor).toBeDefined();
		expect(commandDescriptor.command).toBeUndefined();
		expect(commandDescriptor.descriptors[0].command.commandFunction).toEqual(command1);


	});

	it("should map correct sequences", function() {

		expect(provider).toBeDefined();
		var eventName = 'TestEvent';
		provider.mapTo(eventName).asSequence().add('Command1').add('Command2');
		var commandDescriptor = provider.findCommand(eventName);
		expect(commandDescriptor.ctype).toBe('S');
		expect(commandDescriptor).toBeDefined();
		expect(commandDescriptor.descriptors[0].command.commandFunction).toEqual(command1);
		expect(commandDescriptor.descriptors[1].command.commandFunction).toEqual(command2);
	});


	it("should map correct parallels", function() {

		expect(provider).toBeDefined();
		var eventName = 'TestEvent';
		provider.mapTo(eventName).asParallel().add('Command1').add('Command2');
		var commandDescriptor = provider.findCommand(eventName);
		expect(commandDescriptor.ctype).toBe('P');
		expect(commandDescriptor).toBeDefined();
		expect(commandDescriptor.descriptors[0].command.commandFunction).toEqual(command1);
		expect(commandDescriptor.descriptors[1].command.commandFunction).toEqual(command2);
	});

	it("should allow nested commands", function() {

		expect(provider).toBeDefined();
		var eventName = 'TestEvent';
		var sequence = provider.asSequence().add('Command1').add('Command2');
		provider.mapTo(eventName).asParallel().add('Command1').add('Command2').add(sequence);
		var commandDescriptor = provider.findCommand(eventName);
		expect(commandDescriptor.ctype).toBe('P');
		expect(commandDescriptor).toBeDefined();
		expect(commandDescriptor.descriptors[0].command.commandFunction).toEqual(command1);
		expect(commandDescriptor.descriptors[1].command.commandFunction).toEqual(command2);
		expect(commandDescriptor.descriptors[2]).toEqual(sequence);
		expect(commandDescriptor.descriptors[2].descriptors[0].command.commandFunction).toEqual(command1);
		expect(commandDescriptor.descriptors[2].descriptors[1].command.commandFunction).toEqual(command2);
	});
});