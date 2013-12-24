
'use strict';


todomvc.controller('TodoCtrl', function TodoCtrl($scope, $location,TodoList,CurrentTodo) {
	
	$scope.todoList = TodoList;
	$scope.currentTodo = CurrentTodo;
		
	if ($location.path() === '') {
		$location.path('/');
	}

	$scope.location = $location;

	$scope.$watch('location.path()', function (path) {

		$scope.statusFilter = { '/active': {completed: false}, '/completed': {completed: true} }[path];
	});

	
});
