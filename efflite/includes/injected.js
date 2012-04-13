/*
  Extream Fast Forward Lite Injected script
*/
(function(){
  window.addEventListener( 'DOMContentLoaded', function(){
    /* aliases */
    var win = window, loc = win.location, doc = win.document, oex = opera.extension,
      enc = win.encodeURIComponent, dec = win.decodeURIComponent,
      XPathResult = win.XPathResult, XHR = win.XMLHttpRequest;
    
    /* output debug string */
    var ods = (function( pkg, name ){
      return function( msg ){
        /*__DEBUG__*/ win.opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
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
      for ( i = 0; i < len; i += 1 ){
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
        head = d.head, l;
      if ( href === "" )  {
        return false;
      }
      if( !head || ( head.querySelector( 'link[rel="' + type + '"]' ) != null ) ) {
        return false;
      }
      l = d.createElement( 'link' );
      l.rel = type;
      l.href = ( !!href.href ) ? href.href : href;
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
      ods('pref:'+type);
      var href = d.head.querySelector( 'link[rel="' + type + '"]' );
      if ( !!href ){
        href = href.href;
      }
      else {
        return;
      }
      ods('pref:'+type+':'+href);
      var preXHR = new XHR();
      preXHR.open( 'GET', href, false );
      preXHR.onreadystatechange = function() {
        if ( preXHR.readyState === 4 && preXHR.status === 200 ){
          var dd = preXHR.responseText
            .replace(/[\r\n]/g,'')
            .replace(/<script[^>]*>/ig, '<!--').replace(/script>/ig, '-->').replace(/<!--.*-->/ig,'')
            .replace(/<(title)[^>]*>/ig, '<!--').replace(/(title)>/ig, '-->').replace(/<!--.*-->/ig,'')
            .replace(/<head[^>]*>/ig, '<!--').replace(/head>/ig, '-->').replace(/<!--.*-->/ig,'')
            .replace(/(\bon[a-zA-Z]+)=(.+)/ig,'');
          ods(dd);
          var pbox = d.createElement( 'iframe' );
          pbox.style.height = pbox.style.width = '1px';
          pbox.onload = function(){
            ods( 'prefetched:' + href );
            doc.body.removeChild( pbox );
          };
          doc.body.appendChild( pbox );
          pbox.contentDocument.body.innerHTML = dd;
        }
      };
      preXHR.send( null );
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
      ods( 'cmd:' + cmd ); ods( 'pay:' + payload );
      switch( cmd ){
       case 'req':
        src.postMessage( { 'cmd' : 'res', 'payload' : enc( loc ) } );    
        break;
       case 'res':
        paths = payload.paths;
        dopref = payload.doPrefetch;
        for ( i = 0; path = paths[ i ]; i += 1 ) {
          !!path.next && appendNext( path.next );
          !!path.prev && appendPrev( path.prev );
        }
        ods( 'doPrefetch:' + dopref );
        if ( dopref ){
          prefetchPrev();
          prefetchNext();
        }
        break;
      }
    };
  }, false );
})();
