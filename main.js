import App from './components/app';
import {Router} from 'director';
import css from './css/layout.styl';

const app = Intact.mount(App, document.getElementById('page'));

const router = Router({
    '/': function() {
        require(['./pages/index'], app.run());
    },
    '/document': {
        '/:title': {
            on: function(title) {
                require(['./pages/document'], app.run({
                    title: title
                }));
            }
        },
        on: function() {
            router.replaceRoute('/document/start');
        }
    },
    '/api': function() {
        require(['./pages/api'], app.run({
            title: 'api'
        }));
    }
}).configure({
    notfound: function() {
        router.replaceRoute('/');
    }
});

router.init('/');
