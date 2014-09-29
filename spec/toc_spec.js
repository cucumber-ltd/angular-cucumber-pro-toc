describe('toc', function () {
  var element, scope, compile, $q

  beforeEach(module('CucumberProTOC'));

  beforeEach(inject(function($rootScope, $compile, _$q_) {
    element = $('<div><cp-toc docs="docs"></cp-toc></div>');
    scope = $rootScope.$new();
    compile = $compile;
    $q = _$q_;
  }));

  it('renders a single doc', function () {
    renderDocs([
      { path: 'foo.feature', name: 'Foo' },
    ]);
    expect(element.find('li').length).toBe(1);
  });

  it('handles undefined docs', function () {
    renderDocs();
    expect(element.find('li').length).toBe(0);
  });

  it('handles promises (e.g. an angular resource)', function () {
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

  it('renders one <li> per doc', function () {
    renderDocs([
      { path: 'foo.feature', name: 'Foo' },
      { path: 'bar.feature', name: 'Bar' }
    ]);

    expect(element.find('li').length).toBe(2);
  });

  xit('renders nested lists', function ()  {
    renderDocs([
      { path: 'one.feature', name: 'One' },
      { path: 'two/three.feature', name: 'Three' },
      { path: 'two/four.feature', name: 'Four' }
    ]);

    var links = element.find('nav ol li a').toArray();
    names = links.map(function (a) { return a.text; });
    expect(names).toEqual(["One", "Two"]);

    var links = element.find('nav ol li ol li a').toArray();
    names = links.map(function (a) { return a.text; });
    expect(names).toEqual(["Three", "Four"]);
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

  it('renders with a `dirty` class if the doc is dirty', function () {
    renderDocs([
      { path: 'clean.feature', name: 'Clean', isDirty: function () { return false; } },
      { path: 'dirty.feature', name: 'Dirty', isDirty: function () { return true; } }
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('dirty')).toBeFalsy();
    expect($(listItems[1]).hasClass('dirty')).toBeTruthy();
  });

  it('renders with an `open` class if the doc is open', function () {
    element = $('<div><cp-toc docs="docs" current-doc-path="\'open.feature\'"></cp-toc></div>');
    renderDocs([
      { path: 'not_open.feature', name: 'Not open' },
      { path: 'open.feature', name: 'Open' }
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('open')).toBeFalsy();
    expect($(listItems[1]).hasClass('open')).toBeTruthy();
  });

  it("hides directories' children if not on the path to the current doc", function () {
    element = $('<div><cp-toc docs="docs" current-doc-path="\'a/2.feature\'"></cp-toc></div>');
    renderDocs([
      { path: '1.feature', name: 'Open' },
      { path: 'a/2.feature', name: 'Open' },
      { path: 'b/3.feature', name: 'Not open' }
    ]);
    /* should render as:
       - 1
       - A
       -   2
       - B
       */
    function isHidden(element) {
      return $(element).attr('class').match(/ng-hide/); 
    }
    var listItems = _.reject(element.find('li'), isHidden);
    expect(listItems.length).toBe(4);
  });

  it('renders with an `outdated` class if the doc is outdated', function () {
    element = $('<div><cp-toc docs="docs"></cp-toc></div>');
    renderDocs([
      { path: 'outdated.feature', name: 'Outdated', isOutdated: function () { return true; } },
      { path: 'pristine.feature', name: 'Pristine', isOutdated: function () { return false; } }
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('outdated')).toBeTruthy();
    expect($(listItems[1]).hasClass('outdated')).toBeFalsy();
  });

  it('renders with a `deleted` class if the doc is deleted', function () {
    element = $('<div><cp-toc docs="docs"></cp-toc></div>');
    renderDocs([
      { path: 'deleted.feature', name: 'Deleted', isDeleted: function () { return true; } },
      { path: 'pristine.feature', name: 'Pristine', isDeleted: function () { return false; } }
    ]);

    var listItems = element.find('li');
    expect($(listItems[0]).hasClass('deleted')).toBeTruthy();
    expect($(listItems[1]).hasClass('deleted')).toBeFalsy();
  });

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

  function renderDocs(docs) {
    scope.docs = docs;
    compile(element)(scope);
    scope.$digest();
  }
});
