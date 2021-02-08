import assert from 'assert';
import {browser, isArray, indexOf} from '../src/utils';

export function innerHTML(obj, convertToLowerCase = true) {
    var zz = obj.innerHTML != null ? String(obj.innerHTML) : obj
       ,z  = zz.match(/(<.+[^>])/g);    

    if (z) {
     for ( var i=0;i<z.length;(i=i+1) ){
      var y
         ,zSaved = z[i]
         ,attrRE = /\=[a-zA-Z\.\:\[\]_\(\)\&\$\%#\@\!0-9\/]+[?\s+|?>]/g
      ;

      z[i] = z[i]
              .replace(/([<|<\/].+?\w+).+[^>]/,
                 function(a){return a.toLowerCase();
               });
      y = z[i].match(attrRE);

      if (y){
        var j   = 0
           ,len = y.length
        while(j<len){
          var replaceRE = 
               /(\=)([a-zA-Z\.\:\[\]_\(\)\&\$\%#\@\!0-9\/]+)?([\s+|?>])/g
             ,replacer  = function(){
                  var args = Array.prototype.slice.call(arguments);
                  return '="'+(convertToLowerCase 
                          ? args[2].toLowerCase() 
                          : args[2])+'"'+args[3];
                };
          z[i] = z[i].replace(y[j],y[j].replace(replaceRE,replacer));
          j+=1;
        }
       }
       zz = zz.replace(zSaved,z[i]);
     }
   }
  return zz;
} 

export const isIE8 = browser.isIE8;

export function eqlHtml(container, html, ie8Html) {
    if (!isArray(html)) {
        assert.strictEqual(innerHTML(container), isIE8 & ie8Html !== undefined ? ie8Html : html);
    } else {
        assert.strictEqual(indexOf(html, innerHTML(container)) > -1, true);
    }
}

export function dispatchEvent(target, eventName) {
    let event;
    if (document.createEvent) {
        event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
    } else if (document.createEventObject) {
        event = document.createEventObject();
        return target.fireEvent(`on${eventName}`, event);
    } else if (typeof CustomEvent !== 'undefined') {
        event = new CustomEvent(eventName);
    }
    target.dispatchEvent(event);
}
