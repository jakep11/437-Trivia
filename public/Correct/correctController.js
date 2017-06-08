//Controller for correctly answered questions
app.controller('categoryController',
 ['$scope', '$state', 'anrs',
    function($scope, $state, anrs) {
       $scope.anrs = anrs;
    }]);
