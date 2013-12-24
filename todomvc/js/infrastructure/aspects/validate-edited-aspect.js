//It is executed before the command group mapped to DoneEditing event
//Intercept DoneEditing event and validate  if todo.title is written.
commangular.eventAspect('@Before(/DoneEditing/)',function(CurrentTodo,todo,processor,$commangular){
	
	return {

		execute : function () {

			if(!todo.title && CurrentTodo.editedTodo != null){
				
				CurrentTodo.editedTodo = null;
				$commangular.dispatch('RemoveTodo',{todo:todo});
				processor.cancel();
			}
				 
		}
	}
});