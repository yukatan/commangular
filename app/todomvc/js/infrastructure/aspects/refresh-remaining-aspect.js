commangular.eventAspect('@After(/.*/)',function(TodoList){
	
	return {

		execute : function () {

			TodoList.refreshRemaining();
		}
	}
});