describe('toc', function () {
  var element, scope, compile, $q

  beforeEach(module('CucumberProTOC'));

  beforeEach(inject(function($rootScope, $compile, _$q_) {
    scope = $rootScope.$new();
    compile = $compile;
    $q = _$q_;
  }));

  describe("docs attribute", function () {

    beforeEach(function () {
      element = $('<div><cp-toc docs="docs"></cp-toc></div>');
    });

    it('renders one <li> per doc (given a flat list)', function () {
      renderDocs([
        { path: 'foo.feature', name: 'Foo' },
        { path: 'bar.feature', name: 'Bar' }
      ]);

      expect(element.find('li').length).toBe(2);
    });

    it('renders a nested list, inferring directory names', function () {
      renderDocs([
        { path: 'a.feature', name: 'A' },
        { path: 'b/c.feature', name: 'C' },
        { path: 'd/e.feature', name: 'E' }
      ]);
      var links = element.find('li a').toArray();
      var names = links.map(function (a) { return a.text; });
      expect(names).toEqual(["A", "B", "C", "D", "E"]);
    });

    it('truncates empty directories', function () {
      renderDocs([
        { path: 'a/b/c.feature', name: 'C' },
      ]);
      var links = element.find('li a').toArray();
      var names = links.map(function (a) { return a.text; });
      expect(names).toEqual(["C"]);
    });

    it('handles undefined docs', function () {
      renderDocs();
      expect(element.find('li').length).toBe(0);
    });

    it('accepts a promise (e.g. an angular resource)', function () {
      var docs = [
        { path: 'foo.feature', name: 'Foo' },
      ];
      var deferred = $q.defer();
      renderDocs({ $promise: deferred.promise });

      expect(element.find('li').length).toBe(0);
      deferred.resolve(docs);
      scope.$apply();
      expect(element.find('li').length).toBe(1);
    });

    it('updates when the docs attribute is mutated', function () {
      renderDocs([
        { path: 'foo.feature', name: 'Foo' }
      ]);

      expect(element.find('li').length).toBe(1);
      scope.docs.push({ path: 'bar.feature', name: 'Bar' });
      scope.$digest();
      expect(element.find('li').length).toBe(2);
    });

  });

  describe("current-doc-path attribute", function () {

    function nodeNames() {
      var links = element.find("ol:not('.ng-hide') > li > a").toArray();
      return _.map(links, 'text');
    }

    it("hides directories' children if not on the path to the current doc", function () {
      element = $('<div><cp-toc docs="docs" current-doc-path="\'b/c.feature\'"></cp-toc></div>');
      renderDocs([
        { path: 'a.feature', name: 'A' },
        { path: 'b/c.feature', name: 'C' },
        { path: 'd/e.feature', name: 'E' }
      ]);
      expect(nodeNames()).toEqual([
        "A",
        "B",
         "C",
        "D"
      ]);
    });

    it("still shows stuff when nothing's selected", function () {
      element = $('<div><cp-toc docs="docs" current-doc-path=""></cp-toc></div>');
      renderDocs([
        { path: 'features/a.feature', name: 'A' },
      ]);
      expect(nodeNames()).toEqual([
        "A",
      ]);
    });

    it("updates the tree dynamically if changed", function () {
      scope.currentPath = 'b/c.feature';
      element = $('<div><cp-toc docs="docs" current-doc-path="currentPath"></cp-toc></div>');
      renderDocs([
        { path: 'a.feature', name: 'A' },
        { path: 'b/c.feature', name: 'C' },
        { path: 'd/e.feature', name: 'E' }
      ]);
      expect(nodeNames()).toEqual([
        "A",
        "B",
          "C",
        "D"
      ]);
      scope.currentPath = 'd/e.feature';
      scope.$digest();
      expect(nodeNames()).toEqual([
        "A",
        "B",
        "D",
          "E"
      ]);
    });

  });

  describe("ls-class attribute", function () {

    it('renders each li element with the specified dynamic CSS classes', function () {
      element = $('<div><cp-toc docs="docs" li-class="{ crazy: node.isCrazy() }"></cp-toc></div>');
      renderDocs([
        { path: 'crazy.feature', name: 'Crazy', isCrazy: function () { return true; } },
        { path: 'sleepy.feature', name: 'Sleepy', isCrazy: function () { return false; } }
      ]);

      var listItems = element.find('li');
      expect($(listItems[0]).hasClass('crazy')).toBeTruthy();
      expect($(listItems[1]).hasClass('crazy')).toBeFalsy();
    });

  });

  describe("on-click attribute", function () {

    // TODO: work out how to test this - it works, but I can't test it!
    xit('fires the onclick function when clicked', function (callback) {
      scope.$apply(function () {
        scope.onClickFn = jasmine.createSpy('on-click callback');
      });
      element = $('<div><cp-toc docs="docs" on-click="onClickFn(doc)"></cp-toc></div>');
      var docs = [
        { path: 'clicked.feature', name: 'Clicked' },
        { path: 'not_clicked.feature', name: 'Not clicked' }
      ];
      renderDocs(docs);

      var link = element.find('li').eq(0).find('a');
      link.click();
      expect(scope.onClickFn).toHaveBeenCalledWith(docs[0]);
    });

  });

  function renderDocs(docs) {
    scope.docs = docs;
    compile(element)(scope);
    scope.$digest();
  }
});
