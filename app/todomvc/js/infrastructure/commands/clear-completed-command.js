commangular.command('ClearCompletedCommand',function(TodoList){
	
	return {

		execute : function () {

			TodoList.clearCompleted();
		}
	}
});