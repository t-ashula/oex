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
        /*__DEBUG__* win.opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
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
      if ( ( !head ) ) {
          return false;
      }
      if (  href === "" )  {
        return false;
      }
      if( ( head = head[ 0 ] ) && head.querySelector( 'link[rel="' + type + '"]' ) != null ) {
        ods( 'exists.' );
        return false;
      }
      l = d.createElement( 'link' );
      l.rel = type;
      l.href = ( href.href ) ? href.href : href;
      head.appendChild( l );
      ods( 'appended;' + type + ':' + xpath );
      return true;
    }

    function appendNext( xpath ) {
      return appendNavi( doc, 'next', xpath );
    }
    function appendPrev( xpath ) {
      return appendNavi( doc, 'prev', xpath );
    }

    function prefetch( d, type ){
      var href = d.head.querySelector( 'link[rel="' + type + '"]' );
      if ( !!href ){
        href = href.href;
      }
      else {
        return;
      }
      var iframe = d.createElement( 'iframe' );
      d.body.appendChild( iframe );
      iframe.src = href;
      iframe.width = iframe.height = '1px';
      iframe.onload = function(){
        ods( 'prefetched:' + href );
        d.body.removeChild( iframe );
      };
    }

    function prefetchNext(){
      prefetch( doc, 'next' );
    }
    function prefetchPrev(){
      prefetch( doc, 'prev' );
    }
    /* onmessage */
    oex.onmessage = function( ev ) {
      var msg = ev.data, src = ev.source, cmd = msg.cmd, payload = msg.payload, i, path, paths, dopref;
      //ods( 'cmd:' + cmd ); ods( 'pay:' + payload );
      switch( cmd ){
       case 'req':
        src.postMessage( { 'cmd' : 'res', 'payload' : enc( loc ) } );    
        break;
       case 'res':
        paths = payload.paths;
        dopref = payload.doPrefetch;
        for ( i = 0; path = paths[ i ]; ++i ) {
          path.next && appendNext( path.next );
          path.prev && appendPrev( path.prev );
        }
        if ( dopref ){
          ods('doPrefetch:' + dopref );
          prefetchNext( );
          prefetchPrev( );
        }
        break;
      }
    };
  }, false );
})();
