app.controller('questionController',
 ['$scope', '$state', '$http', '$rootScope', '$stateParams', 'qsts',
 function($scope, $state, $http, $rootScope, $stateParams, qsts) {
    $scope.qsts = qsts;
    $scope.ctgName = $stateParams.ctgName;
    $scope.correctAnrs = [];
    $scope.guess = null;

    $scope.submitGuess = function(guess, qstId, $event) {
       // Don't do anything if it was already answered
       if($scope.correctAnrs.indexOf(qstId) >= 0) {
          return;
       }
       var answerDiv = $event.target.parentElement;
       var children = answerDiv.children;
       $http.post("Qsts/" + qstId + "/Answers", {guess : guess})
        .then(function() {
           return $http.get("Qsts/Correct/" + qstId);
        }).then(function (isCorrect) {
           if(isCorrect.data.correct) {
              for(var child = 0; child < children.length; child ++) {
                 children[child].style.backgroundColor = "green";
              }
              $scope.correctAnrs.push(qstId);
              $rootScope.user.points += 1;
           } else {
              for(var child = 0; child < children.length; child ++) {
                 children[child].style.backgroundColor = "red";
              }
           }
       });
    }
}]);
