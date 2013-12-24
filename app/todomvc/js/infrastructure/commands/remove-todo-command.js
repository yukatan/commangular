commangular.command('RemoveTodoCommand',function(TodoList,todo){
	
	return {

		execute : function () {

			TodoList.removeTodo(todo)
		}
	}
});