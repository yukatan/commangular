describe("Provider Testing", function() {
  
	var provider;
	
	function command1(){};
	function command2(){};

	commangular.create('Command1',command1);
	commangular.create('Command2',command2);
	

	beforeEach(function() {

			module('commangular',function($commangularProvider){
	
				provider = $commangularProvider;
			});
			inject(function(){});
	});
	
	it("provider should be defined", function() {
		
		expect(provider).toBeDefined();
	});

	it("should find the commands", function() {
		
		var command = provider.get('Command1');
		expect(command).toBeDefined();
		expect(command).toEqual(command1);

		var command = provider.get('Command2');
		expect(command).toBeDefined();
		expect(command).toEqual(command2);
	});

	it("should create the correct commandType", function() {
		
		expect(provider).toBeDefined();

		var sequence = provider.asSequence().add('Command1').create();
		expect(sequence).toBeDefined();
		expect(sequence.commandType).toBe('S');

		var parallel = provider.asParallel().add('Command1').create();
		expect(parallel).toBeDefined();
		expect(parallel.commandType).toBe('P');

		var command = parallel.descriptors[0];
		expect(command).toBeDefined();
		expect(command.commandType).toBe('E');

	});

	it("descriptor should have the correct command function", function() {
		
		expect(provider).toBeDefined();

		var sequence = provider.asSequence().add('Command1').create();
		expect(sequence).toBeDefined();
		expect(sequence.command).toBeNull();

		var parallel = provider.asParallel().add('Command2').create();
		expect(parallel).toBeDefined();
		expect(parallel.command).toBeNull();

		var com1 = sequence.descriptors[0];
		expect(com1).toBeDefined();
		expect(com1.command).toEqual(command1);

		var com2 = parallel.descriptors[0];
		expect(com2).toBeDefined();
		expect(com2.command).toEqual(command2);

	});


});
