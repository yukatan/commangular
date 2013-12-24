commangular.command('AddTodoCommand',function(TodoList,CurrentTodo){
	
	return {

		execute : function() {
		
			TodoList.add(CurrentTodo.todo);
			CurrentTodo.clearTodo();
		}
	}
});