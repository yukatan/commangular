angular.module('todomvc').factory('CurrentTodo',function() {
	
	var model = {};
	model.todo = '';
	model.editedTodo = null;
	
	model.clearTodo = function() {

		model.todo = '';
	}
	
	return model;

});