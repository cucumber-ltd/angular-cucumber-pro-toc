describe('toc', function () {
  var element, scope;

  beforeEach(module('CucumberProTOC'));
  beforeEach(module('toc.html'));

  beforeEach(inject(function($rootScope, $compile) {
    element = angular.element('<toc docs="{{docs}}">');
    scope = $rootScope;
    scope.docs = [
      { path: 'foo/bar/baz.feature', name: 'Baz' }
    ];
    $compile(element)(scope);
    scope.$digest();
  }));

  it('renders', function (callback) {
    var list = element.find('ol');
    expect(list.length).toBe(1);
  });
});
