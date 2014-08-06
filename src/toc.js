var toc = angular.module('toc', []);
angular.module('toc')
  .directive('toc', function() {
    return {
      templateUrl: 'toc.html',
      restrict: 'E',
      scope: {}
    };
  });
