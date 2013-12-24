angular.module('todomvc').config(function($commangularProvider) {

	//Load all the todos.
	$commangularProvider.mapTo('LoadTodos').asSequence()
		.add('LoadStorageCommand')
		.add('RefreshRemainingCommand');
	
	//Add a new todo to the todos list.
	$commangularProvider.mapTo('AddTodo').asSequence()
		.add('AddTodoCommand')
		.add('SaveStorageCommand')
		.add('RefreshRemainingCommand');

	//Remove a todo
	$commangularProvider.mapTo('RemoveTodo').asSequence()
		.add('RemoveTodoCommand')
		.add('SaveStorageCommand')
		.add('RefreshRemainingCommand');

	//Mark all command complete
	$commangularProvider.mapTo('MarkAll').asSequence()
		.add('MarkAllCommand')
		.add('SaveStorageCommand')
		.add('RefreshRemainingCommand');

	//Mark one todo complete
	$commangularProvider.mapTo('MarkOne').asSequence()
		.add('SaveStorageCommand')
		.add('RefreshRemainingCommand');

	//Clear all todos completed
	$commangularProvider.mapTo('ClearCompleted').asSequence()
		.add('ClearCompletedCommand')
		.add('SaveStorageCommand');

	//Close editing and save
	$commangularProvider.mapTo('DoneEditing').asSequence()
		.add('DoneEditingCommand')
		.add('SaveStorageCommand');
		
});