angular.module('CucumberProTOC', [])
  .directive('cpToc', function() {
    return {
      template: '<nav class="feature-browser"> \
                   <ul data-ng-show="docs.length > 0"> \
                     <li data-ng-repeat="doc in docs | orderBy:\'path\'" ng-class="{ dirty: doc.isDirty(), open: isDocOpen(doc) }"> \
                       <a data-ng-click="onClick({ doc: doc }); $event.stopPropagation()" title="{{ doc.path }}">{{ doc.name }}</a> \
                     </li> \
                   </ul> \
                 </nav>',
      restrict: 'E',
      scope: {
        docs: "=",
        onClick: "&",
        currentDocPath: "="
      },
      link: function (scope, element, attributes) {
        scope.isDocOpen = function (doc) {
          return (doc.path === scope.currentDocPath);
        };
      }
    };
  });
