angular.module('todomvc').factory('TodoList',function(filterFilter) {

	var model = {};
	model.remainingCount = 0;
	model.todos = [];
	model.allChecked = false;
	model.state = 'all';
	model.currentFilter = null;

		
	model.add = function(todo) {

		model.todos.push({title:todo,completed:false});
	}

	model.refreshRemaining = function() {

		model.remainingCount = filterFilter(model.todos, {completed: false}).length;
		model.allChecked = (model.remainingCount == 0) ? true : false;
	}

	model.removeTodo = function(todo) {

		model.todos.splice(model.todos.indexOf(todo), 1);
	}

	model.clearCompleted = function() {

		model.todos = model.todos.filter(function(val) {
			return !val.completed;
		});
	}

	return model;

});
	

