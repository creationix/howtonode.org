var redis = require('redis-client')
  , nerve = require('nerve')
  , sys = require('sys')
  , qs = require('querystring')
  , cp = require('child_process')
  , _ = require('underscore')._;

var languages = 
 [["apacheconf", "ApacheConf"],
  ["applescript", "AppleScript"],
  ["as", "ActionScript"],
  ["as3", "ActionScript 3"],
  ["basemake", "Makefile"],
  ["bash", "Bash"],
  ["bat", "Batchfile"],
  ["bbcode", "BBCode"],
  ["befunge", "Befunge"],
  ["boo", "Boo"],
  ["brainfuck", "Brainfuck"],
  ["c", "C"],
  ["c-objdump", "c-objdump"],
  ["cheetah", "Cheetah"],
  ["clojure", "Clojure"],
  ["common-lisp", "Common Lisp"],
  ["control", "Debian Control file"],
  ["cpp", "C++"],
  ["cpp-objdump", "cpp-objdump"],
  ["csharp", "C#"],
  ["css", "CSS"],
  ["css+django", "CSS+Django/Jinja"],
  ["css+erb", "CSS+Ruby"],
  ["css+genshitext", "CSS+Genshi Text"],
  ["css+mako", "CSS+Mako"],
  ["css+mako", "CSS+Mako"],
  ["css+myghty", "CSS+Myghty"],
  ["css+php", "CSS+PHP"],
  ["css+smarty", "CSS+Smarty"],
  ["d", "D"],
  ["d-objdump", "d-objdump"],
  ["delphi", "Delphi"],
  ["diff", "Diff"],
  ["django", "Django/Jinja"],
  ["dpatch", "Darcs Patch"],
  ["dylan", "Dylan"],
  ["erb", "ERB"],
  ["erlang", "Erlang"],
  ["fortran", "Fortran"],
  ["gas", "GAS"],
  ["genshi", "Genshi"],
  ["genshitext", "Genshi Text"],
  ["gnuplot", "Gnuplot"],
  ["groff", "Groff"],
  ["haskell", "Haskell"],
  ["html", "HTML"],
  ["html+cheetah", "HTML+Cheetah"],
  ["html+django", "HTML+Django/Jinja"],
  ["html+genshi", "HTML+Genshi"],
  ["html+mako", "HTML+Mako"],
  ["html+mako", "HTML+Mako"],
  ["html+myghty", "HTML+Myghty"],
  ["html+php", "HTML+PHP"],
  ["html+smarty", "HTML+Smarty"],
  ["ini", "INI"],
  ["io", "Io"],
  ["irc", "IRC logs"],
  ["java", "Java"],
  ["js", "JavaScript"],
  ["js+cheetah", "JavaScript+Cheetah"],
  ["js+django", "JavaScript+Django/Jinja"],
  ["js+erb", "JavaScript+Ruby"],
  ["js+genshitext", "JavaScript+Genshi Text"],
  ["js+mako", "JavaScript+Mako"],
  ["js+mako", "JavaScript+Mako"],
  ["js+myghty", "JavaScript+Myghty"],
  ["js+php", "JavaScript+PHP"],
  ["js+smarty", "JavaScript+Smarty"],
  ["jsp", "Java Server Page"],
  ["lhs", "Literate Haskell"],
  ["lighty", "Lighttpd configuration file"],
  ["llvm", "LLVM"],
  ["logtalk", "Logtalk"],
  ["lua", "Lua"],
  ["make", "Makefile"],
  ["mako", "Mako"],
  ["mako", "Mako"],
  ["matlab", "Matlab"],
  ["matlabsession", "Matlab session"],
  ["minid", "MiniD"],
  ["moocode", "MOOCode"],
  ["mupad", "MuPAD"],
  ["myghty", "Myghty"],
  ["mysql", "MySQL"],
  ["nasm", "NASM"],
  ["nginx", "Nginx configuration file"],
  ["numpy", "NumPy"],
  ["objdump", "objdump"],
  ["objective-c", "Objective-C"],
  ["ocaml", "OCaml"],
  ["perl", "Perl"],
  ["php", "PHP"],
  ["pot", "Gettext Catalog"],
  ["pov", "POVRay"],
  ["py3tb", "Python 3.0 Traceback"],
  ["pycon", "Python console session"],
  ["pytb", "Python Traceback"],
  ["python", "Python"],
  ["python3", "Python 3"],
  ["raw", "Raw token data"],
  ["rb", "Ruby"],
  ["rbcon", "Ruby irb session"],
  ["redcode", "Redcode"],
  ["rhtml", "RHTML"],
  ["rst", "reStructuredText"],
  ["scala", "Scala"],
  ["scheme", "Scheme"],
  ["smalltalk", "Smalltalk"],
  ["smarty", "Smarty"],
  ["sourceslist", "Debian Sourcelist"],
  ["splus", "S"],
  ["sql", "SQL"],
  ["sqlite3", "sqlite3con"],
  ["squidconf", "SquidConf"],
  ["tcl", "Tcl"],
  ["tcsh", "Tcsh"],
  ["tex", "TeX"],
  ["text", "Text only"],
  ["trac-wiki", "MoinMoin/Trac Wiki markup"],
  ["vb.net", "VB.net"],
  ["vim", "VimL"],
  ["xml", "XML"],
  ["xml+cheetah", "XML+Cheetah"],
  ["xml+django", "XML+Django/Jinja"],
  ["xml+erb", "XML+Ruby"],
  ["xml+mako", "XML+Mako"],
  ["xml+mako", "XML+Mako"],
  ["xml+myghty", "XML+Myghty"],
  ["xml+php", "XML+PHP"],
  ["xml+smarty", "XML+Smarty"],
  ["xslt", "XSLT"],
  ["yaml", "YAML"]];

var genLanguageList = function() {
  return languages.map( function(lang) {
    return '<option value="' + lang[0] + '">' + lang[1] + '</option>';
  } );
}

//formHtml
var formHtml = '<form action="/add" method="post">'
      +  '<label for="code">Paste code</label><br>'
      +  '<textarea name="code" rows="25" cols="80"></textarea><br>'
      +  '<label for="language">Language</label>'
      +  '<select name="language">'
      +  genLanguageList()
      +  '</select>'
      +  '<input type="submit" value="Paste!" /></form>';

//getPostParams
var getPostParams = function(req, callback){ 
  var body = ''; 
  req.addListener('data', function(chunk){
     body += chunk;
   }) 
   .addListener('end', function() { 
     var obj = qs.parse(  body.replace( /\+/g, ' ' ) ) ;
     callback( obj );
   });
} 

//addSnippet
var addSnippet = function( req, res ) {
  getPostParams( req, function( obj ) {
      var r = redis.createClient();

      r.stream.addListener( 'connect', function() {
        r.incr( 'nextid' , function( err, id ) {
          r.set( 'snippet:'+id, JSON.stringify( obj ), function() {
            var msg = 'The snippet has been saved at <a href="/'+id+'">'+req.headers.host+'/'+id+'</a>';
            res.respond( msg );
          } );
        } );
      } );
    });
};

//showSnippet
var showSnippet = function( req, res, id ) {
    var r = redis.createClient();
    r.stream.addListener( 'connect', function() {
      r.get( 'snippet:'+id, function( err, data ) {
        if( !data ) {
          res.sendHeader( 404 );
          res.write( "No such snippet" );
          res.end();
          return;
        }

        res.sendHeader( 200, { "Content-Type" : "text/html" } );

        var obj = JSON.parse( data.toString() );
        var shortcode = languages.filter( function(el) { 
          return el[0] == obj.language;
        } ) [0][0];

        var pyg = cp.spawn( "pygmentize",
                          [ "-l", shortcode,
                            "-f", "html",
                            "-O", "full,style=pastie",
                            "-P", "title=Snippet #" + id ] );
        pyg.stdout.addListener( "data", function( coloured ) {
          if( coloured )
            res.write( coloured );
        } );

        pyg.addListener( 'exit', function() {
          res.end();
        });

        pyg.stdin.write( obj.code );
        pyg.stdin.end();

        r.close();
      });
  });
}

//create

nerve.create( [
  [ /^\/([0-9]+)/, showSnippet ],
  [ nerve.post("/add"), addSnippet ],
  [ "/", function( req, res ) { res.respond( formHtml ); } ]
]).listen( 8000 );

