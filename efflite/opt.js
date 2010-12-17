(function(){
  /* aliases */
  var win = window, loc = win.location,
    doc = win.document, oex = opera.extension, sss = win.localStorage, body = doc.body,
    enc = win.encodeURIComponent, dec = win.decodeURIComponent, JSON = win.JSON;
  /* output debug string */
  var ods = (function( pkg, name ){
    return function( msg ){
      /**/ opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
    };
  })( 'efflite','opt.js' ),
    ins = function(o){ for( var i in o){ ods(o + '[' + i + '] =' + o[i]); } };
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
        var _e = doc.createElement( ele ), _as = arguments[ 0 ];
        if ( !!_as ) {
          for ( var a in _as ) {
            if ( _as[ 'hasOwnProperty' ]( a ) ) {
              _e.setAttribute( a, _as[ a ] );
            }
          }
          for ( var i = 1, n; n = arguments[ i ]; ++i ) {
            _e.appendChild( ( typeof n === 'string' ) ? doc.createTextNode( n ) :  n ); 
          }
        }
        return _e;
      };
    });
    return _dom;
  })();

  var kExcludeKey = 'EFFExclude';
  var kNewPatternKey = 'newexpat';  
  function addnewexurl(){
    var nexs = [], exs = doc.querySelectorAll('#' + kExcludeKey + '> ul > li'), newpat = doc.getElementById(kNewPatternKey).value;
    for ( var i = 0, ex; ex = exs[ i ]; ++i ){
      if ( ex.getElementsByTagName( 'input' )[ 0 ].checked ) {
        nexs.push( dec( ex.value ) );
        ods( nexs[ nexs.length ] );
      }
    }
    ods( 'nexs' + nexs.length );
    ods('neqpat<' + newpat + '>');
    if ( !!newpat ) {
      nexs[ nexs.length ] = newpat;
    }
    ods( JSON.stringify(nexs));
    sss.setItem(kExcludeKey, JSON.stringify(nexs));
    createExcludSection();
  }
  function createExcludSection(){
    var excludes = JSON.parse( sss.getItem(kExcludeKey) ) || ['/twitter\.com$/', '/tumblr\.com$/'];
    ods(excludes);
    var sec = Q.dom.div( { 'id': kExcludeKey }, Q.dom.h1( {}, '@exclude') );
    var list = Q.dom.ul(), id, tmp;
    for (var i = 0, ex; ex = excludes[i];++i){
      id = 'exurl' + i;
      list.appendChild(
        Q.dom.li(
          {},
          Q.dom.input( { 'id': id, 'checked' : 'checked', 'type' : 'checkbox', 'value' : enc(ex) } ),
          Q.dom.label( { 'for' : id }, ex )
        )
      );
    }
    sec.appendChild(list);
    var frm = Q.dom.form(
      { 'id' : 'addexclude', 'action' : '' },
      Q.dom.input( { 'type':'text', 'id': kNewPatternKey } ),
      Q.dom.input( { 'type':'submit', 'id':'addnewex' }, 'Update' )
    );
    frm.addEventListener( 'submit', function(){ addnewexurl();}, false );
    sec.appendChild(frm);
    if (( tmp = doc.getElementById(kExcludeKey) ) ) {
      body.replaceChild( sec, tmp );
    } else{
      body.appendChild(sec);
    }
  }
  createExcludSection();
})();