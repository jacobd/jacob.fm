(function (public) {

  var last = {
      fm: {
        totalTracks: 0,
        tracks: []
      }
    },
    config = {
      user: 'jacobd',
      last: {
        fm: {
          api: {
            key: '5a509d3493e0f21da7e9166462ae2f62'
          }
        }
      }
    };

  last.fm.api = function (method, data, next) {
    var url = 'http://ws.audioscrobbler.com/2.0/?callback=?',
      params = {
        method: method,
        user: config.user,
        format: 'json',
        api_key: config.last.fm.api.key
      }, o, xhr;

    if (typeof data === 'function') {
      next = data;
      data = false;
    }
    if (data) {
      for (o in data) {
        params[o] = data[o];
      }
    }

    console.log('last.fm.API(' + method + ')', params);
    xhr = $.getJSON(url, params);
    xhr.then(function () {
      console.log('last.fm.API(' + method + ') RESPONSE', params, arguments);
    });
    if (next) {
      xhr.then(next);
    }
    return xhr;
  }

  last.fm.getRecentTracks = function (api) {
    var page = 1,
      limit = 10,
      totalLoaded;

    return function () {
      var xhr;
      if (totalLoaded === last.fm.totalTracks) {
        return false;
      }
      xhr = api('user.getrecenttracks', {
        limit: limit,
        page: page
      });

      page ++;

      xhr.then(function (r) {
        last.fm.totalTracks = r.recenttracks['@attr'].total;
        totalLoaded += r.recenttracks.track.length;
        if (!r.recenttracks.track.length) {
          last.fm.totalTracks = totalLoaded;
        } else {
          last.fm.tracks = last.fm.tracks.concat(r.recenttracks.track);
        }
      });
      return xhr;
    }
  }(last.fm.api);


  function addTrack(track) {
    var $tracks = $('#tracks'),
      $html = $([
      '<div class="track">',
        track.artist['#text'],
        ' - ',
        track.name,
      '</div>'
      ].join(''));

    $html.appendTo($tracks);
  }
  function addTracks(tracks) {
    tracks.recenttracks.track.forEach(addTrack);
  }
  $(function () {
    last.fm.getRecentTracks().then(addTracks);
  });




  public.last = last;
}(this));