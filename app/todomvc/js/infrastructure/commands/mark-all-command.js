commangular.command('MarkAllCommand',function(TodoList){
	
	return {

		execute : function () {

			angular.forEach(TodoList.todos,function(todo){

				todo.completed = TodoList.allChecked;
			});
		}
	}
});