import App from './components/app';
import {Router} from 'director';
import css from './css/layout.styl';

Router.prototype.replaceRoute = function (i, v, val) {
  var url = this.explode();

  if (typeof i === 'number' && typeof v === 'string') {
    url[i] = v;
  }
  else if (typeof val === 'string') {
    url.splice(i, v, s);
  }
  else {
    url = [i];
  }

  var s = url;

  document.location.replace((s[0] === '#') ? s : '#' + s);
  return url;
}

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
    },
    '/blog': {
        '/:title': {
            on: function(title) {
                require(['./pages/blog'], app.run({title}));
            },
        },
        on: function() {
            router.replaceRoute('/blog/intact-v2-2-0');
        }
    },
}).configure({
    notfound: function() {
        router.replaceRoute('/');
    }
});

router.init('/');
