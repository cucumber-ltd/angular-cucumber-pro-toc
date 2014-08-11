angular.module('CucumberProTOC', [])

  .directive('cpToc', function () {
    return {
      replace: true,
      template: '<nav class="docs"> \
                   <cp-toc-level docs="levelDocs" current-doc-path="currentDocPath"> \
                 </nav>',
      restrict: 'E',
      scope: {
        docs: "=",
        onClick: "&",
        currentDocPath: "="
      },

      controller: function ($scope) {
        // share the onClick function with all the child cp-level directives
        this.onClick = $scope.onClick;
      },

      link: function (scope, element, attributes) {
        scope.$watch('docs', function (docs) {
          scope.levelDocs = nest(docs);
        });

        function nest(flatDocs) {
          // TODO
          return flatDocs;
        }
      }
    };
  })

  .directive('cpTocLevel', function () {
    return {
      replace: true,
      require: '^cpToc',
      template: '<ul data-ng-show="docs.length > 0"> \
                   <li data-ng-repeat="doc in docs | orderBy:\'path\'" ng-class="{ dirty: doc.isDirty(), open: isDocOpen(doc), outdated: doc.isOutdated() }"> \
                     <a data-ng-click="onClick({ doc: doc }); $event.stopPropagation()" title="{{ doc.path }}">{{ doc.name }}</a> \
                   </li> \
                 </ul>',
      restrict: 'E',
      scope: {
        docs: "=",
        currentDocPath: "="
      },
      link: function (scope, element, attributes, controller) {
        scope.onClick = controller.onClick;
        scope.isDocOpen = function (doc) {
          return (doc.path === scope.currentDocPath);
        };
      }
    };
  });
