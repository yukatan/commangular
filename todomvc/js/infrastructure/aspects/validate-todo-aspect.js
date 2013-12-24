//Intercept add todo and check if some todo has been written.
commangular.eventAspect('@Before(/AddTodo/)',function(processor,CurrentTodo){
	
	return {

		execute : function () {

			if (CurrentTodo.todo.length === 0) {
				processor.cancel('Empty todo');
			}
			
		}
	}
});