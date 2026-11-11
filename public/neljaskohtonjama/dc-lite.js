/* Minimal runtime for the Neljaskohtonjama demo pages: {{holes}}, <sc-for>, <sc-if>, onClick handlers, setState. */
(function () {
  var current = null;
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    for (var k in patch) this.state[k] = patch[k];
    if (current) current();
  };
  window.DCLogic = DCLogic;

  function lookup(path, vals, scope) {
    var parts = path.split('.');
    var v = scope && Object.prototype.hasOwnProperty.call(scope, parts[0]) ? scope : vals;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }

  function morph(a, b) {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.replaceWith(b); return; }
    if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    if (a.nodeType !== 1) return;
    var i, at;
    for (i = a.attributes.length - 1; i >= 0; i--) { at = a.attributes[i]; if (!b.hasAttribute(at.name)) a.removeAttribute(at.name); }
    for (i = 0; i < b.attributes.length; i++) { at = b.attributes[i]; if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value); }
    var ac = Array.prototype.slice.call(a.childNodes), bc = Array.prototype.slice.call(b.childNodes);
    for (i = 0; i < bc.length; i++) { if (i < ac.length) morph(ac[i], bc[i]); else a.appendChild(bc[i]); }
    for (i = bc.length; i < ac.length; i++) ac[i].remove();
  }

  window.DC = {
    boot: function (Component, props, tplId, rootId) {
      var tpl = document.getElementById(tplId || 'tpl').textContent;
      var root = document.getElementById(rootId || 'app');
      var comp = new Component(props || {});
      var handlers = {};
      function expand(html, vals, scope, reg) {
        html = html.replace(/<sc-for\s+list="\{\{\s*([\w.]+)\s*\}\}"\s+as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, function (m, l, as, body) {
          var list = lookup(l, vals, scope) || [];
          return list.map(function (it) { var sc = Object.assign({}, scope); sc[as] = it; return expand(body, vals, sc, reg); }).join('');
        });
        var re = /<sc-if\s+value="\{\{\s*([\w.]+)\s*\}\}"[^>]*>((?:(?!<sc-if)[\s\S])*?)<\/sc-if>/g;
        while (re.test(html)) {
          re.lastIndex = 0;
          html = html.replace(re, function (m, e, body) { return lookup(e, vals, scope) ? body : ''; });
        }
        html = html.replace(/on[Cc]lick="\{\{\s*([\w.]+)\s*\}\}"/g, function (m, e) {
          var id = 'h' + (reg.n++); reg.h[id] = lookup(e, vals, scope); return 'data-dc-on="' + id + '"';
        });
        return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, function (m, e) { var v = lookup(e, vals, scope); return v == null ? '' : String(v); });
      }
      function render() {
        var vals = comp.renderVals();
        var reg = { n: 0, h: {} };
        var out = document.createElement('div');
        out.innerHTML = expand(tpl, vals, null, reg);
        handlers = reg.h;
        if (!root.firstChild) { while (out.firstChild) root.appendChild(out.firstChild); }
        else morph(root, (function () { var r = root.cloneNode(false); while (out.firstChild) r.appendChild(out.firstChild); return r; })());
      }
      root.addEventListener('click', function (e) {
        var el = e.target.closest('[data-dc-on]');
        if (!el || !root.contains(el)) return;
        var f = handlers[el.getAttribute('data-dc-on')];
        if (typeof f === 'function') { if (el.tagName === 'A') e.preventDefault(); f(e); }
      });
      current = render;
      render();
    }
  };
})();
