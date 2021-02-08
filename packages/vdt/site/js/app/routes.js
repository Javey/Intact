import App from './app';
import Vdt from '../../../src/client';

var router = new Router({
    '/': function() {
        // require(['../../pages/index'], App.run());
        router.replaceRoute('/documents');
    },
    '/documents': {
        '/:title': {
            on: function(title) {
                var qs = kpc.utils.unParam(location.hash.split('?')[1]);
                require(['../../pages/documents'], App.run({
                    index: title,
                    anchor: qs.anchor
                }));
            }
        },
        on: function() {
            router.replaceRoute('/documents/getting-started');
        }
    },
    '/benchmark': function() {
        require(['../../pages/benchmark'], App.run());
    }
}).configure({
    notfound: function() {
        router.replaceRoute('/documents');
    }
});

router.init('/');

window.Vdt = Vdt;
window.App = App;
