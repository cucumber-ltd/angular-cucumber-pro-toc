angular.module('CucumberProTOC', [])

  .directive('cpToc', function () {
    return {
      replace: true,
      template: '<nav class="feature-browser"> \
                   <cp-toc-level docs="levelDocs" onClick="onClick", current-doc-path="currentDocPath"> \
                 </nav>',
      restrict: 'E',
      scope: {
        docs: "=",
        onClick: "&",
        currentDocPath: "="
      },
      link: function (scope, element, attributes) {
        // TODO: nest docs and pass nested list to cp-toc-level
        scope.levelDocs = scope.docs;
      }
    };
  })

  .directive('cpTocLevel', function () {
    return {
      template: '<ul data-ng-show="docs.length > 0"> \
                   <li data-ng-repeat="doc in docs | orderBy:\'path\'" ng-class="{ dirty: doc.isDirty(), open: isDocOpen(doc) }"> \
                     <a data-ng-click="onClick({ doc: doc }); $event.stopPropagation()" title="{{ doc.path }}">{{ doc.name }}</a> \
                   </li> \
                 </ul>',
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
