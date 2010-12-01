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
        /**/ win.opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
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
    function appendNavi( d, type, xpath ){
      var href = getUrlFormXpath( xpath ),
        head = d.getElementsByTagName( 'head' ), l;
      if ( ( !head ) 
           || (( head = head[ 0 ] ).querySelector( 'link[rel="' + type + '"]' ) != null ) 
           || ( href === "" ) ) {
        return false;
      }
      l = d.createElement( 'link' );
      l.rel = type;
      l.href = href;
      head.appendChild( l );
      return true;
    }
    function appendNext( xpath ) {
      ods('next:' + xpath );
      return appendNavi( doc, 'next', xpath );
    }
    function appendPrev( xpath ){
      ods('prev:' + xpath );
      return appendNavi( doc, 'prev', xpath );
    }
    
    /* onmessage */
    oex.onmessage = function( ev ) {
      var msg = ev.data, src = ev.source, cmd = msg.cmd, payload = msg.payload, i, info;
      //ods( 'cmd:' + cmd ); ods( 'pay:' + payload );
      switch( cmd ){
       case 'req':
        src.postMessage( { 'cmd' : 'res', 'payload' : enc( loc ) } );    
        break;
       case 'res':
        for ( i = 0; info = payload[ i ]; ++i ) {
          info.next && appendNext( info.next );
          info.prev && appendPrev( info.prev );
        }
        break;
      }
    };
  }, false );
})();