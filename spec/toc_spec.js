function toc(docs) {
  var paths = docs.map(function (doc) { return doc.path });
  var segments = paths.map(function (path) { return path.split('/'); });
  var current;
  var level = 0
  segments.forEach(function (path) {
    current = {
      path: path[level]
    }
  });

  var self = {
    docs: [
      { path: current }
    ]
  }
  return self;
}

describe('TOC', function () {
  it('takes the lowest parent as the root', function (callback) {
    var docs = [
      { path: 'foo/bar/baz.feature', name: 'Baz' }
    ];
    var expected = [
      {
        path: 'foo/bar',
        name: 'Bar',
        docs: [
          { path: 'foo/bar/baz.feature', name: 'Baz' }
        ]
      }
    ];
    expect(toc(docs).docs).toBe(expected);
  });

  it('uses any readme as the default path of a directory', function (callback) {
    var docs = [
      { path: 'foo/bar/readme.md', name: 'Readme' },
      { path: 'foo/bar/baz.feature', name: 'Baz' }
    ];
    var expected = [
      {
        path: 'foo/bar/readme.md',
        name: 'Bar',
        docs: [
          { path: 'foo/bar/baz.feature', name: 'Baz' }
        ]
      }
    ];
    expect(toc(docs).docs).toBe(expected)
  });

  it('uses a feature as the default path of a directory', function (callback) {
    var docs = [
      { path: 'foo/bar.feature', name: 'Bar' },
      { path: 'foo/bar/baz.feature', name: 'Baz' }
    ];
    var expected = [
      {
        path: 'foo/bar.feature',
        name: 'Bar',
        docs: [
          { path: 'foo/bar/baz.feature', name: 'Baz' }
        ]
      }
    ]
    expect(toc(docs).docs).toBe(expected);
  });
});
