(function(){
  /* aliases */
  var win = window, loc = win.location,
    doc = win.document, oex = opera.extension, sss = win.localStorage, body = doc.body,
    enc = win.encodeURIComponent, dec = win.decodeURIComponent, JSON = win.JSON;
  /* output debug string */
  var ods = (function( pkg, name ){
    return function( msg ){
      /*__DEBUG__* opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
    };
  })( 'efflite', 'opt.js' ),
    ins = function( o ){ for( var i in o ){ ods( o + '[' + i + '] =' + o[ i ] ); } };
  /* Q */
  var Q = {};
  Q[ 'dom' ] = (function(){
    var _dom = {}, _html4 = [
      'html', 'head','title','meta','link','script','style',
      'body','div','span','a','p','br','hr', 'pre','blockquote','address','ins','del',
      'table','thead','tbody','tfoot','caption','colgroup','cols','tr','th','td',
      'form','input','label','legend','button','textarea',
      'ul','ol','li','dl','dt','dd', 'h1','h2','h3','h4','h5','h6',
      'code','dfn','kbd','cite','q','img','object','applet' ];
    _html4.forEach( function( ele ){
      _dom[ ele ] = function(){
        var e = doc.createElement( ele ), args = arguments, as = args[ 0 ], a, i, n, t;
        if ( !!as ) {
          for ( a in as ) {
            if ( as.hasOwnProperty( a ) ) {
              e.setAttribute( a, as[ a ] );
            }
          }
          for ( i = 1; n = args[ i ]; i += 1 ) {
            if ( typeof n === 'string' ) {
              e.appendChild( doc.createTextNode( n ) );
            }
            else if ( n instanceof Array ) {
              for ( t = 0; a = n[ t ]; t += 1 ){
                e.appendChild( typeof a === 'string' ? doc.createTextNode( a ) : a );
              }
            }
            else {
              e.appendChild( n );
            }
          }
        }
        return e;
      };
    });
    return _dom;
  })();

  var kExcludeKey = 'EFFExclude',
    kNewPatternKey = 'newexpat';
  function createExcludSection() {
    var excludes = JSON.parse( sss.getItem( kExcludeKey ) ) || [ 'twitter.com/', 'www.tumblr.com/' ], sec, tmp;
    var frm = Q.dom.form(
      { 'id' : 'addexclude', 'action' : '' },
      Q.dom.ul(
        {},
        excludes.map( function( i ) {
          var id = 'exurl' + i;
          return Q.dom.li(
            {},
            Q.dom.input( { 'id': id, 'type' : 'checkbox', 'value' : enc( i ), 'checked' : 'checked' } ),
            Q.dom.label( { 'for' : id }, i  )
          );
        })
      ),
      Q.dom.input( { 'type' : 'text',   'id' : kNewPatternKey } ),
      Q.dom.input( { 'type' : 'submit', 'id' : 'addnewex' }, 'Update' )
    );
    frm.addEventListener(
      'submit',
      function ( ev ){
        var nexs = [],
          exs = doc.getElementById( kExcludeKey ).getElementsByTagName( 'li' ),
          newpat = doc.getElementById( kNewPatternKey ).value, i, ex, ii;
        for ( i = 0; ex = exs.item( i ); i += 1 ){
          ii = ex.getElementsByTagName( 'input' ).item( 0 );
          if ( ii.checked ) {
            nexs.push( dec( ii.value ) );
          }
        }
        if ( !!newpat ) {
          nexs[ nexs.length ] = newpat;
        }
        ods( JSON.stringify( nexs ) );
        sss.setItem( kExcludeKey, JSON.stringify( nexs ) );
        createExcludSection();
        ev.preventDefault();
      },
      false );
    sec = Q.dom.div( { 'id': kExcludeKey }, Q.dom.h1( {}, 'prefetch @exclude' ), frm );
    if ( ( tmp = doc.getElementById( kExcludeKey ) ) ) {
      body.replaceChild( sec, tmp );
    }
    else {
      body.appendChild( sec );
    }
  }
  createExcludSection();
})();