// TODO: remove names from most test data
// TODO: explicit test for creating dir names
describe('TreeBuilder', function () {
  var TreeBuilder;

  beforeEach(module('CucumberProTOC'));

  beforeEach(inject(function(_TreeBuilder_) {
    TreeBuilder = _TreeBuilder_;
  }));

  function tree(docs, root) {
    return new TreeBuilder(docs, root).tree();
  }

  it('builds a flat tree', function () {
    var docs = [
      { path: 'a.feature' },
      { path: 'b.feature' }
    ];
    var expected = [
      { path: 'a.feature' },
      { path: 'b.feature' }
    ];
    expect(tree(docs)).toEqual(expected);
  });

  it('builds a one-level nested tree, naming directories', function () {
    var docs = [
      { path: 'a.feature' },
      { path: 'b/c.feature' }
    ];
    var expected = [
      { path: 'a.feature' },
      { path: 'b', name: 'B', children: [
        { path: 'b/c.feature' }
      ]}
    ];
    expect(tree(docs)).toEqual(expected);
  });

  it('infers the directory name from the path', function () {
    var docs = [
      { path: 'this_folder/a.feature' },
    ];
    var expected = [
      { path: 'this_folder', name: 'This folder', children: [
        { path: 'this_folder/a.feature' }
      ]}
    ];
    expect(tree(docs)).toEqual(expected);
  });

  it('builds a two-level nested tree', function () {
    var docs = [
      { path: 'a/b/c.feature' },
    ];
    var expected = [
      { path: 'a', name: 'A', children: [
        { path: 'a/b', name: 'B', children: [
          { path: 'a/b/c.feature' }
        ] }
      ] }
    ];
    expect(tree(docs)).toEqual(expected);
  });

  it('can start from a path below the root', function () {
    var docs = [
      { path: 'a/b/c.feature' }
    ];
    var expected = [
      { path: 'a/b', name: 'B', children: [
        { path: 'a/b/c.feature' }
      ] }
    ];
    expect(tree(docs, 'a/')).toEqual(expected);
  });

  it('throws an error if given an invalid root', function () {
    var docs = [
      { path: 'a/b/c.feature' }
    ];
    expect(function () { tree(docs, 'a/')}).not.toThrow();
    expect(function () { tree(docs, 'a/b/')}).not.toThrow();
    expect(function () { tree(docs, 'a')}).toThrow();
    expect(function () { tree(docs, 'wat')}).toThrow();
    expect(function () { tree(docs, 'b/')}).toThrow();
  });

});
