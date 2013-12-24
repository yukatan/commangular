commangular.command('DoneEditingCommand',function(CurrentTodo,todo){
	
	return {

		execute : function () {
			
			CurrentTodo.editedTodo = null;
			todo.title = todo.title.trim();
		}
	}
});