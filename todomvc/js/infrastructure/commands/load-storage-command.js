commangular.command('LoadStorageCommand',function(todoStorage,TodoList){
	
	return {

		execute : function () {
			
			TodoList.todos = todoStorage.get();
		}
	}
});