/**
 * @file Xml Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Parser from "./parser.js";


function XmlParser( streamer, params ){

    var p = params || {};

    Parser.call( this, streamer, p );

    this.xml = {

        name: this.name,
        path: this.path,
        data: {}

    };

}

XmlParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: XmlParser,
    type: "xml",

    __objName: "xml",

    _parse: function( callback ){

        // https://github.com/segmentio/xml-parser
        // MIT license

        function parse( xml ){

            xml = xml.trim();

            // strip comments
            xml = xml.replace( /<!--[\s\S]*?-->/g, '' );

            return document();

            function document(){
                return {
                    declaration: declaration(),
                    root: tag()
                }
            }

            function declaration(){
                var m = match(/^<\?xml\s*/);
                if (!m) return;
                // tag
                var node = {
                    attributes: {}
                };
                // attributes
                while (!(eos() || is('?>'))) {
                    var attr = attribute();
                    if (!attr) return node;
                    node.attributes[attr.name] = attr.value;
                }
                match(/\?>\s*/);
                return node;
            }

            function tag(){
                var m = match(/^<([\w-:.]+)\s*/);
                if (!m) return;
                // name
                var node = {
                    name: m[1],
                    attributes: {},
                    children: []
                };
                // attributes
                while (!(eos() || is('>') || is('?>') || is('/>'))) {
                    var attr = attribute();
                    if (!attr) return node;
                    node.attributes[attr.name] = attr.value;
                }
                // self closing tag
                if (match(/^\s*\/>\s*/)) {
                    return node;
                }
                match(/\??>\s*/);
                // content
                node.content = content();
                // children
                var child;
                while (child = tag()) {
                    node.children.push(child);
                }
                // closing
                match(/^<\/[\w-:.]+>\s*/);
                return node;
            }

            function content(){
                var m = match(/^([^<]*)/);
                if (m) return m[1];
                return '';
            }

            function attribute(){
                var m = match(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|\w+)\s*/);
                if (!m) return;
                return { name: m[1], value: strip(m[2]) }
            }

            function strip( val ){
                return val.replace(/^['"]|['"]$/g, '');
            }

            function match( re ){
                var m = xml.match(re);
                if (!m) return;
                xml = xml.slice(m[0].length);
                return m;
            }

            function eos(){
                return 0 == xml.length;
            }

            function is( prefix ){
                return 0 == xml.indexOf(prefix);
            }

        }

        this.xml.data = parse( this.streamer.asText() );

        callback();

    }

} );


export default XmlParser;