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
      /** opera.postError( pkg + '::' + name + ' <' + msg + '>' );/**/
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
  var SITEINFO = [],
    localSITEINFO = [
    // Daily Portal Z
    {
      url:      'http://portal.nifty.com/.*/.*/.*',
      nextLink: '//td[@align="right" and @class="tx12px"]/a'
    },
    // CNET Japan
    {
      url:      'http://japan.cnet.com/.*/story/.*',
      nextLink: '(//li[@class="next"]/a)[last()]'
    },
    // @IT
    {
      url:      'http://.*.atmarkit.co.jp/.*',
      nextLink: '(//td[@align="right" and .//img[@height="17"]]//a)[last()]'
    },
    // ASCII24 Review
    {
      url:      'http://review.ascii24.com/db/review/.*',
      nextLink: '//td[@align="right" and .//img[@src="/images/nextpage.gif"]]/a'
    },
    // ASCII.jp
    {
      url:      'http://ascii.jp/elem/.*',
      nextLink: '(//a[@class="next"])[last()]'
    },
    // ITpro
    {
      url:      'http://itpro.nikkeibp.co.jp/article/COLUMN/.*',
      nextLink: '(//td[.//img[@src="/image/2006/leaf/next.gif"]]/a)[last()]'
    },
    // SAFETY JAPAN
    {
      url:      'http://www.nikkeibp.co.jp/sj/.*',
      nextLink: '(//td[@align="right" and .//img[(@width="52" and @height="22") or @src="../shared/page/next.gif"]]//a)[last()]'
    },
    // Amazon.co.jp
    {
      url:      'http://www.amazon.co.jp/.*',
      nextLink: '(//a[@class="paginationNext"])[last()]'
    },

    // jimaku.in
    {
      url:      'http://jimaku.in/',
      nextLink: '(//a[.//img[@src="http://img.jimaku.in/img/right.gif"]])[last()]'
    },

    // 怪異・妖怪伝承データベース
    {
      url:      'http://www.nichibun.ac.jp/cgi-bin/YoukaiDB/namazu.cgi.*',
      nextLink: '(//table//p[last()]/strong[last()]/following::a)[1]'
    },

    // Yahoo!画像検索
    {
      url:      'http://image-search.yahoo.co.jp/search?.*',
      nextLink: '(.//a[@title="\u6b21\u3078"])[last()]'
    },

    // Yahoo!音声検索
    {
      url:      'http://audio.search.yahoo.co.jp/bin/query?.*',
      nextLink: '(.//td//b[last()]/following::a)[1]'
    },

    // Yahoo!ニュース検索
    {
      url:      'http://nsearch.yahoo.co.jp/bin/query?.*',
      nextLink: '(.//td[@align="right" ]/a)[last()]'
    },

    // Yahoo!オークション検索
    {
      url:      'http://search.auctions.yahoo.co.jp/jp/search?.*',
      nextLink: '(//td[@align="right" and @width="1%"]/small/b[last()]/a)[last()]'
    }
  ];

  // http://wedata.net/databases/AutoPagerize/items.json
  function updateEffSiteinfo(){
    var SITEINFOURI = 'http://wedata.net/databases/AutoPagerize/items.json';
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', SITEINFOURI );
    xhr.onreadystatechange = function(){
      if ( xhr.readyState === 4 && xhr.status === 200 ){
        var tmp = [], old = SITEINFO, item, i;
        for ( i = 0; item = localSITEINFO[ i ]; ++i ) {
          tmp[ tmp.length ] = { 'url' : item.url, 'nextLink' : item.nextLink };
        }
        try{
          var items = JSON.parse( xhr.responseText );
          ods( items.length );
          for ( i = 0; item = items[ i ]; ++i ) {
            tmp[ tmp.length ] = { 'url' : item.data.url, 'nextLink' : item.data.nextLink };
          }
        }
        catch (x) {
          ods( 'GET JSON FAILED :' + x + xhr.responseText );
        }
        SITEINFO = tmp.length > old.length ? tmp : old;
        function rg (q){
          return function(s,p1,p2){ return '"' + p1 + q + p2 + '"';};
        }
        for ( i = 0; item = SITEINFO[ i ]; ++i ) {
          if ( item.nextLink.match( /"(.*)next(.*)"/ig ) ) {
            item.prevLink = item.nextLink
              .replace( /"([^"\/]*)next([^"\/]*)"/g, rg( 'prev' ) )
              .replace( /"([^"\/]*)NEXT([^"\/]*)"/g, rg( 'PREV' ) )
              .replace( /"([^"\/]*)Next([^"\/]*)"/g, rg( 'Prev' ) )
              .replace( /"([^"\/]*)>>([^"\/]*)"/g, rg( '<<' ) )
              .replace( /"([^"\/]*)≫([^"\/]*)"/g, rg( '≪' ) );
          }
        }
        ods( SITEINFO.length );          
      }
    };
    xhr.send( null );
  }
  
 
  var kExcludeKey = 'EFFExclude';
  function getDoPrefetch( url ){
    var expats = sss.getItem(kExcludeKey);
    if ( !!expats ) {
      expats = JSON.parse(expats);
    }
    ods('expats ;' + expats + typeof expats );
    for ( var i = 0, expat; expat = expats[ i ]; ++i ){
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
    for ( i = 0; info = SITEINFO[ i ]; ++i ){
      if ( url.match( info.url ) ) {
        paths[ paths.length ] = {
          'next' : info.nextLink ? info.nextLink : path.next,
          'prev' : info.prevLink ? info.prevLink : path.prev
        };
      }
    }
    return paths;
  }
  
  win.addEventListener( 'load', function(ev) {
    updateEffSiteinfo();
    /* onmessage */
    oex.onmessage = function( ev ) {
      var msg = ev.data, src = ev.source, cmd = msg.cmd, payload = msg.payload, url, paths, prefetch;
      //ods( 'cmd:' + cmd ); ods( 'pay:' + payload );
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
      } catch (x) {
        ods('onconnect:' + x );
      }
    };
  }, false);  
})();