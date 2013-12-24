commangular.command('SaveStorageCommand',function(todoStorage,TodoList){
	
	return {

		execute : function () {

			todoStorage.put(TodoList.todos);
		}
	}
});