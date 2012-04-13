/*
  Extreamm Fast Forward Lite Background Process
 */
(function(){
  /* aliases */
  var win = window, loc = win.location, sss = win.localStorage,
    doc = win.document, oex = opera.extension,
    enc = win.encodeURIComponent, dec = win.decodeURIComponent, JSON = win.JSON;
  /* output debug string */
  var ods = (function( pkg, name ){
    return function( msg ){
      /*__DEBUG__* opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
    };
  })( 'efflite','background.js' );

  /* sample
     {
     url:      'http://www.google.*?/search*',
     nextLink: 'id("navbar")/table/tbody/tr/td[last()]/a'
     },
    // template
    {
      url:      '',
      nextLink: ''
    },
    */
  var SITEINFO = [];
  // http://wedata.net/databases/AutoPagerize/items.json
  function updateEffSiteinfo(){
    var SITEINFOURI = 'http://wedata.net/databases/AutoPagerize/items.json';
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', SITEINFOURI, true );
    xhr.onreadystatechange = function(){
      if ( xhr.readyState === 4 && xhr.status === 200 ){
        var tmp = [], old = SITEINFO, item, i, prev;
        try{
          var items = JSON.parse( xhr.responseText );
          ods( items.length );
          for ( i = 0; item = items[ i ]; i += 1 ) {
            tmp[ tmp.length ] = {
              'url' : item.data.url,
              'nextLink' : item.data.nextLink };
          }
        }
        catch (x) {
          ods( 'GET JSON FAILED :' + x + ':' + xhr.responseText );
        }
        SITEINFO = tmp.length > old.length ? tmp : old;
        function rg (q){
          return function( s, p1, p2 ){
            return '"' + p1 + q + p2 + '"';
          };
        }
        for ( i = 0; item = SITEINFO[ i ]; i += 1 ) {
          prev = item.nextLink
            .replace( /"([^"\/]*)pagN([^"\/]*)"/g, rg( 'pagP' ) )
            .replace( /"([^"\/]*)next([^"\/]*)"/g, rg( 'prev' ) )
            .replace( /"([^"\/]*)NEXT([^"\/]*)"/g, rg( 'PREV' ) )
            .replace( /"([^"\/]*)Next([^"\/]*)"/g, rg( 'Prev' ) )
            .replace( /"([^"\/]*)>>([^"\/]*)"/g, rg( '<<' ) )
            .replace( /"([^"\/]*)≫([^"\/]*)"/g, rg( '≪' ) )
            .replace( /"([^"\/]*)»([^"\/]*)"/g, rg( '«' ) )
            .replace( /"([^"\/]*)次([^"\/]*)"/g, rg( '前' ) )
            ;
          if ( prev != item.nextLink ) {
            item.prevLink = prev;
          }
        }
        ods( SITEINFO.length );          
      }
    };
    xhr.send( null );
  }
  var kExcludeKey = 'EFFExclude';
   function initExcludes( exs ){
    var excludes = sss.getItem( kExcludeKey ), ex, ne = [], i, j, jj, f;
    excludes = excludes ? JSON.parse( excludes ) : [];
    for ( i = 0; ex = excludes[ i ]; ++i ){
      ne[ ne.length ] = ex;
    }
    for ( i = 0; ex = exs[ i ]; ++i ) {
      f = true;
      for ( j = 0; jj = ne[ j ]; ++j ) {
        if ( jj == ex ) {
          f = false;
          break;
        }
      }
      if ( f ){
        ne[ ne.length ] = ex;          
      }
    }
    sss.setItem( kExcludeKey, JSON.stringify( ne ) );
  }
 
  function getDoPrefetch( url ){
    var expats = sss.getItem( kExcludeKey ), expat, i;
    expats = expats ? JSON.parse( expats ) : [];
    ods('expats ;' + expats + typeof expats );
    for ( i = 0; expat = expats[ i ]; ++i ){
      if ( url.match( new RegExp( expat ) ) ) {
        return false;
      }
    }
    return true;
  }

  function getXPathForUrl( url ) {
    var paths = [], path = {
      'next' : '(//a[@rel="next"])[last()]',
      'prev' : '(//a[@rel="prev"])[last()]'
    }, i, info;
    for ( i = 0; info = SITEINFO[ i ]; i += 1 ){
      if ( url.match( info.url ) ) {
        paths[ paths.length ] = {
          'next' : info.nextLink ? info.nextLink : path.next,
          'prev' : info.prevLink ? info.prevLink : void 0
        };
      }
    }
    return paths;
  }
  
  win.addEventListener( 'load', function( ev ) {
    updateEffSiteinfo();
    initExcludes( ['twitter.com/', 'www.tumblr.com/', 'stackoverflow.com/', 'images.yandex.ru/'] );

    /* onmessage */
    oex.onmessage = function( ev ) {
      var msg = ev.data, src = ev.source, cmd = msg.cmd, payload = msg.payload, url, paths, prefetch;
      if ( cmd === 'res' ) {
        url = dec( payload );
        paths = getXPathForUrl( url );
        prefetch = getDoPrefetch( url );
        src.postMessage( { 'cmd':'res', 'payload' : { 'paths' : paths, 'doPrefetch' : prefetch } } );
        return;
      }
    };
    oex.onconnect = function( ev ) {
      var msg = ev.data, src = ev.source;
      //ods( 'msg:' + msg ); ods( 'src:' + src );
      try{
        src.postMessage( { 'cmd' : 'req', 'payload' : 'send back url' } );          
      }
      catch (x) {
        ods('onconnect:' + x );
      }
    };
  }, false);  
})();