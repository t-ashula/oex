/*
  Extream Fast Forward Lite Injected script
*/
(function(){
  window.addEventListener( 'DOMContentLoaded', function(){
    /* aliases */
    var win = window, loc = win.location, doc = win.document, oex = opera.extension,
      enc = win.encodeURIComponent, dec = win.decodeURIComponent, XPathResult = win.XPathResult;
    
    /* output debug string */
    var ods = (function( pkg, name ){
      return function( msg ){
        /** win.opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
      };
    })( 'efflite','injected.js' );
    function isOwner(){
      var res = true;
      try {
        res = win.top === win;
      }
      catch (x) {
        res = false;
      }
      return res;
    }
    if ( !isOwner() ){
      return;
    }
    function $X( xpath, context ){
      var result = doc.evaluate( xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null ),
        len = result.snapshotLength, ret = [], i;
      for ( i = 0; i < len; ++i ){
        ret[ i ] = result.snapshotItem( i );
      }
      return ret;
    }
    function getUrlFormXpath( xpath ){
      var url = $X( xpath );
      url = ( url[ 0 ] ) ? url[ 0 ] : url;
      return url.length < 7 ? "" : url;
    }
    function appendNavi( d, type, xpath, doPrefetch ){
      var href = getUrlFormXpath( xpath ),
        head = d.getElementsByTagName( 'head' ), l;
      if ( ( !head ) 
           || (( head = head[ 0 ] ).querySelector( 'link[rel="' + type + '"]' ) != null ) 
           || ( href === "" ) ) {
      }
      else {
        l = d.createElement( 'link' );
        l.rel = type;
        l.href = ( href.href ) ? href.href : href;
        head.appendChild( l );
      }
      ods('doPrefetch:' + doPrefetch );
      if ( doPrefetch ){
        (function(url){
          var iframe = d.createElement( 'iframe' );
          d.body.appendChild( iframe );
          iframe.src = url;
          iframe.width = iframe.height = '1px';
          iframe.onload = function(){
            ods( 'prefetched:' + url );
            d.body.removeChild( iframe );
          };
        })(href);
      }
      ods( 'appended;' + type + ':' + xpath );
      return true;
    }

    function appendNext( xpath, pref ) {
      return appendNavi( doc, 'next', xpath, pref );
    }
    function appendPrev( xpath, pref ){
      return appendNavi( doc, 'prev', xpath, pref );
    }
    
    /* onmessage */
    oex.onmessage = function( ev ) {
      var msg = ev.data, src = ev.source, cmd = msg.cmd, payload = msg.payload, i, path, paths, prefetch;
      //ods( 'cmd:' + cmd ); ods( 'pay:' + payload );
      switch( cmd ){
       case 'req':
        src.postMessage( { 'cmd' : 'res', 'payload' : enc( loc ) } );    
        break;
       case 'res':
        paths = payload.paths;
        prefetch = payload.doPrefetch;
        for ( i = 0; path = paths[ i ]; ++i ) {
          path.next && appendNext( path.next, prefetch );
          path.prev && appendPrev( path.prev, prefetch );
        }
        break;
      }
    };
  }, false );
})();
