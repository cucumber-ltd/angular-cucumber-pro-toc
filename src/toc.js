angular.module('CucumberProTOC', [])
  .factory('TreeBuilder', [function() {
    function TreeBuilder(nodes, root) {
      root = root || '';
      validateRoot();

      function validateRoot() {
        if (!root.match(/(^$|\/$)/)) {
          throw new Error("Invalid root \"" + root + "\" - it must end with a forward-slash, or be an empty string.");
        }

        if (!_.find(nodes, function (node) { return !isOutsideRoot(node); })) {
          throw new Error("Invalid root \"" + root + "\" for path \"" + node.path + "\".");
        }
      }

      function relativePath(node) {
        if (isOutsideRoot(node)) {
          throw new Error("Invalid root \"" + root + "\" for path \"" + node.path + "\".");
        }
        return node.path.replace(root, '');
      }

      function isAtThisLevel(node) { 
        if (isOutsideRoot(node)) return false;
        return relativePath(node).indexOf("/") < 0; 
      }

      function isOutsideRoot(node) {
        return node.path.indexOf(root) !== 0;
      }

      function dirname(filePath) {
        return filePath.substring(0, filePath.lastIndexOf('/'));
      }

      function descendents() {
        return _.reject(nodes, function (node) {
          return isOutsideRoot(node) || isAtThisLevel(node);
        });
      }

      function descendentsOf(path) {
        return _.filter(descendents(), function (node) {
          return node.path.indexOf(path) === 0;
        });
      }

      function docs() {
        return _.map(_.filter(nodes, isAtThisLevel), function (doc) {
          return asNode.call(doc);
        });
      }

      function dirs() {
        function getPathSegment(doc) {
          return relativePath(doc).split("/")[0];
        }
        var segments = _.uniq(_.map(descendents(), getPathSegment));
        return segments.map(function (segment) {
          var path = root + segment;
          var dir = {
            path: path,
            name: inflection.humanize(segment),
            children: new TreeBuilder(descendentsOf(path), path + '/').tree(),
          }
          return asNode.call(dir);
        });
      }

      // 'mixin' function to extend the given object with functions we expect on any node
      function asNode() {
        this.isOnOrAroundPath = function (searchPath) {
          return (searchPath || '').indexOf(dirname(this.path)) === 0;
        };
        this.isDir = function () {
          return !!this.children;
        };
        return this;
      }

      function truncate(nodes) {
        // skip levels where there's just one dir and nothing else
        if (nodes.length === 1 && nodes[0].isDir()) {
          return nodes[0].children;
        }
        return nodes;
      }

      var self = {
        tree: function () {
          var nodes = docs().concat(dirs());
          return truncate(nodes);
        }
      }
      return self;
    }
    return TreeBuilder;
  }])

  .directive('cpToc', function (TreeBuilder) {
    return {
      replace: true,
      template: '<nav class="docs"> \
                   <cp-toc-level nodes="nodes" current-doc-path="currentDocPath"> \
                 </nav>',
      restrict: 'E',
      scope: {
        docs: "=",
        onClick: "&",
        currentDocPath: "="
      },

      controller: function ($scope) {
        if (typeof inflection == "undefined") 
          throw new Error("inflection library must be loaded in the page");
        if (typeof _ == "undefined") 
          throw new Error("lodash library must be loaded in the page");

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
            scope.nodes = new TreeBuilder(docs).tree();
          }
        }
      }
    };
  })

  .directive('cpTocLevel', function (RecursionHelper) {
    return {
      replace: true,
      require: '^cpToc',
      template: '\
      <ol data-ng-show="nodes.length > 0"> \
        <li \
          data-ng-repeat="node in nodes | orderBy:\'path\'" \
          data-ng-class="{dirty: node.isDirty(), outdated: node.isOutdated(), deleted: node.isDeleted(), open: isCurrent(node) }" \
          data-ng-show="isVisible(node)" >\
          <a data-ng-click="onClick({ doc: node }); $event.stopPropagation()" title="{{ node.path }}">{{ node.name }}</a>\
          <cp-toc-level nodes="node.children" current-doc-path="currentDocPath"> \
        </li>\
      </ol> \
      ',
      restrict: 'E',

      scope: {
        nodes: "=",
        currentDocPath: "="
      },

      link: function (scope, element, attributes, controller) {
        scope.onClick = controller.onClick;
        scope.isVisible = function (node) {
          return node.isOnOrAroundPath(scope.currentDocPath);
        };
        scope.isCurrent = function (node) {
          return (node.path === scope.currentDocPath);
        }
      },

      compile: function (element, link) {
        return RecursionHelper.compile(element, this.link);
      }

    };
  })

  .factory('RecursionHelper', ['$compile', function($compile){
    return {
      /**
       * Manually compiles the element, fixing the recursion loop.
       * @param element
       * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
       * @returns An object containing the linking functions.
       */
      compile: function(element, link) {
        // Normalize the link parameter
        if (angular.isFunction(link)) {
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
          post: function(scope, element) {
            // Compile the contents
            if (!compiledContents) {
              compiledContents = $compile(contents);
            }
            // Re-add the compiled contents to the element
            compiledContents(scope, function(clone) {
              element.append(clone);
            });

            // Call the post-linking function, if any
            if (link && link.post) {
              link.post.apply(null, arguments);
            }
          }
        };
      }
    };
  }]);
