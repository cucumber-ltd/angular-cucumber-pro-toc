angular.module('CucumberProTOC', [])
  .factory('RecursionHelper', ['$compile', function($compile){
    return {
      /**
       * Manually compiles the element, fixing the recursion loop.
       * @param element
       * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
       * @returns An object containing the linking functions.
       */
      compile: function(element, link){
        // Normalize the link parameter
        if(angular.isFunction(link)){
          link = { post: link };
        }

        // Break the recursion loop by removing the contents
        var contents = element.contents().remove();
        var compiledContents;
        return {
          pre: (link && link.pre) ? link.pre : null,
          /**
           * Compiles and re-adds the contents
           */
                 post: function(scope, element){
                   // Compile the contents
                   if(!compiledContents){
                     compiledContents = $compile(contents);
                   }
                   // Re-add the compiled contents to the element
                   compiledContents(scope, function(clone){
                       element.append(clone);
                       });

          // Call the post-linking function, if any
          if(link && link.post){
            link.post.apply(null, arguments);
          }
        }
      };
    }
  };
  }])

  .directive('cpToc', function () {
    return {
      replace: true,
      template: '<nav class="docs"> \
                   <pre>{{ levelDocs }}</pre> \
                   <cp-toc-level docs="levelDocs" current-doc-path="currentDocPath"> \
                 </nav>',
      restrict: 'E',
      scope: {
        docs: "=",
        onClick: "&",
        currentDocPath: "="
      },

      controller: function ($scope) {
        if (typeof inflection == "undefined") throw new Error("inflection library must be laoded in the page");
        if (typeof _ == "undefined") throw new Error("lodash library must be laoded in the page");

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

  .directive('cpTocLevel', function (RecursionHelper) {
    return {
      replace: true,
      require: '^cpToc',
      template: '\
      <div> \
      <pre>{{ 2 }}</pre> \
      <ol data-ng-show="docs.length > 0"> \
        <li \
          data-ng-repeat="doc in docs | orderBy:\'path\'" \
          ng-class="{dirty: doc.isDirty(), outdated: doc.isOutdated(), deleted: doc.isDeleted(), open: isDocOpen(doc) }">\
          <a data-ng-click="onClick({ doc: doc }); $event.stopPropagation()" title="{{ doc.path }}">{{ doc.name }}</a>\
          <cp-toc-level docs="doc.docs" current-doc-path="currentDocPath"> \
        </li>\
      </ol> \
      </div> \
      ',
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
      },

      compile: function (element, link) {
        return RecursionHelper.compile(element, this.link);
      }

    };
  });
