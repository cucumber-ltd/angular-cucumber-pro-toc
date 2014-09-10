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
        // TODO: rather than watching for objectEquality, it would be nicer to make this functional
        scope.$watch('docs', setLevelDocs, true);

        function setLevelDocs(docs) {
          if (!docs) return;
          if (docs.$promise) return docs.$promise.then(set);
          set(docs);
          function set(docs) {
            scope.levelDocs = nest(docs);
          }
        }

        function nest(flatDocs) {
          levelDocs = flatDocs.map(function (doc) {
            if (doc.path.indexOf("/") < 0) return doc;
            var segment = doc.path.split("/")[0]
            var dir = {
              path: segment,
              name: inflection.capitalize(segment)
            }
            return dir;
          }).reduce(function (docs, doc) {
            var paths = docs.map(function (doc) { return doc.path; });
            if (paths.indexOf(doc.path) < 0) {
              doc.docs = doc.docs || [];
              docs.push(doc);
            } else {
              docs[paths.indexOf(doc.path)].docs.push(doc);
            }
            return docs;
          }, []);
          return levelDocs;
        }
      }
    };
  })

  .directive('cpTocLevel', function () {
    return {
      replace: true,
      require: '^cpToc',
      template: '<ol data-ng-show="docs.length > 0">\
                   <li data-ng-repeat="doc in docs | orderBy:\'path\'" ng-class="{dirty: doc.isDirty(), outdated: doc.isOutdated(), deleted: doc.isDeleted(), open: isDocOpen(doc) }">\
                     <a data-ng-click="onClick({ doc: doc }); $event.stopPropagation()" title="{{ doc.path }}">{{ doc.name }}</a>\
                   </li>\
                 </ol>',
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
