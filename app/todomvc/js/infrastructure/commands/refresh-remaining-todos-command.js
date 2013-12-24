commangular.command('RefreshRemainingCommand',function(TodoList){
	
	return {

		execute : function () {

			TodoList.refreshRemaining();
		}
	}
});