angular.module('CucumberProTOC', [])
  .directive('toc', function() {
    return {
      templateUrl: 'toc.html',
      restrict: 'E',
      scope: {}
    };
  });
