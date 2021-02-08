should = require('should')
Vdt = require('../dist/index')


describe 'Server', ->
    beforeEach ->
        Vdt.configure({skipWhitespace: false, disableSplitText: false})
        Vdt.setDefaults({delimiters: ['{', '}'], views: './test'})

    # it 'Render file in server', ->
        # Vdt.setDefaults({ delimiters: ['{{', '}}'], views: './test/tpl' })
        # Vdt.renderFile('index', {test: 1}).should.eql """ <!DOCTYPE html> <html> <head> <meta charset="utf-8" /> <title>advance-demo</title> <link type="text/css" rel="stylesheet" href="/static/css/test.css" /> </head> <body> <h1>index page powered by Advanced uses vdt template engine</h1> <div>{<!---->test}</div> <div>AAA</div> <div>BBB</div> <div>&lt;div&gt;{test}&lt;/div&gt;</div> <p>Hello <!---->1</p> <script type="text/javascript"> var a = 1 </script> <!----> test main <div>&lt;div&gt;test&lt;/div&gt;</div> <!----> <!----> <!----> <script type="text/javascript" src="/node_modules/vdt/dist/vdt.js"></script> <!----> <script type="text/javascript"> var a = 1; console.log(a); if (a < 2) { console.log('less than a'); } </script> <!----> </body> </html> """
        # Vdt.setDefaults('delimiters', ['{', '}'])

    it 'Require template by absolute path', ->
        global.__ROOT = __dirname
        Vdt.renderFile(__dirname + '/tpl/absolute').should.eql """
            <!DOCTYPE html>
            <div>include</div>
        """

    it 'Require template by relative path', ->
        Vdt.setDefaults({
            views: undefined
        })
        Vdt.renderFile('./test/tpl/relative').should.eql """
            <!DOCTYPE html>
            <div>include</div>
        """

        Vdt.setDefaults({
            views: './test'
        })
        Vdt.renderFile('./tpl/relative').should.eql """
            <!DOCTYPE html>
            <div>include</div>
        """

    it 'Require template by relative path of `views`', ->
        Vdt.setDefaults({
            views: './test'
        })
        Vdt.renderFile('tpl/relativeViews').should.eql """
            <!DOCTYPE html>
            <div>include</div>
        """

    it 'Render template by adding extension', ->
        Vdt.renderFile('tpl/relativeViews.vdt').should.eql """
            <!DOCTYPE html>
            <div>include</div>
        """

    it 'Render unescape text', ->
        Vdt.renderFile('tpl/unescape.vdt', {
            style: '<style>a {color: red;}</style>'
        }).should.eql """
        <!DOCTYPE html>
        <head>
            <style>a {color: red;}</style>
        </head>
        """
