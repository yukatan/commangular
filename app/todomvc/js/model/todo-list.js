angular.module('todomvc').factory('TodoList',function() {

	var model = {};
	model.remainingCount = 0;
	model.newTodo = '';
	model.editedTodo = null;
	model.todos = [];
	return model;

});
	

