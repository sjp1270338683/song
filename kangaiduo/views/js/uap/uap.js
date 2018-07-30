/*!UAP v1.2.0  |  from SGCC */
/* Zepto v1.2.0 - zepto event ajax form ie - zeptojs.com/license */
(function(global, factory) {
  if (typeof define === 'function' && define.amd)
    define(function() { return factory(global) })
  else
    factory(global)
}(this, function(window) {
  var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.matches || element.webkitMatchesSelector ||
                          element.mozMatchesSelector || element.oMatchesSelector ||
                          element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }

  function likeArray(obj) {
    var length = !!obj && 'length' in obj && obj.length,
      type = $.type(obj)

    return 'function' != type && !isWindow(obj) && (
      'array' == type || length === 0 ||
        (typeof length == 'number' && length > 0 && (length - 1) in obj)
    )
  }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overridden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overridden in plugins.
  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overridden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overridden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overridden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
      slice.call(
        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.isNumeric = function(val) {
    var num = Number(val), type = typeof val
    return val != null && type != 'boolean' &&
      (type != 'string' || val.length) &&
      !isNaN(num) && isFinite(num) || false
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }
  $.noop = function() {}

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function(){
      var i, value, args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = zepto.isZ(value) ? value.toArray() : value
      }
      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var nodes = [], collection = typeof selector == 'object' && $(selector)
      this.each(function(_, node){
        while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
          node = node !== context && !isDocument(node) && node.parentNode
        if (node && nodes.indexOf(node) < 0) nodes.push(node)
      })
      return $(nodes)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this.pluck('textContent').join("") : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    removeProp: function(name){
      name = propMap[name] || name
      return this.each(function(){ delete this[name] })
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      if (0 in arguments) {
        if (value == null) value = ""
        return this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
      } else {
        return this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
      }
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
        return {top: 0, left: 0}
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0]
        if (typeof property == 'string') {
          if (!element) return
          return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
        } else if (isArray(property)) {
          if (!element) return
          var props = {}
          var computedStyle = getComputedStyle(element, '')
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            var arr = []
            argType = type(arg)
            if (argType == "array") {
              arg.forEach(function(el) {
                if (el.nodeType !== undefined) return arr.push(el)
                else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
                arr = arr.concat(zepto.fragment(el))
              })
              return arr
            }
            return argType == "object" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src){
              var target = el.ownerDocument ? el.ownerDocument.defaultView : window
              target['eval'].call(target, el.innerHTML)
            }
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      event.timeStamp || (event.timeStamp = Date.now())

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (callback === undefined || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = +new Date(),
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  function ajaxDataFilter(data, type, settings) {
    if (settings.dataFilter == empty) return data
    var context = settings.context
    return settings.dataFilter.call(context, data, type)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
    //Used to handle the raw response data of XMLHttpRequest.
    //This is a pre-filtering function to sanitize the response.
    //The sanitized response should be returned
    dataFilter: empty
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  function replaceAllInjectionStr(str) {
	str = str.replace(/\script/g, "");
	str = str.replace(/\</g, "");
	str = str.replace(/\>/g, "");
	str = str.replace(/\(/g, "");
	str = str.replace(/\)/g, "");
	str = str.replace(/\../g, "");
	str = str.replace(/\;/g, "");
	str = str.replace(/\|/g, "");
	str = str.replace(/\%/g, "");
	str = str.replace(/\@/g, "");
	str = str.replace(/\'/g, "");
	str = str.replace(/\"/g, "");
	str = str.replace(/\,/g, "");
	str = str.replace(/\\/g, "");
	str = str.replace(/\eval/g, "");
	str = str.replace(/\expression/g, "");
	str = str.replace(/\vbscript/g, "");
	str = str.replace(/\javascript/g, "");
	str = str.replace(/\onload/g, "");
	str = str.replace(/\iframe/g, "");
	return str;
  }	
  
  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor, hashIndex
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    
    
    if (!settings.url) settings.url = replaceAllInjectionStr(window.location.toString());
    //修改application/json
    if(settings.type && settings.contentType && settings.type.toUpperCase()=='POST'&&settings.contentType.toLowerCase() == 'application/json'){
        if(uap.isPlainObject(settings.data)){
            settings.data = JSON.stringify(settings.data);
        }
    }  
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))

          if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
            result = xhr.response
          else {
            result = xhr.responseText

            try {
              // http://perfectionkills.com/global-eval-what-are-the-options/
              // sanitize response accordingly if data filter callback provided
              result = ajaxDataFilter(result, dataType, settings)
              if (dataType == 'script')    window['eval'].call(window,result) // (1,eval)(result)
              else if (dataType == 'xml')  result = xhr.responseXML
              else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
            } catch (e) { error = e }

            if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
          }

          ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function(){
  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle
    window.getComputedStyle = function(element, pseudoElement){
      try {
        return nativeGetComputedStyle(element, pseudoElement)
      } catch(e) {
        return null
      }
    }
  }
})()
  return Zepto
}))

//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    if(window.navigator.platform == "Win32") return true;
    if(!('ontouchstart' in window)) return true;
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }
  
  function isWindows(){
    if(window.navigator.platform == "Win32") return true;
    if(!('ontouchstart' in window)) return true;
  }
    
  function isPointerEventType(e, type){
    if(window.navigator.platform == "Win32") return true;
    if(!('ontouchstart' in window)) return true;
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType;
    
    var touchStart = isWindows()?'MSPointerDown pointerdown mousedown':'touchstart MSPointerDown pointerdown';
    var touchMove = isWindows()?'MSPointerMove pointermove mousemove':'touchmove MSPointerMove pointermove';
    var touchEnd = isWindows()?'MSPointerUp pointerup mouseup':'touchend MSPointerUp pointerup';
    
    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
      .on(touchStart, function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        deltaX = 0;
        deltaY = 0;
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
      .on(touchMove, function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY
        
        if(isNaN(deltaX)) deltaX = 0;
        if(isNaN(deltaY)) deltaY = 0;
        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
        touch.el && touch.el.trigger('swipeMove'+(swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)),{e:e,dx:Math.abs(touch.x1 - touch.x2),dy:Math.abs(touch.y1 - touch.y2)});
      })
      .on(touchEnd, function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30 || isWindows()) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  ;['swipeMoveLeft','swipeMoveRight','swipeMoveUp','swipeMoveDown','swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto);
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var prefix = '', eventPrefix,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
    animationName, animationDuration, animationTiming, animationDelay,
    cssReset = {}

  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay    = prefix + 'transition-delay'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationDelay     = prefix + 'animation-delay'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, ((duration + delay) * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto);

//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var document = window.document, docElem = document.documentElement,
    origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle

  function anim(el, speed, opacity, scale, callback) {
    if (typeof speed == 'function' && !callback) callback = speed, speed = undefined
    var props = { opacity: opacity }
    if (scale) {
      props.scale = scale
      el.css($.fx.cssPrefix + 'transform-origin', '0 0')
    }
    return el.animate(props, speed, null, callback)
  }

  function hide(el, speed, scale, callback) {
    return anim(el, speed, 0, scale, function(){
      origHide.call($(this))
      callback && callback.call(this)
    })
  }

  $.fn.show = function(speed, callback) {
    origShow.call(this)
    if (speed === undefined) speed = 0
    else this.css('opacity', 0)
    return anim(this, speed, 1, '1,1', callback)
  }

  $.fn.hide = function(speed, callback) {
    if (speed === undefined) return origHide.call(this)
    else return hide(this, speed, '0,0', callback)
  }

  $.fn.toggle = function(speed, callback) {
    if (speed === undefined || typeof speed == 'boolean')
      return origToggle.call(this, speed)
    else return this.each(function(){
      var el = $(this)
      el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
    })
  }

  $.fn.fadeTo = function(speed, opacity, callback) {
    return anim(this, speed, opacity, null, callback)
  }

  $.fn.fadeIn = function(speed, callback) {
    var target = this.css('opacity')
    if (target > 0) this.css('opacity', 0)
    else target = 1
    return origShow.call(this).fadeTo(speed, target, callback)
  }

  $.fn.fadeOut = function(speed, callback) {
    return hide(this, speed, null, callback)
  }

  $.fn.fadeToggle = function(speed, callback) {
    return this.each(function(){
      var el = $(this)
      el[
        (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
      ](speed, callback)
    })
  }

})(Zepto);
;
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));
//     Backbone.js 1.3.3

//     (c) 2010-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self === self && self) ||
            (typeof global == 'object' && global.global === global && global);

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), $;
    try { $ = require('jquery'); } catch (e) {}
    factory(root, exports, _, $);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

})(function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to a common array method we'll want to use later.
  var slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.3.3';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... this will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Proxy Backbone class methods to Underscore functions, wrapping the model's
  // `attributes` object or collection's `models` array behind the scenes.
  //
  // collection.filter(function(model) { return model.get('age') > 10 });
  // collection.each(this.addView);
  //
  // `Function#apply` can be slow so we use the method's arg count, if we know it.
  var addMethod = function(length, method, attribute) {
    switch (length) {
      case 1: return function() {
        return _[method](this[attribute]);
      };
      case 2: return function(value) {
        return _[method](this[attribute], value);
      };
      case 3: return function(iteratee, context) {
        return _[method](this[attribute], cb(iteratee, this), context);
      };
      case 4: return function(iteratee, defaultVal, context) {
        return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
      };
      default: return function() {
        var args = slice.call(arguments);
        args.unshift(this[attribute]);
        return _[method].apply(_, args);
      };
    }
  };
  var addUnderscoreMethods = function(Class, methods, attribute) {
    _.each(methods, function(length, method) {
      if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
    });
  };

  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
  var cb = function(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
    return iteratee;
  };
  var modelMatcher = function(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
      return matcher(model.attributes);
    };
  };

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // a custom event channel. You may bind a callback to an event with `on` or
  // remove with `off`; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {};

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`).
  var eventsApi = function(iteratee, events, name, callback, opts) {
    var i = 0, names;
    if (name && typeof name === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (names = _.keys(name); i < names.length ; i++) {
        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        events = iteratee(events, names[i], callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  };

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  Events.on = function(name, callback, context) {
    return internalOn(this, name, callback, context);
  };

  // Guard the `listening` argument from the public API.
  var internalOn = function(obj, name, callback, context, listening) {
    obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
      context: context,
      ctx: obj,
      listening: listening
    });

    if (listening) {
      var listeners = obj._listeners || (obj._listeners = {});
      listeners[listening.id] = listening;
    }

    return obj;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  Events.listenTo = function(obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
      listening = listeningTo[id] = {obj: obj, objId: id, id: thisId, listeningTo: listeningTo, count: 0};
    }

    // Bind callbacks on obj, and keep track of them on listening.
    internalOn(obj, name, callback, this, listening);
    return this;
  };

  // The reducing API that adds a callback to the `events` object.
  var onApi = function(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context, ctx = options.ctx, listening = options.listening;
      if (listening) listening.count++;

      handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
    }
    return events;
  };

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  Events.off = function(name, callback, context) {
    if (!this._events) return this;
    this._events = eventsApi(offApi, this._events, name, callback, {
      context: context,
      listeners: this._listeners
    });
    return this;
  };

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  Events.stopListening = function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);

    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(name, callback, this);
    }

    return this;
  };

  // The reducing API that removes a callback from the `events` object.
  var offApi = function(events, name, callback, options) {
    if (!events) return;

    var i = 0, listening;
    var context = options.context, listeners = options.listeners;

    // Delete all events listeners and "drop" events.
    if (!name && !callback && !context) {
      var ids = _.keys(listeners);
      for (; i < ids.length; i++) {
        listening = listeners[ids[i]];
        delete listeners[listening.id];
        delete listening.listeningTo[listening.objId];
      }
      return;
    }

    var names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
      name = names[i];
      var handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) break;

      // Replace events if there are any remaining.  Otherwise, clean up.
      var remaining = [];
      for (var j = 0; j < handlers.length; j++) {
        var handler = handlers[j];
        if (
          callback && callback !== handler.callback &&
            callback !== handler.callback._callback ||
              context && context !== handler.context
        ) {
          remaining.push(handler);
        } else {
          listening = handler.listening;
          if (listening && --listening.count === 0) {
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
          }
        }
      }

      // Update tail event if the list has any events.  Otherwise, clean up.
      if (remaining.length) {
        events[name] = remaining;
      } else {
        delete events[name];
      }
    }
    return events;
  };

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  Events.once = function(name, callback, context) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
    if (typeof name === 'string' && context == null) callback = void 0;
    return this.on(events, callback, context);
  };

  // Inversion-of-control versions of `once`.
  Events.listenToOnce = function(obj, name, callback) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
    return this.listenTo(obj, events);
  };

  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
  // `offer` unbinds the `onceWrapper` after it has been called.
  var onceMap = function(map, name, callback, offer) {
    if (callback) {
      var once = map[name] = _.once(function() {
        offer(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
    }
    return map;
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.trigger = function(name) {
    if (!this._events) return this;

    var length = Math.max(0, arguments.length - 1);
    var args = Array(length);
    for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

    eventsApi(triggerApi, this._events, name, void 0, args);
    return this;
  };

  // Handles triggering the appropriate event callbacks.
  var triggerApi = function(objEvents, name, callback, args) {
    if (objEvents) {
      var events = objEvents[name];
      var allEvents = objEvents.all;
      if (events && allEvents) allEvents = allEvents.slice();
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, [name].concat(args));
    }
    return objEvents;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    var defaults = _.result(this, 'defaults');
    attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // The prefix is used to create the client id which is used to identify models locally.
    // You may want to override this if you're experiencing name clashes with model ids.
    cidPrefix: 'c',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function(attrs) {
      return !!_.iteratee(attrs, this)(this.attributes);
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      var unset      = options.unset;
      var silent     = options.silent;
      var changes    = [];
      var changing   = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }

      var current = this.attributes;
      var changed = this.changed;
      var prev    = this._previousAttributes;

      // For each `set` attribute, update or delete the current value.
      for (var attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          changed[attr] = val;
        } else {
          delete changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Update the `id`.
      if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0; i < changes.length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var changed = {};
      for (var attr in diff) {
        var val = diff[attr];
        if (_.isEqual(old[attr], val)) continue;
        changed[attr] = val;
      }
      return _.size(changed) ? changed : false;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (!model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true, parse: true}, options);
      var wait = options.wait;

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !wait) {
        if (!this.set(attrs, options)) return false;
      } else if (!this._validate(attrs, options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      var attributes = this.attributes;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
        if (serverAttrs && !model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

      var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch' && !options.attrs) options.attrs = attrs;
      var xhr = this.sync(method, this, options);

      // Restore attributes.
      this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function() {
        model.stopListening();
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (wait) destroy();
        if (success) success.call(options.context, model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      var xhr = false;
      if (this.isNew()) {
        _.defer(options.success);
      } else {
        wrapError(this, options);
        xhr = this.sync('delete', this, options);
      }
      if (!wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend({}, options, {validate: true}));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model, mapped to the
  // number of arguments they take.
  var modelMethods = {keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
      omit: 0, chain: 1, isEmpty: 1};

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  addUnderscoreMethods(Model, modelMethods, 'attributes');

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Splices `insert` into `array` at index `at`.
  var splice = function(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    var i;
    for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
    for (i = 0; i < length; i++) array[i + at] = insert[i];
    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model) { return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set. `models` may be Backbone
    // Models or raw JavaScript objects to be converted to Models, or any
    // combination of the two.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      options = _.extend({}, options);
      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();
      var removed = this._removeModels(models, options);
      if (!options.silent && removed.length) {
        options.changes = {added: [], merged: [], removed: removed};
        this.trigger('update', this, options);
      }
      return singular ? removed[0] : removed;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      if (models == null) return;

      options = _.extend({}, setOptions, options);
      if (options.parse && !this._isModel(models)) {
        models = this.parse(models, options) || [];
      }

      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();

      var at = options.at;
      if (at != null) at = +at;
      if (at > this.length) at = this.length;
      if (at < 0) at += this.length + 1;

      var set = [];
      var toAdd = [];
      var toMerge = [];
      var toRemove = [];
      var modelMap = {};

      var add = options.add;
      var merge = options.merge;
      var remove = options.remove;

      var sort = false;
      var sortable = this.comparator && at == null && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      var model, i;
      for (i = 0; i < models.length; i++) {
        model = models[i];

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        var existing = this.get(model);
        if (existing) {
          if (merge && model !== existing) {
            var attrs = this._isModel(model) ? model.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
            if (sortable && !sort) sort = existing.hasChanged(sortAttr);
          }
          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(model, options);
          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }
        }
      }

      // Remove stale models.
      if (remove) {
        for (i = 0; i < this.length; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) toRemove.push(model);
        }
        if (toRemove.length) this._removeModels(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      var orderChanged = false;
      var replace = !sortable && add && remove;
      if (set.length && replace) {
        orderChanged = this.length !== set.length || _.some(this.models, function(m, index) {
          return m !== set[index];
        });
        this.models.length = 0;
        splice(this.models, set, 0);
        this.length = this.models.length;
      } else if (toAdd.length) {
        if (sortable) sort = true;
        splice(this.models, toAdd, at == null ? this.length : at);
        this.length = this.models.length;
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort/update events.
      if (!options.silent) {
        for (i = 0; i < toAdd.length; i++) {
          if (at != null) options.index = at + i;
          model = toAdd[i];
          model.trigger('add', model, this, options);
        }
        if (sort || orderChanged) this.trigger('sort', this, options);
        if (toAdd.length || toRemove.length || toMerge.length) {
          options.changes = {
            added: toAdd,
            removed: toRemove,
            merged: toMerge
          };
          this.trigger('update', this, options);
        }
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      for (var i = 0; i < this.models.length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      return this.remove(model, options);
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      return this.remove(model, options);
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id, cid, model object with id or cid
    // properties, or an attributes object that is transformed through modelId.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] ||
        this._byId[this.modelId(obj.attributes || obj)] ||
        obj.cid && this._byId[obj.cid];
    },

    // Returns `true` if the model is in the collection.
    has: function(obj) {
      return this.get(obj) != null;
    },

    // Get the model at the given index.
    at: function(index) {
      if (index < 0) index += this.length;
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      return this[first ? 'find' : 'filter'](attrs);
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      var comparator = this.comparator;
      if (!comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      var length = comparator.length;
      if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

      // Run sort based on type of `comparator`.
      if (length === 1 || _.isString(comparator)) {
        this.models = this.sortBy(comparator);
      } else {
        this.models.sort(comparator);
      }
      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return this.map(attr + '');
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success.call(options.context, collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      var wait = options.wait;
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(m, resp, callbackOpts) {
        if (wait) collection.add(m, callbackOpts);
        if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function(attrs) {
      return attrs[this.model.prototype.idAttribute || 'id'];
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (this._isModel(attrs)) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method called by both remove and set.
    _removeModels: function(models, options) {
      var removed = [];
      for (var i = 0; i < models.length; i++) {
        var model = this.get(models[i]);
        if (!model) continue;

        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;

        // Remove references before triggering 'remove' event to prevent an
        // infinite loop. #3693
        delete this._byId[model.cid];
        var id = this.modelId(model.attributes);
        if (id != null) delete this._byId[id];

        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }

        removed.push(model);
        this._removeReference(model, options);
      }
      return removed;
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function(model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      var id = this.modelId(model.attributes);
      if (id != null) this._byId[id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      delete this._byId[model.cid];
      var id = this.modelId(model.attributes);
      if (id != null) delete this._byId[id];
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if (model) {
        if ((event === 'add' || event === 'remove') && collection !== this) return;
        if (event === 'destroy') this.remove(model, options);
        if (event === 'change') {
          var prevId = this.modelId(model.previousAttributes());
          var id = this.modelId(model.attributes);
          if (prevId !== id) {
            if (prevId != null) delete this._byId[prevId];
            if (id != null) this._byId[id] = model;
          }
        }
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var collectionMethods = {forEach: 3, each: 3, map: 3, collect: 3, reduce: 0,
      foldl: 0, inject: 0, reduceRight: 0, foldr: 0, find: 3, detect: 3, filter: 3,
      select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
      contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
      head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
      without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
      isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
      sortBy: 3, indexBy: 3, findIndex: 3, findLastIndex: 3};

  // Mix in each Underscore method as a proxy to `Collection#models`.
  addUnderscoreMethods(Collection, collectionMethods, 'models');

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be set as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(element) {
      this.undelegateEvents();
      this._setElement(element);
      this.delegateEvents();
      return this;
    },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
    // context or an element. Subclasses can override this to utilize an
    // alternative DOM manipulation API and are only required to set the
    // `this.el` property.
    _setElement: function(el) {
      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
      this.el = this.$el[0];
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function(events) {
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], _.bind(method, this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this.setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, 'el'));
      }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        if (router.execute(callback, args, name) !== false) {
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        }
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    this.checkUrl = _.bind(this.checkUrl, this);

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.getSearch();
    },

    // Does the pathname match the root?
    matchRoot: function() {
      var path = this.decodeFragment(this.location.pathname);
      var rootPath = path.slice(0, this.root.length - 1) + '/';
      return rootPath === this.root;
    },

    // Unicode characters in `location.pathname` are percent encoded so they're
    // decoded for comparison. `%25` should not be decoded since it may be part
    // of an encoded parameter.
    decodeFragment: function(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    // In IE6, the hash fragment and search params are incorrect if the
    // fragment contains `?`.
    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function() {
      var path = this.decodeFragment(
        this.location.pathname + this.getSearch()
      ).slice(this.root.length - 1);
      return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function(fragment) {
      if (fragment == null) {
        if (this._usePushState || !this._wantsHashChange) {
          fragment = this.getPath();
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error('Backbone.history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange   = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
      this._useHashChange   = this._wantsHashChange && this._hasHashChange;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.history && this.history.pushState);
      this._usePushState    = this._wantsPushState && this._hasPushState;
      this.fragment         = this.getFragment();

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          var rootPath = this.root.slice(0, -1) || '/';
          this.location.replace(rootPath + '#' + this.getPath());
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot()) {
          this.navigate(this.getHash(), {replace: true});
        }

      }

      // Proxy an iframe to handle location events if the browser doesn't
      // support the `hashchange` event, HTML5 history, or the user wants
      // `hashChange` but not `pushState`.
      if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'javascript:0';
        this.iframe.style.display = 'none';
        this.iframe.tabIndex = -1;
        var body = document.body;
        // Using `appendChild` will throw on IE < 9 if the document is not ready.
        var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
        iWindow.document.open();
        iWindow.document.close();
        iWindow.location.hash = '#' + this.fragment;
      }

      // Add a cross-platform `addEventListener` shim for older browsers.
      var addEventListener = window.addEventListener || function(eventName, listener) {
        return attachEvent('on' + eventName, listener);
      };

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._usePushState) {
        addEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        addEventListener('hashchange', this.checkUrl, false);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function(eventName, listener) {
        return detachEvent('on' + eventName, listener);
      };

      // Remove window listeners.
      if (this._usePushState) {
        removeEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        removeEventListener('hashchange', this.checkUrl, false);
      }

      // Clean up the iframe if necessary.
      if (this.iframe) {
        document.body.removeChild(this.iframe);
        this.iframe = null;
      }

      // Some environments will throw when clearing an undefined interval.
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();

      // If the user pressed the back button, the iframe's hash will have
      // changed and we should use that for comparison.
      if (current === this.fragment && this.iframe) {
        current = this.getHash(this.iframe.contentWindow);
      }

      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      // Normalize the fragment.
      fragment = this.getFragment(fragment || '');

      // Don't include a trailing slash on the root.
      var rootPath = this.root;
      if (fragment === '' || fragment.charAt(0) === '?') {
        rootPath = rootPath.slice(0, -1) || '/';
      }
      var url = rootPath + fragment;

      // Strip the hash and decode for matching.
      fragment = this.decodeFragment(fragment.replace(pathStripper, ''));

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._usePushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
          var iWindow = this.iframe.contentWindow;

          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if (!options.replace) {
            iWindow.document.open();
            iWindow.document.close();
          }

          this._updateHash(iWindow.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;
});

/**
 * Backbone-Nested 2.0.4 - An extension of Backbone.js that keeps track of nested attributes
 *
 * http://afeld.github.com/backbone-nested/
 *
 * Copyright (c) 2011-2012 Aidan Feldman
 * MIT Licensed (LICENSE)
 */
/*global define, require, module */
(function(root, factory){
  if (typeof exports !== 'undefined') {
      // Define as CommonJS export:
      module.exports = factory(require("jquery"), require("underscore"), require("backbone"));
  } else if (typeof define === 'function' && define.amd) {
      // Define as AMD:
      define(["jquery", "underscore", "backbone"], factory);
  } else {
      // Just run it:
      factory(root.$, root._, root.Backbone);
  }
}(this, function($, _, Backbone) {
  'use strict';


  Backbone.NestedModel = Backbone.Model.extend({

    get: function(attrStrOrPath){
      return Backbone.NestedModel.walkThenGet(this.attributes, attrStrOrPath);
    },

    previous: function(attrStrOrPath){
      return Backbone.NestedModel.walkThenGet(this._previousAttributes, attrStrOrPath);
    },

    has: function(attr){
      // for some reason this is not how Backbone.Model is implemented - it accesses the attributes object directly
      var result = this.get(attr);
      return !(result === null || _.isUndefined(result));
    },

    set: function(key, value, opts){
      var newAttrs = Backbone.NestedModel.deepClone(this.attributes),
        attrPath,
        unsetObj,
        validated;

      if (_.isString(key)){
        // Backbone 0.9.0+ syntax: `model.set(key, val)` - convert the key to an attribute path
        attrPath = Backbone.NestedModel.attrPath(key);
      } else if (_.isArray(key)){
        // attribute path
        attrPath = key;
      }

      if (attrPath){
        opts = opts || {};
        this._setAttr(newAttrs, attrPath, value, opts);
      } else { // it's an Object
        opts = value || {};
        var attrs = key;
        for (var _attrStr in attrs) {
          if (attrs.hasOwnProperty(_attrStr)) {
            this._setAttr(newAttrs,
                          Backbone.NestedModel.attrPath(_attrStr),
                          opts.unset ? void 0 : attrs[_attrStr],
                          opts);
          }
        }
      }

      this._nestedChanges = Backbone.NestedModel.__super__.changedAttributes.call(this);

      if (opts.unset && attrPath && attrPath.length === 1){ // assume it is a singular attribute being unset
        // unsetting top-level attribute
        unsetObj = {};
        unsetObj[key] = void 0;
        this._nestedChanges = _.omit(this._nestedChanges, _.keys(unsetObj));
        validated = Backbone.NestedModel.__super__.set.call(this, unsetObj, opts);
      } else {
        unsetObj = newAttrs;

        // normal set(), or an unset of nested attribute
        if (opts.unset && attrPath){
          // make sure Backbone.Model won't unset the top-level attribute
          opts = _.extend({}, opts);
          delete opts.unset;
        } else if (opts.unset && _.isObject(key)) {
          unsetObj = key;
        }
        this._nestedChanges = _.omit(this._nestedChanges, _.keys(unsetObj));
        validated = Backbone.NestedModel.__super__.set.call(this, unsetObj, opts);
      }


      if (!validated){
        // reset changed attributes
        this.changed = {};
        this._nestedChanges = {};
        return false;
      }


      this._runDelayedTriggers();
      return this;
    },

    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    clear: function(options) {
      this._nestedChanges = {};

      // Mostly taken from Backbone.Model.set, modified to work for NestedModel.
      options = options || {};
      // clone attributes so validate method can't mutate it from underneath us.
      var attrs = _.clone(this.attributes);
      if (!options.silent && this.validate && !this.validate(attrs, options)) {
        return false; // Should maybe return this instead?
      }

      var changed = this.changed = {};
      var model = this;

      var setChanged = function(obj, prefix, options) {
        // obj will be an Array or an Object
        _.each(obj, function(val, attr){
          var changedPath = prefix;
          if (_.isArray(obj)){
            // assume there is a prefix
            changedPath += '[' + attr + ']';
          } else if (prefix){
            changedPath += '.' + attr;
          } else {
            changedPath = attr;
          }

          val = obj[attr];
          if (_.isObject(val)) { // clear child attrs
            setChanged(val, changedPath, options);
          }
          if (!options.silent) model._delayedChange(changedPath, null, options);
          changed[changedPath] = null;
        });
      };
      setChanged(this.attributes, '', options);

      this.attributes = {};

      // Fire the `"change"` events.
      if (!options.silent) this._delayedTrigger('change');

      this._runDelayedTriggers();
      return this;
    },

    add: function(attrStr, value, opts){
      var current = this.get(attrStr);
      if (!_.isArray(current)) throw new Error('current value is not an array');
      return this.set(attrStr + '[' + current.length + ']', value, opts);
    },

    remove: function(attrStr, opts){
      opts = opts || {};

      var attrPath = Backbone.NestedModel.attrPath(attrStr),
        aryPath = _.initial(attrPath),
        val = this.get(aryPath),
        i = _.last(attrPath);

      if (!_.isArray(val)){
        throw new Error("remove() must be called on a nested array");
      }

      // only trigger if an element is actually being removed
      var trigger = !opts.silent && (val.length >= i + 1),
        oldEl = val[i];

      // remove the element from the array
      val.splice(i, 1);
      opts.silent = true; // Triggers should only be fired in trigger section below
      this.set(aryPath, val, opts);

      if (trigger){
        attrStr = Backbone.NestedModel.createAttrStr(aryPath);
        this.trigger('remove:' + attrStr, this, oldEl);
        for (var aryCount = aryPath.length; aryCount >= 1; aryCount--) {
          attrStr = Backbone.NestedModel.createAttrStr(_.first(aryPath, aryCount));
          this.trigger('change:' + attrStr, this, oldEl);
        }
        this.trigger('change', this, oldEl);
      }

      return this;
    },

    changedAttributes: function(diff) {
      var backboneChanged = Backbone.NestedModel.__super__.changedAttributes.call(this, diff);
      if (_.isObject(backboneChanged)) {
        return _.extend({}, this._nestedChanges, backboneChanged);
      }
      return false;
    },

    toJSON: function(){
      return Backbone.NestedModel.deepClone(this.attributes);
    },


    // private
    _getDelayedTriggers: function(){
        if (typeof this._delayedTriggers === "undefined"){
            this._delayedTriggers = [];
        }
        return this._delayedTriggers;
    },
    _delayedTrigger: function(/* the trigger args */){
      this._getDelayedTriggers().push(arguments);
    },

    _delayedChange: function(attrStr, newVal, options){
      this._delayedTrigger('change:' + attrStr, this, newVal, options);

      // Check if `change` even *exists*, as it won't when the model is
      // freshly created.
      if (!this.changed) {
        this.changed = {};
      }

      this.changed[attrStr] = newVal;
    },

    _runDelayedTriggers: function(){
      while (this._getDelayedTriggers().length > 0){
        this.trigger.apply(this, this._getDelayedTriggers().shift());
      }
    },

    // note: modifies `newAttrs`
    _setAttr: function(newAttrs, attrPath, newValue, opts){
      opts = opts || {};

      var fullPathLength = attrPath.length;
      var model = this;

      Backbone.NestedModel.walkPath(newAttrs, attrPath, function(val, path, next){
        var attr = _.last(path);
        var attrStr = Backbone.NestedModel.createAttrStr(path);

        // See if this is a new value being set
        var isNewValue = !_.isEqual(val[attr], newValue);

        if (path.length === fullPathLength){
          // reached the attribute to be set

          if (opts.unset){
            // unset the value
            delete val[attr];

            // Trigger Remove Event if array being set to null
            if (_.isArray(val)){
              var parentPath = Backbone.NestedModel.createAttrStr(_.initial(attrPath));
              model._delayedTrigger('remove:' + parentPath, model, val[attr]);
            }
          } else {
            // Set the new value
            val[attr] = newValue;
          }

          // Trigger Change Event if new values are being set
          if (!opts.silent && _.isObject(newValue) && isNewValue){
            var visited = [];
            var checkChanges = function(obj, prefix) {
              // Don't choke on circular references
              if(_.indexOf(visited, obj) > -1) {
                return;
              } else {
                visited.push(obj);
              }

              var nestedAttr, nestedVal;
              for (var a in obj){
                if (obj.hasOwnProperty(a)) {
                  nestedAttr = prefix + '.' + a;
                  nestedVal = obj[a];
                  if (!_.isEqual(model.get(nestedAttr), nestedVal)) {
                    model._delayedChange(nestedAttr, nestedVal, opts);
                  }
                  if (_.isObject(nestedVal)) {
                    checkChanges(nestedVal, nestedAttr);
                  }
                }
              }
            };
            checkChanges(newValue, attrStr);

          }


        } else if (!val[attr]){
          if (_.isNumber(next)){
            val[attr] = [];
          } else {
            val[attr] = {};
          }
        }

        if (!opts.silent){
          // let the superclass handle change events for top-level attributes
          if (path.length > 1 && isNewValue){
            model._delayedChange(attrStr, val[attr], opts);
          }

          if (_.isArray(val[attr])){
            model._delayedTrigger('add:' + attrStr, model, val[attr]);
          }
        }
      });
    }

  }, {
    // class methods

    attrPath: function(attrStrOrPath){
      var path;

      if (_.isString(attrStrOrPath)){
        // TODO this parsing can probably be more efficient
        path = (attrStrOrPath === '') ? [''] : attrStrOrPath.match(/[^\.\[\]]+/g);
        path = _.map(path, function(val){
          // convert array accessors to numbers
          return val.match(/^\d+$/) ? parseInt(val, 10) : val;
        });
      } else {
        path = attrStrOrPath;
      }

      return path;
    },

    createAttrStr: function(attrPath){
      var attrStr = attrPath[0];
      _.each(_.rest(attrPath), function(attr){
        attrStr += _.isNumber(attr) ? ('[' + attr + ']') : ('.' + attr);
      });

      return attrStr;
    },

    deepClone: function(obj){
      return $.extend(true, {}, obj);
    },

    walkPath: function(obj, attrPath, callback, scope){
      var val = obj,
        childAttr;

      // walk through the child attributes
      for (var i = 0; i < attrPath.length; i++){
        callback.call(scope || this, val, attrPath.slice(0, i + 1), attrPath[i + 1]);

        childAttr = attrPath[i];
        val = val[childAttr];
        if (!val) break; // at the leaf
      }
    },

    walkThenGet: function(attributes, attrStrOrPath){
      var attrPath = Backbone.NestedModel.attrPath(attrStrOrPath),
        result;

      Backbone.NestedModel.walkPath(attributes, attrPath, function(val, path){
        var attr = _.last(path);
        if (path.length === attrPath.length){
          // attribute found
          result = val[attr];
        }
      });

      return result;
    }

  });

  return Backbone;
}));

/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:uap 基础对象
    created:2014,08.18
    update:2013.08.22 by dushaobin


*/
/* global window */
;(function(global){
    var uap = {};
    var isUexReady = false;
    var readyQueue = [];
    var isuap =false;
    //uap 相关模块
    uap.modules = {};
    
    //获取唯一id
    var getUID = function(){
        var maxId = 65536;
        var uid = 0;
        return function(){
            uid = (uid+1)%maxId;
            return uid;
        };
    }();
    
    //获取随机的唯一id，随机不重复，长度固定
    var getUUID = function(len){
        len = len || 6;
        len = parseInt(len,10);
        len = isNaN(len)?6:len;
        var seed = '0123456789abcdefghijklmnopqrstubwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ';
        var seedLen = seed.length - 1;
        var uuid = '';
        while(len--){
            uuid += seed[Math.round(Math.random()*seedLen)]
        }
        return uuid;
    }
    
    //是否是函数
    var isFunction = function(obj){
        return Object.prototype.toString.call(obj) === '[object Function]';
    };
    //是否是字符串
    var isString = function(obj){
        return Object.prototype.toString.call(obj) === '[object String]';
    };
    //是否是object对象
    var isObject = function(obj){
        return Object.prototype.toString.call(obj) === '[object Object]';
    };
    //是否是数组
    var isArray = function(obj){
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    //是否是window对象
    var isWindow = function(obj){
        return obj != null && obj == obj.window;
    };
    //是否是纯对象
    var isPlainObject = function (obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    };
    //扩展对象
    var extend = function(target, source, deep) {
        var key = null;
        for (key in source){
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])){
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])){
                    target[key] = [];
                }
                extend(target[key], source[key], deep);
            }
            else if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
        return target;
    };
    
    //添加uap 版本
    uap.version = '1.0.0 Beta';
    
    var errorInfo = {
        moduleName:'模块的名字必须为字符串并且不能为空！',
        moduleFactory:'模块构造对象必须是函数！'
    };

    //定义一个模块，或者插件
    uap.define = function(name,factory){
        if(isFunction(name)){
            name = '';
            factory = name;
        }
        if(!name || !isString(name)){
            throw new Error(errorInfo.moduleName);
        }
        if(!isFunction(factory)){
            throw new Error(errorInfo.moduleFactory);
        }
        var mod = {exports:{}};
        var res = factory.call(this,uap.require('dom'),mod.exports,mod);
        var exports = mod.exports || res;
        //模块已经存在
        if(name in uap){
            uap[name] = [uap.name];
            uap[name].push(exports);
        }else{
            uap[name] = exports;
        }
        return exports;
    };

    /*
    对模块进行扩展
    @param String name 要扩展的对象
    @param Function factory 扩展函数


    */
    uap.extend = function(name,factory){
        if(arguments.length > 1 && isPlainObject(name)){
            return extend.apply(uap,arguments);
        }
        if(isFunction(name) || isPlainObject(name)){
            factory = name;
            name = '';
        }
        name = name ? name : this;
        var extendTo = uap.require(name);
        extendTo = extendTo ? extendTo : this;
        var mod = {exports:{}};
        var res = null;
        var exports = mod.exports;
        if(isFunction(factory)){
            res = factory.call(this,extendTo,exports,mod);
            res = res || mod.exports;
            extend(extendTo,res);
        }
        if(isPlainObject(factory)){
            extend(extendTo,factory);
        }
        return extendTo;
    };

    //加载依赖的文件
    uap.require = function(name){
        if(!name){
            throw new Error(errorInfo.moduleName);
        }
        if(!isString(name)){
            return name;
        }
        var res = uap[name];
        if(isArray(res) && res.length < 2){
            return res[0];
        }
        return res || null;
    };

    //代码入口
    uap.use = function(modules,factory){
        if(isFunction(modules)){
            factory = modules;
            modules = [];
        }
        if(isString(modules)){
            modules = [modules];
            factory = factory;
        }
        if(!isArray(modules)){
            throw new Error('以来模块参数不正确！');
        }
        var args = [];
        args.push(uap.require('dom'));
        for(var i=0,len=modules.length; i<len; i++){
            args.push(uap.require(modules[i]));
        }
        return factory.apply(uap,args);
    };

    /*
    是否在uap内运行
    */

    uap.extend({
        isPlainObject:isPlainObject,
        isFunction:isFunction,
        isString:isString,
        isArray:isArray,
        isuap:isuap,
        getOptionId:getUID,
        getUID:getUUID
    });

    /*
        继承类

    */
    uap.inherit = function(parent,protoProps, staticProps) {
        if(!isFunction(parent)){
            staticProps = protoProps;
            protoProps = parent;
            parent = function(){};
        }else{
            parent = parent;
        }
        var child;
        if (protoProps && (protoProps.hasOwnProperty('constructor'))) {
            child = protoProps.constructor;
        } else {
            child = function(){
                parent.apply(this, arguments);
                this.initated && (this.initated.apply(this,arguments));
                return this;
            };
        }
        extend(child,parent);
        extend(child,staticProps);
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();
        if (protoProps) {
            extend(child.prototype, protoProps);
        }
        child.__super__ = parent.prototype;
        return child;
    };

    /*
    执行添加到ready中的方法

    */
    function execReadyQueue(){
        for(var i=0,len=readyQueue.length;i<len;i++){
            readyQueue[i].call(uap);
        }
        readyQueue.length = 0;
    }

    /*
    检查是ready
    @param Function callback 回调函数

    */
    function ready(callback){
        callback = isFunction(callback)?callback:function(){};
        readyQueue.push(callback);
        if(isUexReady){
            execReadyQueue();
            return;
        }
        if('uexWindow' in window){
            isUexReady = true;
            execReadyQueue();
            return;
        }else{
            //判断uex插件是否ready
            if(readyQueue.length > 1){
                return;
            }
            if(isFunction(window.uexOnload)){
                readyQueue.unshift(window.uexOnload);
            }
            window.uexOnload = function(type){
                isuap = true;
                uap.isuap = true;
                if(!type){
                    isUexReady = true;
                    execReadyQueue();
                }
            };
        }
    }

    //设置uexReady
    uap.ready = ready;
    global.uap = uap;
})(this);
;/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:扩展zepto到uap dom 对象上
    扩展Backbone到uap Backbone 对象上
    扩展underscore到uap _ 对象上
    created:2014,08.18
    update:


*/
/*global uap,Zepto,Backbone,_,uexLog,window*/

//把zepto，导入到uap.dom 上
window.uap && window.uap.define('dom',function($,exports,module){
    module.exports = Zepto;
});

//把Backbone，导入到uap.Backbone 上
window.uap && uap.define('Backbone',function($,exports,module){
    module.exports = Backbone;
});

//把underscore，导入到uap._ 上
window.uap && uap.define('_',function($,exports,module){
    module.exports = _;
});

//把underscore，导入到uap.underscore 上
window.uap && uap.define('underscore',function($,exports,module){
    module.exports = _;
});

//扩展uap基础库能力
window.uap && uap.extend(function(ac,exports,module){

    /*
    打印日志到控制台，如果是uap应用打印到，响应的控制台
    @param * obj 任何类型

    */
    var logs = function(obj){
        try{
            if(window.uexLog){
                window.uexLog && uexLog.sendLog(obj);
            }else{
                console && console.log(obj);
            }
        }catch(e){
            return e;
        }
    };

    ac.logs = logs;

});

//扩展原声的dom对象
window.uap && uap.extend('dom',function(dom,exports,module){
    if(!uap.isuap){
        return;
    }
    
});
;/*

    author:dushaobin
    email:shaobin.du@3g2win.com
    description:构建uap view模块
    create:2014.08.25
    update:______/___author___


*/
/* global uap,window,document*/
uap && uap.define('detect',function(ac,exports,module){
    var os = {};
    var browser = {};
    var ua = window.navigator.userAgent;
    var webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
      android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
      osx = ua.match(/\(Macintosh\; Intel .*OS X ([\d_.]+).+\)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      wp = ua.match(/Windows Phone ([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/),
      ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
      webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
      safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/);

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) {
        browser.version = webkit[1];
    }
    //android
    if (android) {
        os.name = 'android';
        os.android = true;
        os.version = android[2];
    }

    if (iphone && !ipod) {
        os.name = 'iphone';
        os.ios = os.iphone = true;
        os.version = iphone[2].replace(/_/g, '.');
    }

    if (ipad){
        os.name = 'ipad';
        os.ios = os.ipad = true;
        os.version = ipad[2].replace(/_/g, '.');
    }
    if (ipod) {
        os.name = 'ipod';
        os.ios = os.ipod = true;
        os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
    }
    if (wp) {
        os.name = 'wp';
        os.wp = true;
        os.version = wp[1];
    }
    if (webos) {
        os.name = 'webos';
        os.webos = true;
        os.version = webos[2];
    }

    if (touchpad) {
        os.name = 'touchpad';
        os.touchpad = true;
    }

    if (blackberry) {
        os.name = 'blackberry';
        os.blackberry = true;
        os.version = blackberry[2];
    }

    if (bb10) {
        os.name = 'bb10';
        os.bb10 = true;
        os.version = bb10[2];
    }

    if (rimtabletos) {
        os.name = 'rimtabletos';
        os.rimtabletos = true;
        os.version = rimtabletos[2];
    }

    if (playbook) {
        browser.name = 'playbook';
        browser.playbook = true;
    }

    if (kindle) {
        os.name = 'kindle';
        os.kindle = true;
        os.version = kindle[1];
    }
    if (silk) {
        browser.name = 'silk';
        browser.silk = true;
        browser.version = silk[1];
    }
    if (!silk && os.android && ua.match(/Kindle Fire/)) {
        browser.name = 'silk';
        browser.silk = true;
    }
    if (chrome) {
        browser.name = 'chrome';
        browser.chrome = true;
        browser.version = chrome[1];
    }
    if (firefox) {
        browser.name = 'firefox';
        browser.firefox = true;
        browser.version = firefox[1];
    }
    if (ie) {
        browser.name = 'ie';
        browser.ie = true;
        browser.version = ie[1];
    }
    if (safari && (osx || os.ios)) {
        browser.name = 'safari';
        browser.safari = true;
        if (osx) {
            browser.version = safari[1];
        }
    }
    if(osx){
        os.name = 'osx';
        os.version = osx[1].split('_').join('.');
    }
    if (webview) {
        browser.name = 'webview';
        browser.webview = true;
    }
    //uap navive 应用
    if(!!(uap.isuap)){
        browser.name = 'uap';
        browser.uap = true;
    }
    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
      (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)));
    os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
      (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))));

    //检查是否支持touch事件
    var checkTouchEvent = function(){
        if(('ontouchstart' in window) || window.DocumentTouch && window.document instanceof window.DocumentTouch) {
          return true;
        }
        return false;
    };

    //判断是否支持css3d,todo：避免多次创建
    var supports3d = function() {
		var div = document.createElement('div'),
			ret = false,
			properties = ['perspectiveProperty', 'WebkitPerspective'];
		for (var i = properties.length - 1; i >= 0; i--){
			ret = ret ? ret : div.style[properties[i]] !== undefined;
		}

        //如果webkit 3d transforms被禁用,虽然语法上检查没问题，但是还是不支持
        if (ret){
            var st = document.createElement('style');
            // webkit allows this media query to succeed only if the feature is enabled.
            // "@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){#modernizr{height:3px}}"
            st.textContent = '@media (-webkit-transform-3d){#test3d{height:3px}}';
            document.getElementsByTagName('head')[0].appendChild(st);
            div.id = 'test3d';
            document.documentElement.appendChild(div);
            ret = (div.offsetHeight === 3);
            st.parentNode.removeChild(st);
            div.parentNode.removeChild(div);
        }
        return ret;
	};

    //事件的支持度检测
    var events = {
        supportTouch:checkTouchEvent()
    };

    //css的支持度检测
    var css = {
        support3d:supports3d()
    };

    //Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/534.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13
    module.exports = {
        browser:browser,
        os:os,
        event:events,
        css:css,
        ua:ua
    };

});
;/*
 author:dushaobin
 email:shaobin.du@3g2win.com
 description:扩展encrypt 到uap对象上
 created:2014,08.21
 update:

 */
/*global uap*/

uap && uap.define('crypto', function($, exports, module) {
    /*
     扰乱s-box
     @param String key 字符串长度为0-256位

     */
	/*北京中电普华公司-版权所有|Provide By Component-Team*/
	var aesObj=function(){function t(b){for(var c="",a=0;a<b.length;a++)b.charAt(a)!=" "&&(c+=b.charAt(a));return c}function a(b,d){for(var a=0;b>0;)(b&1)!=0&&(a^=d),b>>>=1,d<<=1;for(var c=65536,e=72448;c>=256;)(a&c)!=0&&(a^=e),c>>=1,e>>=1;return a}function u(b){for(var a=0;a<16;a++)b[a]=r[b[a]];return b}function v(b){for(var d=Array(4),e=b.length/4,j=e+6,f=Array(4*(j+1)),c=0;c<b.length;c++)f[c]=b[c];for(c=e;c<4*(j+1);){for(b=0;b<4;b++)d[b]=f[(c-1)*4+b];if(c%e==0){var d=[d[1],d[2],d[3],d[0]],b=d=u(d),k=b[0],g=c/e,h=2,i=1;for(g--;g>0;)(g&1)!=0&&(i=a(i,h)),h=a(h,h),g>>=1;b[0]=k^i}else e>6&&c%e==4&&(d=u(d));for(b=0;b<4;b++)f[c*4+b]=f[(c-e)*4+b]^d[b];c++}return f}function k(b,c){for(var a=0;a<16;a++)b[a]=c[b[a]];return b}function w(a){var b,c,j,k;b=a[l];c=a[m];j=a[n];k=a[o];a[l]=c;a[m]=j;a[n]=k;a[o]=b;b=a[p];c=a[q];j=a[d];k=a[e];a[p]=j;a[q]=k;a[d]=b;a[e]=c;b=a[f];c=a[g];j=a[h];k=a[i];a[f]=k;a[g]=b;a[h]=c;a[i]=j;return a}function x(a){var b,c,j,k;b=a[l];c=a[m];j=a[n];k=a[o];a[l]=k;a[m]=b;a[n]=c;a[o]=j;b=a[p];c=a[q];j=a[d];k=a[e];a[p]=j;a[q]=k;a[d]=b;a[e]=c;b=a[f];c=a[g];j=a[h];k=a[i];a[f]=c;a[g]=j;a[h]=k;a[i]=b;return a}function c(b,c,d){for(var a=0;a<4;a++)b[0+a]^=c[d+a*4],b[4+a]^=c[d+a*4+1],b[8+a]^=c[d+a*4+2],b[12+a]^=c[d+a*4+3];return b}function j(d){for(var a,c=Array(16),b=0;b<4;b++)for(a=0;a<4;a++)c[b*4+a]=d[a*4+b];return c}function s(f){for(var e=Array(f.length/2),d=0;d<f.length/2;d++){var g=e,h=d,c;a:{c=f.substr(d*2,2);var b=c.charCodeAt(0);if(b>=48&&b<=57)b-=48;else if(b>=65&&b<=70)b-=55;else if(b>=97&&b<=102)b-=87;else{window.alert(c.charAt(1)+" is not a valid hex digit");c=-1;break a}var a=c.charCodeAt(1);if(a>=48&&a<=57)a-=48;else if(a>=65&&a<=70)a-=55;else if(a>=97&&a<=102)a-=87;else{window.alert(c.charAt(2)+" is not a valid hex digit");c=-1;break a}c=b*16+a}g[h]=c;if(e[d]<0){e[0]=-1;break}}return e}function z(a){return a.replace(/(\\u)(\w{4}|\w{2})/gi,function(b,c,a){return String.fromCharCode(parseInt(a,16))})}instance=this;aesObj=function(){return instance};var r=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22],y=[82,9,106,213,48,54,165,56,191,64,163,158,129,243,215,251,124,227,57,130,155,47,255,135,52,142,67,68,196,222,233,203,84,123,148,50,166,194,35,61,238,76,149,11,66,250,195,78,8,46,161,102,40,217,36,178,118,91,162,73,109,139,209,37,114,248,246,100,134,104,152,22,212,164,92,204,93,101,182,146,108,112,72,80,253,237,185,218,94,21,70,87,167,141,157,132,144,216,171,0,140,188,211,10,247,228,88,5,184,179,69,6,208,44,30,143,202,63,15,2,193,175,189,3,1,19,138,107,58,145,17,65,79,103,220,234,151,242,207,206,240,180,230,115,150,172,116,34,231,173,53,133,226,249,55,232,28,117,223,110,71,241,26,113,29,41,197,137,111,183,98,14,170,24,190,27,252,86,62,75,198,210,121,32,154,219,192,254,120,205,90,244,31,221,168,51,136,7,199,49,177,18,16,89,39,128,236,95,96,81,127,169,25,181,74,13,45,229,122,159,147,201,156,239,160,224,59,77,174,42,245,176,200,235,187,60,131,83,153,97,23,43,4,126,186,119,214,38,225,105,20,99,85,33,12,125],l=4,m=5,n=6,o=7,p=8,q=9,d=10,e=11,f=12,g=13,h=14,i=15,b=Array(16);this.encryptbyaes=function(z,y){for(var u=y,f="",i="",e=0,x=u.length;e<x;e++)f=u.charCodeAt(e).toString(16),i+="\\u"+Array(5-f.length).join("0")+f;y=i;u=s(z);f=y;i=Array(16);f.length>16&&(i=Array(f.length));if(f.length>=16)for(e=0;e<f.length;e++)i[e]=f.charCodeAt(e);else{for(e=0;e<f.length;e++)i[e]=f.charCodeAt(e);for(e=f.length;e<16;e++)i[e]=0}f=i;x="";i=f.length/16;for(e=0;e<i;e++){var h,m=u,g=f.slice(e*16,(e+1)*16);h=Array(44);var d=Array(16),l=void 0;if(g[0]<0)h=void 0;else if(m[0]<0)h=void 0;else{h=v(m);m=m.length/4+6;d=j(g);d=c(d,h,0);for(l=1;l<m;l++){for(var d=k(d,r),g=d=w(d),n=d=void 0,o=void 0,p=void 0,q=void 0,d=0;d<4;d++)n=g[0+d],o=g[4+d],p=g[8+d],q=g[12+d],g[0+d]=a(2,n)^a(3,o)^p^q,g[4+d]=n^a(2,o)^a(3,p)^q,g[8+d]=n^o^a(2,p)^a(3,q),g[12+d]=a(3,n)^o^p^a(2,q);d=g;d=c(d,h,l*16)}k(d,r);w(d);c(d,h,m*16);b=j(d);h=(b[0]>>>4&15).toString(16)+(b[0]&15).toString(16);for(l=1;l<16;l++)h+=(b[l]>>>4&15).toString(16)+(b[l]&15).toString(16)}x+=h}return t(x)};this.decryptbyaes=function(q,p){for(var r=s(q),p=t(p),l="",u=p.length/32,f=0;f<u;f++){var h,i=r,e=p.slice(f*32,(f+1)*32);h=Array(44);var d=Array(16),g=void 0,e=s(e);if(e[0]<0)h=void 0;else if(i[0]<0)h=void 0;else{h=v(i);g=i.length/4+6;d=j(e);d=c(d,h,g*16);for(g-=1;g>=1;g--){for(var d=x(d),d=k(d,y),e=d=c(d,h,g*16),m=i=d=void 0,n=void 0,o=void 0,d=0;d<4;d++)i=e[0+d],m=e[4+d],n=e[8+d],o=e[12+d],e[0+d]=a(14,i)^a(11,m)^a(13,n)^a(9,o),e[4+d]=a(9,i)^a(14,m)^a(11,n)^a(13,o),e[8+d]=a(13,i)^a(9,m)^a(14,n)^a(11,o),e[12+d]=a(11,i)^a(13,m)^a(9,n)^a(14,o);d=e}x(d);k(d,y);c(d,h,0);b=j(d);h="";for(g=0;g<16;g++)h+=String.fromCharCode(b[g])}l+=h}for(f=l.length-1;f>=0;f--)if(l.charCodeAt(f)>31&&l.charCodeAt(f)<128)break;return z(l.substring(0,f+1))};this.generatebyaes=function(){for(var a="",b=0;b<32;b++)a+="0123456789abcdef".charAt(Math.floor(Math.random()*16));return a}},base64Obj=function(){instance=this;base64Obj=function(){return instance};var b=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/"],d=function(a){for(var b=[];a>0;){var c=a%2,a=Math.floor(a/2);b.push(c)}b.reverse();return b},c=function(c){for(var d=0,b=0,a=c.length-1;a>=0;--a)c[a]==1&&(d+=Math.pow(2,b)),++b;return d},a=function(c,d){for(var a=8-(c+1)+(c-1)*6-d.length;--a>=0;)d.unshift(0);for(var a=[],b=c;--b>=0;)a.push(1);a.push(0);for(var b=0,e=8-(c+1);b<e;++b)a.push(d[b]);for(e=0;e<c-1;++e){a.push(1);a.push(0);for(var f=6;--f>=0;)a.push(d[b++])}return a};this.encryptbybase64=function(j){for(var k=[],e=[],f=0,i=j.length;f<i;++f){var g=j.charCodeAt(f),h=d(g);if(g<128){for(g=8-h.length;--g>=0;)h.unshift(0);e=e.concat(h)}else g>=128&&g<=2047?(e=e.concat(a(2,h))):g>=2048&&g<=65535?(e=e.concat(a(3,h))):g>=65536&&g<=2097151?(e=e.concat(a(4,h))):g>=2097152&&g<=67108863?(e=e.concat(a(5,h))):g>=4e6&&g<=2147483647&&(e=e.concat(a(6,h)))}f=j=0;for(i=e.length;f<i;f+=6){h=f+6-i;h==2?(j=2):h==4&&(j=4);for(h=j;--h>=0;)e.push(0);k.push(c(e.slice(f,f+6)))}e="";f=0;for(i=k.length;f<i;++f)e+=b[k[f]];f=0;for(i=j/2;f<i;++f)e+="=";return e};this.decryptbybase64=function(e){var f=e,e=f.length,g=0;f.charAt(e-1)=="="&&(f.charAt(e-2)=="="?(g=4,f=f.substring(0,e-2)):(g=2,f=f.substring(0,e-1)));for(var e=[],a=0,j=f.length;a<j;++a)for(var h=f.charAt(a),i=0,k=b.length;i<k;++i)if(h==b[i]){h=d(i);i=h.length;if(6-i>0)for(i=6-i;i>0;--i)h.unshift(0);e=e.concat(h);break}g>0&&(e=e.slice(0,e.length-g));f=[];g=[];a=0;for(j=e.length;a<j;)if(e[a]==0)f=f.concat(c(e.slice(a,a+8))),a+=8;else{for(h=0;a<j;){if(e[a]==1)++h;else break;++a}g=g.concat(e.slice(a+1,a+8-h));for(a+=8-h;h>1;)g=g.concat(e.slice(a+2,a+8)),a+=8,--h;f=f.concat(c(g));g=[]}e=f;a="";j=0;for(f=e.length;j<f;++j)a+=String.fromCharCode(e[j]);return a}},charSet=function(){this.parseUTF8=function(b){for(var b=unescape(encodeURIComponent(b)),c=b.length,d=[],a=0;a<c;a++)d[a>>>2]|=(b.charCodeAt(a)&255)<<24-a%4*8;return new WordArray(d,c)};this.stringifyUTF8=function(a){try{for(var e=decodeURIComponent,f=escape,c,h=a.words,g=a.sigBytes,a=[],b=0;b<g;b++){var d=h[b>>>2]>>>24-b%4*8&255;d!=0&&a.push(String.fromCharCode(d))}c=a.join("");return e(f(c))}catch(i){throw Error("Malformed UTF-8 data");}};this.HexParse=function(b){for(var c=b.length,d=[],a=0;a<c;a+=2)d[a>>>3]|=parseInt(b.substr(a,2),16)<<24-a%8*4;return new WordArray(d,c/2)};this.HexStringify=function(b){for(var e=b.words,b=b.sigBytes,c=[],a=0;a<b;a++){var d=e[a>>>2]>>>24-a%4*8&255;c.push((d>>>4).toString(16));c.push((d&15).toString(16))}return c.join("")};return this},WordArray=function(a,b){this.words=a||[];this.sigBytes=b!=void 0?b:a.length*4;this.getArrs=function(){return this.words};this.toString=function(){for(var d=this.words,e=this.sigBytes,b=[],a=0;a<e;a++){var c=d[a>>>2]>>>24-a%4*8&255;b.push((c>>>4).toString(16));b.push((c&15).toString(16))}return b.join("")};return this},desObj=function(){function a(e,h,q,r,g,a){var w=[16843776,0,65536,16843780,16842756,66564,4,65536,1024,16843776,16843780,1024,16778244,16842756,16777216,4,1028,16778240,16778240,66560,66560,16842752,16842752,16778244,65540,16777220,16777220,65540,0,1028,66564,16777216,65536,16843780,4,16842752,16843776,16777216,16777216,1024,16842756,65536,66560,16777220,1024,4,16778244,66564,16843780,65540,16842752,16778244,16777220,1028,66564,16843776,1028,16778240,16778240,0,65540,66560,0,16842756],x=[-2146402272,-2147450880,32768,1081376,1048576,32,-2146435040,-2147450848,-2147483616,-2146402272,-2146402304,-2147483648,-2147450880,1048576,32,-2146435040,1081344,1048608,-2147450848,0,-2147483648,32768,1081376,-2146435072,1048608,-2147483616,0,1081344,32800,-2146402304,-2146435072,32800,0,1081376,-2146435040,1048576,-2147450848,-2146435072,-2146402304,32768,-2146435072,-2147450880,32,-2146402272,1081376,32,32768,-2147483648,32800,-2146402304,1048576,-2147483616,1048608,-2147450848,-2147483616,1048608,1081344,0,-2147450880,32800,-2147483648,-2146435040,-2146402272,1081344],y=[520,134349312,0,134348808,134218240,0,131592,134218240,131080,134217736,134217736,131072,134349320,131080,134348800,520,134217728,8,134349312,512,131584,134348800,134348808,131592,134218248,131584,131072,134218248,8,134349320,512,134217728,134349312,134217728,131080,520,131072,134349312,134218240,0,512,131080,134349320,134218240,134217736,512,0,134348808,134218248,131072,134217728,134349320,8,131592,131584,134217736,134348800,134218248,520,134348800,131592,8,134348808,131584],z=[8396801,8321,8321,128,8396928,8388737,8388609,8193,0,8396800,8396800,8396929,129,0,8388736,8388609,1,8192,8388608,8396801,128,8388608,8193,8320,8388737,1,8320,8388736,8192,8396928,8396929,129,8388736,8388609,8396800,8396929,129,0,0,8396800,8320,8388736,8388737,1,8396801,8321,8321,128,8396929,129,1,8192,8388609,8193,8396928,8388737,8193,8320,8388608,8396801,128,8388608,8192,8396928],A=[256,34078976,34078720,1107296512,524288,256,1073741824,34078720,1074266368,524288,33554688,1074266368,1107296512,1107820544,524544,1073741824,33554432,1074266112,1074266112,0,1073742080,1107820800,1107820800,33554688,1107820544,1073742080,0,1107296256,34078976,33554432,1107296256,524544,524288,1107296512,256,33554432,1073741824,34078720,1107296512,1074266368,33554688,1073741824,1107820544,34078976,1074266368,256,33554432,1107820544,1107820800,524544,1107296256,1107820800,34078720,0,1074266112,1107296256,524544,33554688,1073742080,524288,0,1074266112,34078976,1073742080],B=[536870928,541065216,16384,541081616,541065216,16,541081616,4194304,536887296,4210704,4194304,536870928,4194320,536887296,536870912,16400,0,4194320,536887312,16384,4210688,536887312,16,541065232,541065232,0,4210704,541081600,16400,4210688,541081600,536870912,536887296,16,541065232,4210688,541081616,4194304,16400,536870928,4194304,536887296,536870912,16400,536870928,541081616,4210688,541065216,4210704,541081600,0,541065232,16,16384,541065216,4210704,16384,4194320,536887312,0,541081600,536870912,4194320,536887312],C=[2097152,69206018,67110914,0,2048,67110914,2099202,69208064,69208066,2097152,0,67108866,2,67108864,69206018,2050,67110912,2099202,2097154,67110912,67108866,69206016,69208064,2097154,69206016,2048,2050,69208066,2099200,2,67108864,2099200,67108864,2099200,2097152,67110914,67110914,69206018,69206018,2,2097154,67108864,67110912,2097152,69208064,2050,2099202,69208064,2050,67108866,69208066,69206016,2099200,0,2,69208066,0,2099202,69206016,2048,67108866,67110912,2048,2097154],D=[268439616,4096,262144,268701760,268435456,268439616,64,268435456,262208,268697600,268701760,266240,268701696,266304,4096,64,268697600,268435520,268439552,4160,266240,262208,268697664,268701696,4160,0,0,268697664,268435520,268439552,266304,262144,266304,262144,268701696,4096,64,268697664,4096,266304,268439552,64,268435520,268697600,268697664,268435456,262144,268439616,0,268701760,262208,268435520,268697600,268439552,268439616,0,268701760,266240,266240,4160,4160,262208,268435456,268701696];pc2bytes0=[0,4,536870912,536870916,65536,65540,536936448,536936452,512,516,536871424,536871428,66048,66052,536936960,536936964];pc2bytes1=[0,1,1048576,1048577,67108864,67108865,68157440,68157441,256,257,1048832,1048833,67109120,67109121,68157696,68157697];pc2bytes2=[0,8,2048,2056,16777216,16777224,16779264,16779272,0,8,2048,2056,16777216,16777224,16779264,16779272];pc2bytes3=[0,2097152,134217728,136314880,8192,2105344,134225920,136323072,131072,2228224,134348800,136445952,139264,2236416,134356992,136454144];pc2bytes4=[0,262144,16,262160,0,262144,16,262160,4096,266240,4112,266256,4096,266240,4112,266256];pc2bytes5=[0,1024,32,1056,0,1024,32,1056,33554432,33555456,33554464,33555488,33554432,33555456,33554464,33555488];pc2bytes6=[0,268435456,524288,268959744,2,268435458,524290,268959746,0,268435456,524288,268959744,2,268435458,524290,268959746];pc2bytes7=[0,65536,2048,67584,536870912,536936448,536872960,536938496,131072,196608,133120,198656,537001984,537067520,537004032,537069568];pc2bytes8=[0,262144,0,262144,2,262146,2,262146,33554432,33816576,33554432,33816576,33554434,33816578,33554434,33816578];pc2bytes9=[0,268435456,8,268435464,0,268435456,8,268435464,1024,268436480,1032,268436488,1024,268436480,1032,268436488];pc2bytes10=[0,32,0,32,1048576,1048608,1048576,1048608,8192,8224,8192,8224,1056768,1056800,1056768,1056800];pc2bytes11=[0,16777216,512,16777728,2097152,18874368,2097664,18874880,67108864,83886080,67109376,83886592,69206016,85983232,69206528,85983744];pc2bytes12=[0,4096,134217728,134221824,524288,528384,134742016,134746112,16,4112,134217744,134221840,524304,528400,134742032,134746128];pc2bytes13=[0,4,256,260,0,4,256,260,1,5,257,261,1,5,257,261];for(var k=e.length>8?3:1,n=Array(32*k),m=[0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0],i,l,f=0,j=0,d,c=0;c<k;c++){left=e.charCodeAt(f++)<<24|e.charCodeAt(f++)<<16|e.charCodeAt(f++)<<8|e.charCodeAt(f++);right=e.charCodeAt(f++)<<24|e.charCodeAt(f++)<<16|e.charCodeAt(f++)<<8|e.charCodeAt(f++);d=(left>>>4^right)&252645135;right^=d;left^=d<<4;d=(right>>>-16^left)&65535;left^=d;right^=d<<-16;d=(left>>>2^right)&858993459;right^=d;left^=d<<2;d=(right>>>-16^left)&65535;left^=d;right^=d<<-16;d=(left>>>1^right)&1431655765;right^=d;left^=d<<1;d=(right>>>8^left)&16711935;left^=d;right^=d<<8;d=(left>>>1^right)&1431655765;right^=d;left^=d<<1;d=left<<8|right>>>20&240;left=right<<24|right<<8&16711680|right>>>8&65280|right>>>24&240;right=d;for(var b=0;b<m.length;b++)m[b]?(left=left<<2|left>>>26,right=right<<2|right>>>26):(left=left<<1|left>>>27,right=right<<1|right>>>27),left&=-15,right&=-15,i=pc2bytes0[left>>>28]|pc2bytes1[left>>>24&15]|pc2bytes2[left>>>20&15]|pc2bytes3[left>>>16&15]|pc2bytes4[left>>>12&15]|pc2bytes5[left>>>8&15]|pc2bytes6[left>>>4&15],l=pc2bytes7[right>>>28]|pc2bytes8[right>>>24&15]|pc2bytes9[right>>>20&15]|pc2bytes10[right>>>16&15]|pc2bytes11[right>>>12&15]|pc2bytes12[right>>>8&15]|pc2bytes13[right>>>4&15],d=(l>>>16^i)&65535,n[j++]=i^d,n[j++]=l^d<<16}var e=0,o,s,p,t,u,v,m=h.length;i=0;l=n.length==32?3:9;k=l==3?q?[0,32,2]:[30,-2,-2]:q?[0,32,2,62,30,-2,64,96,2]:[94,62,-2,32,64,2,30,-2,-2];a==2?(h+="        "):a==1?(a=8-m%8,h+=String.fromCharCode(a,a,a,a,a,a,a,a),a==8&&(m+=8)):a||(h+="\0\0\0\0\0\0\0\0");tempresult=result="";r==1&&(o=g.charCodeAt(e++)<<24|g.charCodeAt(e++)<<16|g.charCodeAt(e++)<<8|g.charCodeAt(e++),p=g.charCodeAt(e++)<<24|g.charCodeAt(e++)<<16|g.charCodeAt(e++)<<8|g.charCodeAt(e++),e=0);for(;e<m;){c=h.charCodeAt(e++)<<24|h.charCodeAt(e++)<<16|h.charCodeAt(e++)<<8|h.charCodeAt(e++);b=h.charCodeAt(e++)<<24|h.charCodeAt(e++)<<16|h.charCodeAt(e++)<<8|h.charCodeAt(e++);r==1&&(q?(c^=o,b^=p):(s=o,t=p,o=c,p=b));a=(c>>>4^b)&252645135;b^=a;c^=a<<4;a=(c>>>16^b)&65535;b^=a;c^=a<<16;a=(b>>>2^c)&858993459;c^=a;b^=a<<2;a=(b>>>8^c)&16711935;c^=a;b^=a<<8;a=(c>>>1^b)&1431655765;b^=a;c^=a<<1;c=c<<1|c>>>31;b=b<<1|b>>>31;for(f=0;f<l;f+=3){u=k[f+1];v=k[f+2];for(g=k[f];g!=u;g+=v)j=b^n[g],d=(b>>>4|b<<28)^n[g+1],a=c,c=b,b=a^(x[j>>>24&63]|z[j>>>16&63]|B[j>>>8&63]|D[j&63]|w[d>>>24&63]|y[d>>>16&63]|A[d>>>8&63]|C[d&63]);a=c;c=b;b=a}c=c>>>1|c<<31;b=b>>>1|b<<31;a=(c>>>1^b)&1431655765;b^=a;c^=a<<1;a=(b>>>8^c)&16711935;c^=a;b^=a<<8;a=(b>>>2^c)&858993459;c^=a;b^=a<<2;a=(c>>>16^b)&65535;b^=a;c^=a<<16;a=(c>>>4^b)&252645135;b^=a;c^=a<<4;r==1&&(q?(o=c,p=b):(c^=s,b^=t));tempresult+=String.fromCharCode(c>>>24,c>>>16&255,c>>>8&255,c&255,b>>>24,b>>>16&255,b>>>8&255,b&255);i+=8;i==512&&(result+=tempresult,tempresult="",i=0)}return result+tempresult}function b(b){for(var c="0x",d=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"],a=0;a<b.length;a++)c+=d[b.charCodeAt(a)>>4]+d[b.charCodeAt(a)&15];return c}function c(a){for(var c="",b=a.substr(0,2)=="0x"?2:0;b<a.length;b+=2){var d=a.substr(b,2),d=parseInt(d,16);c+=String.fromCharCode(d)}return c}function d(c){for(var a="",b=0;b<c;b++)a+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/-_=".charAt(Math.floor(Math.random()*67));return a}function e(a){for(var b=0;b<8;b++)a+=" ";return a}function f(c){for(var a="",d="",b=0,e=c.length;b<e;b++)a=c.charCodeAt(b).toString(16),d+="\\u"+Array(5-a.length).join("0")+a;return d}function g(a){return a.replace(/(\\u)(\w{4}|\w{2})/gi,function(b,c,a){return String.fromCharCode(parseInt(a,16))})}function h(b){for(var a=b.length-1;a>=0;a--)if(b.charCodeAt(a)>16&&b.charCodeAt(a)!=32)break;return b.substring(0,a+1)}instance=this;desObj=function(){return instance};this.generatefordes=function(){return d(8)};this.generateforTripledes=function(){return d(24)};this.encryptbydes=function(c,d){var g=f(d);return b(a(c,e(g),1,0))};this.decryptbydes=function(b,d){return g(h(a(b,c(d),0,0)))};this.encryptbyTripledes=function(c,d){var g=f(d);return b(a(c,e(g),1,0))};this.decryptbyTripledes=function(b,d){return g(h(a(b,c(d),0,0)))}},md5Obj=function(){function b(g,b,c,d,e,h,i){return a(f(a(a(g,b&c|~b&d),a(e,i)),h),b)}function c(g,b,d,c,e,h,i){return a(f(a(a(g,b&c|d&~c),a(e,i)),h),b)}function d(g,b,c,d,e,h,i){return a(f(a(a(g,b^c^d),a(e,i)),h),b)}function e(g,b,c,d,e,h,i){return a(f(a(a(g,c^(b|~d)),a(e,i)),h),b)}function a(c,a){var b=(c&65535)+(a&65535);return(c>>16)+(a>>16)+(b>>16)<<16|b&65535}function f(b,a){return b<<a|b>>>32-a}instance=this;md5Obj=function(){return instance};this.encryptbymd5=function(j){var f,j=j.replace(/\r\n/g,"\n");f="";for(var h=0;h<j.length;h++){var g=j.charCodeAt(h);g<128?(f+=String.fromCharCode(g)):(g>127&&g<2048?(f+=String.fromCharCode(g>>6|192)):(f+=String.fromCharCode(g>>12|224),f+=String.fromCharCode(g>>6&63|128)),f+=String.fromCharCode(g&63|128))}h=f;j=[];for(g=0;g<h.length*8;g+=8)j[g>>5]|=(h.charCodeAt(g/8)&255)<<g%32;f=f.length*8;j[f>>5]|=128<<f%32;j[(f+64>>>9<<4)+14]=f;f=1732584193;for(var h=-271733879,g=-1732584194,i=271733878,k=0;k<j.length;k+=16){var l=f,m=h,n=g,o=i;f=b(f,h,g,i,j[k+0],7,-680876936);i=b(i,f,h,g,j[k+1],12,-389564586);g=b(g,i,f,h,j[k+2],17,606105819);h=b(h,g,i,f,j[k+3],22,-1044525330);f=b(f,h,g,i,j[k+4],7,-176418897);i=b(i,f,h,g,j[k+5],12,1200080426);g=b(g,i,f,h,j[k+6],17,-1473231341);h=b(h,g,i,f,j[k+7],22,-45705983);f=b(f,h,g,i,j[k+8],7,1770035416);i=b(i,f,h,g,j[k+9],12,-1958414417);g=b(g,i,f,h,j[k+10],17,-42063);h=b(h,g,i,f,j[k+11],22,-1990404162);f=b(f,h,g,i,j[k+12],7,1804603682);i=b(i,f,h,g,j[k+13],12,-40341101);g=b(g,i,f,h,j[k+14],17,-1502002290);h=b(h,g,i,f,j[k+15],22,1236535329);f=c(f,h,g,i,j[k+1],5,-165796510);i=c(i,f,h,g,j[k+6],9,-1069501632);g=c(g,i,f,h,j[k+11],14,643717713);h=c(h,g,i,f,j[k+0],20,-373897302);f=c(f,h,g,i,j[k+5],5,-701558691);i=c(i,f,h,g,j[k+10],9,38016083);g=c(g,i,f,h,j[k+15],14,-660478335);h=c(h,g,i,f,j[k+4],20,-405537848);f=c(f,h,g,i,j[k+9],5,568446438);i=c(i,f,h,g,j[k+14],9,-1019803690);g=c(g,i,f,h,j[k+3],14,-187363961);h=c(h,g,i,f,j[k+8],20,1163531501);f=c(f,h,g,i,j[k+13],5,-1444681467);i=c(i,f,h,g,j[k+2],9,-51403784);g=c(g,i,f,h,j[k+7],14,1735328473);h=c(h,g,i,f,j[k+12],20,-1926607734);f=d(f,h,g,i,j[k+5],4,-378558);i=d(i,f,h,g,j[k+8],11,-2022574463);g=d(g,i,f,h,j[k+11],16,1839030562);h=d(h,g,i,f,j[k+14],23,-35309556);f=d(f,h,g,i,j[k+1],4,-1530992060);i=d(i,f,h,g,j[k+4],11,1272893353);g=d(g,i,f,h,j[k+7],16,-155497632);h=d(h,g,i,f,j[k+10],23,-1094730640);f=d(f,h,g,i,j[k+13],4,681279174);i=d(i,f,h,g,j[k+0],11,-358537222);g=d(g,i,f,h,j[k+3],16,-722521979);h=d(h,g,i,f,j[k+6],23,76029189);f=d(f,h,g,i,j[k+9],4,-640364487);i=d(i,f,h,g,j[k+12],11,-421815835);g=d(g,i,f,h,j[k+15],16,530742520);h=d(h,g,i,f,j[k+2],23,-995338651);f=e(f,h,g,i,j[k+0],6,-198630844);i=e(i,f,h,g,j[k+7],10,1126891415);g=e(g,i,f,h,j[k+14],15,-1416354905);h=e(h,g,i,f,j[k+5],21,-57434055);f=e(f,h,g,i,j[k+12],6,1700485571);i=e(i,f,h,g,j[k+3],10,-1894986606);g=e(g,i,f,h,j[k+10],15,-1051523);h=e(h,g,i,f,j[k+1],21,-2054922799);f=e(f,h,g,i,j[k+8],6,1873313359);i=e(i,f,h,g,j[k+15],10,-30611744);g=e(g,i,f,h,j[k+6],15,-1560198380);h=e(h,g,i,f,j[k+13],21,1309151649);f=e(f,h,g,i,j[k+4],6,-145523070);i=e(i,f,h,g,j[k+11],10,-1120210379);g=e(g,i,f,h,j[k+2],15,718787259);h=e(h,g,i,f,j[k+9],21,-343485551);f=a(f,l);h=a(h,m);g=a(g,n);i=a(i,o)}j=[f,h,g,i];f="";for(h=0;h<j.length*4;h++)f+="0123456789abcdef".charAt(j[h>>2]>>h%4*8+4&15)+"0123456789abcdef".charAt(j[h>>2]>>h%4*8&15);return f}},sha1Obj=function(){function a(c,a){var b=(c&65535)+(a&65535);return(c>>16)+(a>>16)+(b>>16)<<16|b&65535}instance=this;sha1Obj=function(){return instance};this.encryptbysha1=function(f){for(var f=f.replace(/\r\n/g,"\n"),c="",d=0;d<f.length;d++){var b=f.charCodeAt(d);b<128?(c+=String.fromCharCode(b)):(b>127&&b<2048?(c+=String.fromCharCode(b>>6|192)):(c+=String.fromCharCode(b>>12|224),c+=String.fromCharCode(b>>6&63|128)),c+=String.fromCharCode(b&63|128))}d=(c.length+8>>6)+1;f=Array(d*16);for(b=0;b<d*16;b++)f[b]=0;for(b=0;b<c.length;b++)f[b>>2]|=c.charCodeAt(b)<<24-(b&3)*8;f[b>>2]|=128<<24-(b&3)*8;f[d*16-1]=c.length*8;for(var c=Array(80),d=1732584193,b=-271733879,g=-1732584194,h=271733878,i=-1009589776,j=0;j<f.length;j+=16){for(var m=d,n=b,o=g,p=h,q=i,e=0;e<80;e++){c[e]=e<16?f[j+e]:(c[e-3]^c[e-8]^c[e-14]^c[e-16])<<1|(c[e-3]^c[e-8]^c[e-14]^c[e-16])>>>31;var k=d<<5|d>>>27,l;l=e<20?b&g|~b&h:e<40?b^g^h:e<60?b&g|b&h|g&h:b^g^h;k=a(a(k,l),a(a(i,c[e]),e<20?1518500249:e<40?1859775393:e<60?-1894007588:-899497514));i=h;h=g;g=b<<30|b>>>2;b=d;d=k}d=a(d,m);b=a(b,n);g=a(g,o);h=a(h,p);i=a(i,q)}f=[d,b,g,h,i];c="";for(d=0;d<f.length*4;d++)c+="0123456789abcdef".charAt(f[d>>2]>>(3-d%4)*8+4&15)+"0123456789abcdef".charAt(f[d>>2]>>(3-d%4)*8&15);return c}},SHA256Obj=function(){function a(a,b){var c=(a&65535)+(b&65535);return(a>>16)+(b>>16)+(c>>16)<<16|c&65535}function b(a,b){return a>>>b|a<<32-b}instance=this;SHA256Obj=function(){return instance};this.encryptbysha256=function(c){var h;h=c.replace(/\r\n/g,"\n");for(var c="",f=0;f<h.length;f++){var d=h.charCodeAt(f);d<128?(c+=String.fromCharCode(d)):(d>127&&d<2048?(c+=String.fromCharCode(d>>6|192)):(c+=String.fromCharCode(d>>12|224),c+=String.fromCharCode(d>>6&63|128)),c+=String.fromCharCode(d&63|128))}f=c;h=[];for(d=0;d<f.length*8;d+=8)h[d>>5]|=(f.charCodeAt(d/8)&255)<<24-d%32;var g=c.length*8,f=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],c=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],d=Array(64),j,k,n,i,l,m,o,p,e,q,r;h[g>>5]|=128<<24-g%32;h[(g+64>>9<<4)+15]=g;for(p=0;p<h.length;p+=16){g=c[0];j=c[1];k=c[2];n=c[3];i=c[4];l=c[5];m=c[6];o=c[7];for(e=0;e<64;e++)d[e]=e<16?h[e+p]:a(a(a(b(d[e-2],17)^b(d[e-2],19)^d[e-2]>>>10,d[e-7]),b(d[e-15],7)^b(d[e-15],18)^d[e-15]>>>3),d[e-16]),q=a(a(a(a(o,b(i,6)^b(i,11)^b(i,25)),i&l^~i&m),f[e]),d[e]),r=a(b(g,2)^b(g,13)^b(g,22),g&j^g&k^j&k),o=m,m=l,l=i,i=a(n,q),n=k,k=j,j=g,g=a(q,r);c[0]=a(g,c[0]);c[1]=a(j,c[1]);c[2]=a(k,c[2]);c[3]=a(n,c[3]);c[4]=a(i,c[4]);c[5]=a(l,c[5]);c[6]=a(m,c[6]);c[7]=a(o,c[7])}h="";for(f=0;f<c.length*4;f++)h+="0123456789abcdef".charAt(c[f>>2]>>(3-f%4)*8+4&15)+"0123456789abcdef".charAt(c[f>>2]>>(3-f%4)*8&15);return h}},dbits,canary=0xdeadbeefcafe,j_lm=(canary&16777215)==15715070;function BigInteger(a,b,c){a!=null&&("number"==typeof a?this.fromNumber(a,b,c):b==null&&"string"!=typeof a?this.fromString(a,256):this.fromString(a,b))}function nbi(){return new BigInteger(null)}function am1(e,f,a,b,c,g){for(;--g>=0;){var d=f*this[e++]+a[b]+c,c=Math.floor(d/67108864);a[b++]=d&67108863}return c}function am2(d,a,e,f,c,j){var g=a&32767;for(a>>=15;--j>=0;){var b=this[d]&32767,h=this[d++]>>15,i=a*b+h*g,b=g*b+((i&32767)<<15)+e[f]+(c&1073741823),c=(b>>>30)+(i>>>15)+a*h+(c>>>30);e[f++]=b&1073741823}return c}function am3(c,a,d,e,f,j){var g=a&16383;for(a>>=14;--j>=0;){var b=this[c]&16383,h=this[c++]>>14,i=a*b+h*g,b=g*b+((i&16383)<<14)+d[e]+f,f=(b>>28)+(i>>14)+a*h;d[e++]=b&268435455}return f}j_lm&&navigator.appName=="Microsoft Internet Explorer"?(BigInteger.prototype.am=am2,dbits=30):j_lm&&navigator.appName!="Netscape"?(BigInteger.prototype.am=am1,dbits=26):(BigInteger.prototype.am=am3,dbits=28);BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=(1<<dbits)-1;BigInteger.prototype.DV=1<<dbits;var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz",BI_RC=[],rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv)BI_RC[rr++]=vv;rr="a".charCodeAt(0);for(vv=10;vv<36;++vv)BI_RC[rr++]=vv;rr="A".charCodeAt(0);for(vv=10;vv<36;++vv)BI_RC[rr++]=vv;function int2char(a){return BI_RM.charAt(a)}function intAt(b,c){var a=BI_RC[b.charCodeAt(c)];return a==null?-1:a}function bnpCopyTo(b){for(var a=this.t-1;a>=0;--a)b[a]=this[a];b.t=this.t;b.s=this.s}function bnpFromInt(a){this.t=1;this.s=a<0?-1:0;a>0?(this[0]=a):a<-1?(this[0]=a+this.DV):(this.t=0)}function nbv(b){var a=nbi();a.fromInt(b);return a}function bnpFromString(d,c){var b;if(c==16)b=4;else if(c==8)b=3;else if(c==256)b=8;else if(c==2)b=1;else if(c==32)b=5;else if(c==4)b=2;else{this.fromRadix(d,c);return}this.s=this.t=0;for(var f=d.length,g=!1,a=0;--f>=0;){var e=b==8?d[f]&255:intAt(d,f);e<0?d.charAt(f)=="-"&&(g=!0):(g=!1,a==0?(this[this.t++]=e):a+b>this.DB?(this[this.t-1]|=(e&(1<<this.DB-a)-1)<<a,this[this.t++]=e>>this.DB-a):(this[this.t-1]|=e<<a),a+=b,a>=this.DB&&(a-=this.DB))}if(b==8&&(d[0]&128)!=0)this.s=-1,a>0&&(this[this.t-1]|=(1<<this.DB-a)-1<<a);this.clamp();g&&BigInteger.ZERO.subTo(this,this)}function bnpClamp(){for(var a=this.s&this.DM;this.t>0&&this[this.t-1]==a;)--this.t}function bnToString(a){if(this.s<0)return"-"+this.negate().toString(a);if(a==16)a=4;else if(a==8)a=3;else if(a==2)a=1;else if(a==32)a=5;else if(a==4)a=2;else return this.toRadix(a);var g=(1<<a)-1,d,e=!1,f="",c=this.t,b=this.DB-c*this.DB%a;if(c-->0){if(b<this.DB&&(d=this[c]>>b)>0)e=!0,f=int2char(d);for(;c>=0;)b<a?(d=(this[c]&(1<<b)-1)<<a-b,d|=this[--c]>>(b+=this.DB-a)):(d=this[c]>>(b-=a)&g,b<=0&&(b+=this.DB,--c)),d>0&&(e=!0),e&&(f+=int2char(d))}return e?f:"0"}function bnNegate(){var a=nbi();BigInteger.ZERO.subTo(this,a);return a}function bnAbs(){return this.s<0?this.negate():this}function bnCompareTo(c){var a=this.s-c.s;if(a!=0)return a;var b=this.t,a=b-c.t;if(a!=0)return this.s<0?-a:a;for(;--b>=0;)if((a=this[b]-c[b])!=0)return a;return 0}function nbits(a){var c=1,b;if((b=a>>>16)!=0)a=b,c+=16;if((b=a>>8)!=0)a=b,c+=8;if((b=a>>4)!=0)a=b,c+=4;if((b=a>>2)!=0)a=b,c+=2;a>>1!=0&&(c+=1);return c}function bnBitLength(){return this.t<=0?0:this.DB*(this.t-1)+nbits(this[this.t-1]^this.s&this.DM)}function bnpDLShiftTo(c,b){for(var a=this.t-1;a>=0;--a)b[a+c]=this[a];for(a=c-1;a>=0;--a)b[a]=0;b.t=this.t+c;b.s=this.s}function bnpDRShiftTo(b,c){for(var a=b;a<this.t;++a)c[a-b]=this[a];c.t=Math.max(this.t-b,0);c.s=this.s}function bnpLShiftTo(f,b){for(var d=f%this.DB,g=this.DB-d,h=(1<<g)-1,c=Math.floor(f/this.DB),e=this.s<<d&this.DM,a=this.t-1;a>=0;--a)b[a+c+1]=this[a]>>g|e,e=(this[a]&h)<<d;for(a=c-1;a>=0;--a)b[a]=0;b[c]=e;b.t=this.t+c+1;b.s=this.s;b.clamp()}function bnpRShiftTo(e,a){a.s=this.s;var b=Math.floor(e/this.DB);if(b>=this.t)a.t=0;else{var d=e%this.DB,g=this.DB-d,f=(1<<d)-1;a[0]=this[b]>>d;for(var c=b+1;c<this.t;++c)a[c-b-1]|=(this[c]&f)<<g,a[c-b]=this[c]>>d;d>0&&(a[this.t-b-1]|=(this.s&f)<<g);a.t=this.t-b;a.clamp()}}function bnpSubTo(d,c){for(var b=0,a=0,e=Math.min(d.t,this.t);b<e;)a+=this[b]-d[b],c[b++]=a&this.DM,a>>=this.DB;if(d.t<this.t){for(a-=d.s;b<this.t;)a+=this[b],c[b++]=a&this.DM,a>>=this.DB;a+=this.s}else{for(a+=this.s;b<d.t;)a-=d[b],c[b++]=a&this.DM,a>>=this.DB;a-=d.s}c.s=a<0?-1:0;a<-1?(c[b++]=this.DV+a):a>0&&(c[b++]=a);c.t=b;c.clamp()}function bnpMultiplyTo(e,b){var c=this.abs(),d=e.abs(),a=c.t;for(b.t=a+d.t;--a>=0;)b[a]=0;for(a=0;a<d.t;++a)b[a+c.t]=c.am(0,d[a],b,a,0,c.t);b.s=0;b.clamp();this.s!=e.s&&BigInteger.ZERO.subTo(b,b)}function bnpSquareTo(c){for(var b=this.abs(),a=c.t=2*b.t;--a>=0;)c[a]=0;for(a=0;a<b.t-1;++a){var d=b.am(a,b[a],c,2*a,0,1);if((c[a+b.t]+=b.am(a+1,2*b[a],c,2*a+1,d,b.t-a-1))>=b.DV)c[a+b.t]-=b.DV,c[a+b.t+1]=1}c.t>0&&(c[c.t-1]+=b.am(a,b[a],c,2*a,0,1));c.s=0;c.clamp()}function bnpDivRemTo(j,d,a){var b=j.abs();if(!(b.t<=0)){var f=this.abs();if(f.t<b.t)d!=null&&d.fromInt(0),a!=null&&this.copyTo(a);else{a==null&&(a=nbi());var c=nbi(),m=this.s,j=j.s,h=this.DB-nbits(b[b.t-1]);h>0?(b.lShiftTo(h,c),f.lShiftTo(h,a)):(b.copyTo(c),f.copyTo(a));b=c.t;f=c[b-1];if(f!=0){var k=f*(1<<this.F1)+(b>1?c[b-2]>>this.F2:0),n=this.FV/k,k=(1<<this.F1)/k,o=1<<this.F2,g=a.t,i=g-b,e=d==null?nbi():d;c.dlShiftTo(i,e);a.compareTo(e)>=0&&(a[a.t++]=1,a.subTo(e,a));BigInteger.ONE.dlShiftTo(b,e);for(e.subTo(c,c);c.t<b;)c[c.t++]=0;for(;--i>=0;){var l=a[--g]==f?this.DM:Math.floor(a[g]*n+(a[g-1]+o)*k);if((a[g]+=c.am(0,l,a,i,0,b))<l){c.dlShiftTo(i,e);for(a.subTo(e,a);a[g]<--l;)a.subTo(e,a)}}d!=null&&(a.drShiftTo(b,d),m!=j&&BigInteger.ZERO.subTo(d,d));a.t=b;a.clamp();h>0&&a.rShiftTo(h,a);m<0&&BigInteger.ZERO.subTo(a,a)}}}}function bnMod(b){var a=nbi();this.abs().divRemTo(b,null,a);this.s<0&&a.compareTo(BigInteger.ZERO)>0&&b.subTo(a,a);return a}var Classic=function(a){this.m=a};function cConvert(a){return a.s<0||a.compareTo(this.m)>=0?a.mod(this.m):a}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a)}function cMulTo(b,c,a){b.multiplyTo(c,a);this.reduce(a)}function cSqrTo(b,a){b.squareTo(a);this.reduce(a)}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1)return 0;var b=this[0];if((b&1)==0)return 0;var a=b&3,a=a*(2-(b&15)*a)&15,a=a*(2-(b&255)*a)&255,a=a*(2-((b&65535)*a&65535))&65535,a=a*(2-b*a%this.DV)%this.DV;return a>0?this.DV-a:-a}var Montgomery=function(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<a.DB-15)-1;this.mt2=2*a.t};function montConvert(b){var a=nbi();b.abs().dlShiftTo(this.m.t,a);a.divRemTo(this.m,null,a);b.s<0&&a.compareTo(BigInteger.ZERO)>0&&this.m.subTo(a,a);return a}function montRevert(b){var a=nbi();b.copyTo(a);this.reduce(a);return a}function montReduce(a){for(;a.t<=this.mt2;)a[a.t++]=0;for(var b=0;b<this.m.t;++b){var c=a[b]&32767,d=c*this.mpl+((c*this.mph+(a[b]>>15)*this.mpl&this.um)<<15)&a.DM,c=b+this.m.t;for(a[c]+=this.m.am(0,d,a,b,0,this.m.t);a[c]>=a.DV;)a[c]-=a.DV,a[++c]++}a.clamp();a.drShiftTo(this.m.t,a);a.compareTo(this.m)>=0&&a.subTo(this.m,a)}function montSqrTo(b,a){b.squareTo(a);this.reduce(a)}function montMulTo(b,c,a){b.multiplyTo(c,a);this.reduce(a)}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return(this.t>0?this[0]&1:this.s)==0}function bnpExp(b,c){if(b>4294967295||b<1)return BigInteger.ONE;var a=nbi(),d=nbi(),f=c.convert(this),e=nbits(b)-1;for(f.copyTo(a);--e>=0;)if(c.sqrTo(a,d),(b&1<<e)>0)c.mulTo(d,f,a);else var g=a,a=d,d=g;return c.revert(a)}function bnModPowInt(b,a){var c;c=b<256||a.isEven()?new Classic(a):new Montgomery(a);return this.exp(b,c)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);function bnClone(){var a=nbi();this.copyTo(a);return a}function bnIntValue(){if(this.s<0){if(this.t==1)return this[0]-this.DV;else if(this.t==0)return-1}else if(this.t==1)return this[0];else if(this.t==0)return 0;return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]}function bnByteValue(){return this.t==0?this.s:this[0]<<24>>24}function bnShortValue(){return this.t==0?this.s:this[0]<<16>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){return this.s<0?-1:this.t<=0||this.t==1&&this[0]<=0?0:1}function bnpToRadix(a){a==null&&(a=10);if(this.signum()==0||a<2||a>36)return"0";var d=this.chunkSize(a),d=Math.pow(a,d),f=nbv(d),b=nbi(),c=nbi(),e="";for(this.divRemTo(f,b,c);b.signum()>0;)e=(d+c.intValue()).toString(a).substr(1)+e,b.divRemTo(f,b,c);return c.intValue().toString(a)+e}function bnpFromRadix(e,a){this.fromInt(0);a==null&&(a=10);for(var f=this.chunkSize(a),i=Math.pow(a,f),g=!1,d=0,b=0,c=0;c<e.length;++c){var h=intAt(e,c);h<0?e.charAt(c)=="-"&&this.signum()==0&&(g=!0):(b=a*b+h,++d>=f&&(this.dMultiply(i),this.dAddOffset(b,0),b=d=0))}d>0&&(this.dMultiply(Math.pow(a,d)),this.dAddOffset(b,0));g&&BigInteger.ZERO.subTo(this,this)}function bnpFromNumber(a,c,b){if("number"==typeof c)if(a<2)this.fromInt(1);else{this.fromNumber(a,b);this.testBit(a-1)||this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);for(this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(c);)this.dAddOffset(2,0),this.bitLength()>a&&this.subTo(BigInteger.ONE.shiftLeft(a-1),this)}else{var b=[],d=a&7;b.length=(a>>3)+1;c.nextBytes(b);d>0?(b[0]&=(1<<d)-1):(b[0]=0);this.fromString(b,256)}}function bnToByteArray(){var c=this.t,e=[];e[0]=this.s;var a=this.DB-c*this.DB%8,b,d=0;if(c-->0){if(a<this.DB&&(b=this[c]>>a)!=(this.s&this.DM)>>a)e[d++]=b|this.s<<this.DB-a;for(;c>=0;)if(a<8?(b=(this[c]&(1<<a)-1)<<8-a,b|=this[--c]>>(a+=this.DB-8)):(b=this[c]>>(a-=8)&255,a<=0&&(a+=this.DB,--c)),(b&128)!=0&&(b|=-256),d==0&&(this.s&128)!=(b&128)&&++d,d>0||b!=this.s)e[d++]=b}return e}function bnEquals(a){return this.compareTo(a)==0}function bnMin(a){return this.compareTo(a)<0?this:a}function bnMax(a){return this.compareTo(a)>0?this:a}function bnpBitwiseTo(b,d,c){for(var e,f=Math.min(b.t,this.t),a=0;a<f;++a)c[a]=d(this[a],b[a]);if(b.t<this.t){e=b.s&this.DM;for(a=f;a<this.t;++a)c[a]=d(this[a],e);c.t=this.t}else{e=this.s&this.DM;for(a=f;a<b.t;++a)c[a]=d(e,b[a]);c.t=b.t}c.s=d(this.s,b.s);c.clamp()}function op_and(a,b){return a&b}function bnAnd(b){var a=nbi();this.bitwiseTo(b,op_and,a);return a}function op_or(a,b){return a|b}function bnOr(b){var a=nbi();this.bitwiseTo(b,op_or,a);return a}function op_xor(a,b){return a^b}function bnXor(b){var a=nbi();this.bitwiseTo(b,op_xor,a);return a}function op_andnot(a,b){return a&~b}function bnAndNot(b){var a=nbi();this.bitwiseTo(b,op_andnot,a);return a}function bnNot(){for(var a=nbi(),b=0;b<this.t;++b)a[b]=this.DM&~this[b];a.t=this.t;a.s=~this.s;return a}function bnShiftLeft(a){var b=nbi();a<0?this.rShiftTo(-a,b):this.lShiftTo(a,b);return b}function bnShiftRight(a){var b=nbi();a<0?this.lShiftTo(-a,b):this.rShiftTo(a,b);return b}function lbit(a){if(a==0)return-1;var b=0;(a&65535)==0&&(a>>=16,b+=16);(a&255)==0&&(a>>=8,b+=8);(a&15)==0&&(a>>=4,b+=4);(a&3)==0&&(a>>=2,b+=2);(a&1)==0&&++b;return b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a)if(this[a]!=0)return a*this.DB+lbit(this[a]);return this.s<0?this.t*this.DB:-1}function cbit(a){for(var b=0;a!=0;)a&=a-1,++b;return b}function bnBitCount(){for(var b=0,c=this.s&this.DM,a=0;a<this.t;++a)b+=cbit(this[a]^c);return b}function bnTestBit(a){var b=Math.floor(a/this.DB);return b>=this.t?this.s!=0:(this[b]&1<<a%this.DB)!=0}function bnpChangeBit(b,c){var a=BigInteger.ONE.shiftLeft(b);this.bitwiseTo(a,c,a);return a}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(d,c){for(var b=0,a=0,e=Math.min(d.t,this.t);b<e;)a+=this[b]+d[b],c[b++]=a&this.DM,a>>=this.DB;if(d.t<this.t){for(a+=d.s;b<this.t;)a+=this[b],c[b++]=a&this.DM,a>>=this.DB;a+=this.s}else{for(a+=this.s;b<d.t;)a+=d[b],c[b++]=a&this.DM,a>>=this.DB;a+=d.s}c.s=a<0?-1:0;a>0?(c[b++]=a):a<-1&&(c[b++]=this.DV+a);c.t=b;c.clamp()}function bnAdd(b){var a=nbi();this.addTo(b,a);return a}function bnSubtract(b){var a=nbi();this.subTo(b,a);return a}function bnMultiply(b){var a=nbi();this.multiplyTo(b,a);return a}function bnSquare(){var a=nbi();this.squareTo(a);return a}function bnDivide(b){var a=nbi();this.divRemTo(b,a,null);return a}function bnRemainder(b){var a=nbi();this.divRemTo(b,null,a);return a}function bnDivideAndRemainder(c){var a=nbi(),b=nbi();this.divRemTo(c,a,b);return[a,b]}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()}function bnpDAddOffset(b,a){if(b!=0){for(;this.t<=a;)this[this.t++]=0;for(this[a]+=b;this[a]>=this.DV;)this[a]-=this.DV,++a>=this.t&&(this[this.t++]=0),++this[a]}}function NullExp(){}function nNop(a){return a}function nMulTo(a,b,c){a.multiplyTo(b,c)}function nSqrTo(a,b){a.squareTo(b)}NullExp.prototype.convert=nNop;NullExp.prototype.revert=nNop;NullExp.prototype.mulTo=nMulTo;NullExp.prototype.sqrTo=nSqrTo;function bnPow(a){return this.exp(a,new NullExp)}function bnpMultiplyLowerTo(c,d,b){var a=Math.min(this.t+c.t,d);b.s=0;for(b.t=a;a>0;)b[--a]=0;for(var e=b.t-this.t;a<e;++a)b[a+this.t]=this.am(0,c[a],b,a,0,this.t);for(e=Math.min(c.t,d);a<e;++a)this.am(0,c[a],b,a,0,d-a);b.clamp()}function bnpMultiplyUpperTo(d,c,b){--c;var a=b.t=this.t+d.t-c;for(b.s=0;--a>=0;)b[a]=0;for(a=Math.max(c-this.t,0);a<d.t;++a)b[this.t+a-c]=this.am(c-a,d[a],b,0,0,this.t+a-c);b.clamp();b.drShiftTo(1,b)}var Barrett=function(a){this.r2=nbi();this.q3=nbi();BigInteger.ONE.dlShiftTo(2*a.t,this.r2);this.mu=this.r2.divide(a);this.m=a};function barrettConvert(a){if(a.s<0||a.t>2*this.m.t)return a.mod(this.m);else if(a.compareTo(this.m)<0)return a;else{var b=nbi();a.copyTo(b);this.reduce(b);return b}}function barrettRevert(a){return a}function barrettReduce(a){a.drShiftTo(this.m.t-1,this.r2);if(a.t>this.m.t+1)a.t=this.m.t+1,a.clamp();this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);for(this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);a.compareTo(this.r2)<0;)a.dAddOffset(1,this.m.t+1);for(a.subTo(this.r2,a);a.compareTo(this.m)>=0;)a.subTo(this.m,a)}function barrettSqrTo(b,a){b.squareTo(a);this.reduce(a)}function barrettMulTo(b,c,a){b.multiplyTo(c,a);this.reduce(a)}Barrett.prototype.convert=barrettConvert;Barrett.prototype.revert=barrettRevert;Barrett.prototype.reduce=barrettReduce;Barrett.prototype.mulTo=barrettMulTo;Barrett.prototype.sqrTo=barrettSqrTo;function bnModPow(g,k){var a=g.bitLength(),j,c=nbv(1),d;if(a<=0)return c;else j=a<18?1:a<48?3:a<144?4:a<768?5:6;d=a<8?new Classic(k):k.isEven()?new Barrett(k):new Montgomery(k);var h=[],b=3,l=j-1,m=(1<<j)-1;h[1]=d.convert(this);if(j>1){a=nbi();for(d.sqrTo(h[1],a);b<=m;)h[b]=nbi(),d.mulTo(a,h[b-2],h[b]),b+=2}for(var e=g.t-1,i,n=!0,f=nbi(),a=nbits(g[e])-1;e>=0;){a>=l?(i=g[e]>>a-l&m):(i=(g[e]&(1<<a+1)-1)<<l-a,e>0&&(i|=g[e-1]>>this.DB+a-l));for(b=j;(i&1)==0;)i>>=1,--b;if((a-=b)<0)a+=this.DB,--e;if(n)h[i].copyTo(c),n=!1;else{for(;b>1;)d.sqrTo(c,f),d.sqrTo(f,c),b-=2;b>0?d.sqrTo(c,f):(b=c,c=f,f=b);d.mulTo(f,h[i],c)}for(;e>=0&&(g[e]&1<<a)==0;)d.sqrTo(c,f),b=c,c=f,f=b,--a<0&&(a=this.DB-1,--e)}return d.revert(c)}function bnGCD(a){var b=this.s<0?this.negate():this.clone(),a=a.s<0?a.negate():a.clone();if(b.compareTo(a)<0)var d=b,b=a,a=d;var d=b.getLowestSetBit(),c=a.getLowestSetBit();if(c<0)return b;d<c&&(c=d);c>0&&(b.rShiftTo(c,b),a.rShiftTo(c,a));for(;b.signum()>0;)(d=b.getLowestSetBit())>0&&b.rShiftTo(d,b),(d=a.getLowestSetBit())>0&&a.rShiftTo(d,a),b.compareTo(a)>=0?(b.subTo(a,b),b.rShiftTo(1,b)):(a.subTo(b,a),a.rShiftTo(1,a));c>0&&a.lShiftTo(c,a);return a}function bnpModInt(a){if(a<=0)return 0;var d=this.DV%a,b=this.s<0?a-1:0;if(this.t>0)if(d==0)b=this[0]%a;else for(var c=this.t-1;c>=0;--c)b=(d*b+this[c])%a;return b}function bnModInverse(b){var h=b.isEven();if(this.isEven()&&h||b.signum()==0)return BigInteger.ZERO;for(var d=b.clone(),e=this.clone(),f=nbv(1),c=nbv(0),g=nbv(0),a=nbv(1);d.signum()!=0;){for(;d.isEven();){d.rShiftTo(1,d);if(h){if(!f.isEven()||!c.isEven())f.addTo(this,f),c.subTo(b,c);f.rShiftTo(1,f)}else c.isEven()||c.subTo(b,c);c.rShiftTo(1,c)}for(;e.isEven();){e.rShiftTo(1,e);if(h){if(!g.isEven()||!a.isEven())g.addTo(this,g),a.subTo(b,a);g.rShiftTo(1,g)}else a.isEven()||a.subTo(b,a);a.rShiftTo(1,a)}d.compareTo(e)>=0?(d.subTo(e,d),h&&f.subTo(g,f),c.subTo(a,c)):(e.subTo(d,e),h&&g.subTo(f,g),a.subTo(c,a))}if(e.compareTo(BigInteger.ONE)!=0)return BigInteger.ZERO;if(a.compareTo(b)>=0)return a.subtract(b);if(a.signum()<0)a.addTo(b,a);else return a;return a.signum()<0?a.add(b):a}var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],lplim=67108864/lowprimes[lowprimes.length-1];function bnIsProbablePrime(e){var a,b=this.abs();if(b.t==1&&b[0]<=lowprimes[lowprimes.length-1]){for(a=0;a<lowprimes.length;++a)if(b[0]==lowprimes[a])return!0;return!1}if(b.isEven())return!1;for(a=1;a<lowprimes.length;){for(var c=lowprimes[a],d=a+1;d<lowprimes.length&&c<lplim;)c*=lowprimes[d++];for(c=b.modInt(c);a<d;)if(c%lowprimes[a++]==0)return!1}return b.millerRabin(e)}function bnpMillerRabin(c){var b=this.subtract(BigInteger.ONE),d=b.getLowestSetBit();if(d<=0)return!1;var g=b.shiftRight(d),c=c+1>>1;if(c>lowprimes.length)c=lowprimes.length;for(var e=nbi(),f=0;f<c;++f){e.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);var a=e.modPow(g,this);if(a.compareTo(BigInteger.ONE)!=0&&a.compareTo(b)!=0){for(var h=1;h++<d&&a.compareTo(b)!=0;)if(a=a.modPowInt(2,this),a.compareTo(BigInteger.ONE)==0)return!1;if(a.compareTo(b)!=0)return!1}}return!0}BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.fromNumber=bnpFromNumber;BigInteger.prototype.bitwiseTo=bnpBitwiseTo;BigInteger.prototype.changeBit=bnpChangeBit;BigInteger.prototype.addTo=bnpAddTo;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo;BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo;BigInteger.prototype.modInt=bnpModInt;BigInteger.prototype.millerRabin=bnpMillerRabin;BigInteger.prototype.clone=bnClone;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.byteValue=bnByteValue;BigInteger.prototype.shortValue=bnShortValue;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.toByteArray=bnToByteArray;BigInteger.prototype.equals=bnEquals;BigInteger.prototype.min=bnMin;BigInteger.prototype.max=bnMax;BigInteger.prototype.and=bnAnd;BigInteger.prototype.or=bnOr;BigInteger.prototype.xor=bnXor;BigInteger.prototype.andNot=bnAndNot;BigInteger.prototype.not=bnNot;BigInteger.prototype.shiftLeft=bnShiftLeft;BigInteger.prototype.shiftRight=bnShiftRight;BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit;BigInteger.prototype.bitCount=bnBitCount;BigInteger.prototype.testBit=bnTestBit;BigInteger.prototype.setBit=bnSetBit;BigInteger.prototype.clearBit=bnClearBit;BigInteger.prototype.flipBit=bnFlipBit;BigInteger.prototype.add=bnAdd;BigInteger.prototype.subtract=bnSubtract;BigInteger.prototype.multiply=bnMultiply;BigInteger.prototype.divide=bnDivide;BigInteger.prototype.remainder=bnRemainder;BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder;BigInteger.prototype.modPow=bnModPow;BigInteger.prototype.modInverse=bnModInverse;BigInteger.prototype.pow=bnPow;BigInteger.prototype.gcd=bnGCD;BigInteger.prototype.isProbablePrime=bnIsProbablePrime;BigInteger.prototype.square=bnSquare;var SecureRandom=function(){function f(c){b[a++]^=c&255;b[a++]^=c>>8&255;b[a++]^=c>>16&255;b[a++]^=c>>24&255;a>=e&&(a-=e)}var d,b,a,e=256;if(b==null){b=[];a=0;var c;if(navigator.appName=="Netscape"&&navigator.appVersion<"5"&&window.crypto){var g=window.crypto.random(32);for(c=0;c<g.length;++c)b[a++]=g.charCodeAt(c)&255}for(;a<e;)c=Math.floor(65536*Math.random()),b[a++]=c>>>8,b[a++]=c&255;a=0;f((new Date).getTime())}this.nextBytes=function(e){for(var c=0;c<e.length;++c){var h=e,i=c,g;if(d==null){f((new Date).getTime());d=new prng_newstate;d.init(b);for(a=0;a<b.length;++a)b[a]=0;a=0}g=d.next();h[i]=g}}},prng_newstate=function(){this.j=this.i=0;this.S=[];this.init=function(d){for(var b,c,a=0;a<256;++a)this.S[a]=a;for(a=b=0;a<256;++a)b=b+this.S[a]+d[a%d.length]&255,c=this.S[a],this.S[a]=this.S[b],this.S[b]=c;this.j=this.i=0};this.next=function(){var a;this.i=this.i+1&255;this.j=this.j+this.S[this.i]&255;a=this.S[this.i];this.S[this.i]=this.S[this.j];this.S[this.j]=a;return this.S[a+this.S[this.i]&255]}},ECFieldElementFp=function(a,b){this.x=b;this.q=a};function feFpEquals(a){return a==this?!0:this.q.equals(a.q)&&this.x.equals(a.x)}function feFpToBigInteger(){return this.x}function feFpNegate(){return new ECFieldElementFp(this.q,this.x.negate().mod(this.q))}function feFpAdd(a){return new ECFieldElementFp(this.q,this.x.add(a.toBigInteger()).mod(this.q))}function feFpSubtract(a){return new ECFieldElementFp(this.q,this.x.subtract(a.toBigInteger()).mod(this.q))}function feFpMultiply(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger()).mod(this.q))}function feFpSquare(){return new ECFieldElementFp(this.q,this.x.square().mod(this.q))}function feFpDivide(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger().modInverse(this.q)).mod(this.q))}ECFieldElementFp.prototype.equals=feFpEquals;ECFieldElementFp.prototype.toBigInteger=feFpToBigInteger;ECFieldElementFp.prototype.negate=feFpNegate;ECFieldElementFp.prototype.add=feFpAdd;ECFieldElementFp.prototype.subtract=feFpSubtract;ECFieldElementFp.prototype.multiply=feFpMultiply;ECFieldElementFp.prototype.square=feFpSquare;ECFieldElementFp.prototype.divide=feFpDivide;var ECPointFp=function(b,c,d,a){this.curve=b;this.x=c;this.y=d;this.z=a==null?BigInteger.ONE:a;this.zinv=null};function pointFpGetX(){if(this.zinv==null)this.zinv=this.z.modInverse(this.curve.q);return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpGetY(){if(this.zinv==null)this.zinv=this.z.modInverse(this.curve.q);return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpEquals(a){return a==this?!0:this.isInfinity()?a.isInfinity():a.isInfinity()?this.isInfinity():!a.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(a.z)).mod(this.curve.q).equals(BigInteger.ZERO)?!1:a.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(a.z)).mod(this.curve.q).equals(BigInteger.ZERO)}function pointFpIsInfinity(){return this.x==null&&this.y==null?!0:this.z.equals(BigInteger.ZERO)&&!this.y.toBigInteger().equals(BigInteger.ZERO)}function pointFpNegate(){return new ECPointFp(this.curve,this.x,this.y.negate(),this.z)}function pointFpAdd(a){if(this.isInfinity())return a;if(a.isInfinity())return this;var b=a.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(a.z)).mod(this.curve.q),c=a.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(a.z)).mod(this.curve.q);if(BigInteger.ZERO.equals(c))return BigInteger.ZERO.equals(b)?this.twice():this.curve.getInfinity();var g=new BigInteger("3"),f=this.x.toBigInteger(),h=this.y.toBigInteger();a.x.toBigInteger();a.y.toBigInteger();var d=c.square(),e=d.multiply(c),f=f.multiply(d),d=b.square().multiply(this.z),c=d.subtract(f.shiftLeft(1)).multiply(a.z).subtract(e).multiply(c).mod(this.curve.q),b=f.multiply(g).multiply(b).subtract(h.multiply(e)).subtract(d.multiply(b)).multiply(a.z).add(b.multiply(e)).mod(this.curve.q),a=e.multiply(this.z).multiply(a.z).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(c),this.curve.fromBigInteger(b),a)}function pointFpTwice(){if(this.isInfinity())return this;if(this.y.toBigInteger().signum()==0)return this.curve.getInfinity();var d=new BigInteger("3"),e=this.x.toBigInteger(),b=this.y.toBigInteger(),c=b.multiply(this.z),f=c.multiply(b).mod(this.curve.q),b=this.curve.a.toBigInteger(),a=e.square().multiply(d);BigInteger.ZERO.equals(b)||(a=a.add(this.z.square().multiply(b)));a=a.mod(this.curve.q);b=a.square().subtract(e.shiftLeft(3).multiply(f)).shiftLeft(1).multiply(c).mod(this.curve.q);d=a.multiply(d).multiply(e).subtract(f.shiftLeft(1)).shiftLeft(2).multiply(f).subtract(a.square().multiply(a)).mod(this.curve.q);c=c.square().multiply(c).shiftLeft(3).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(b),this.curve.fromBigInteger(d),c)}function pointFpMultiply(c){if(this.isInfinity())return this;if(c.signum()==0)return this.curve.getInfinity();for(var d=c.multiply(new BigInteger("3")),f=this.negate(),a=this,b=d.bitLength()-2;b>0;--b){var a=a.twice(),e=d.testBit(b),g=c.testBit(b);e!=g&&(a=a.add(e?this:f))}return a}function pointFpMultiplyTwo(d,e,c){var b;b=d.bitLength()>c.bitLength()?d.bitLength()-1:c.bitLength()-1;for(var a=this.curve.getInfinity(),f=this.add(e);b>=0;)a=a.twice(),d.testBit(b)?(a=c.testBit(b)?a.add(f):a.add(this)):c.testBit(b)&&(a=a.add(e)),--b;return a}ECPointFp.prototype.getX=pointFpGetX;ECPointFp.prototype.getY=pointFpGetY;ECPointFp.prototype.equals=pointFpEquals;ECPointFp.prototype.isInfinity=pointFpIsInfinity;ECPointFp.prototype.negate=pointFpNegate;ECPointFp.prototype.add=pointFpAdd;ECPointFp.prototype.twice=pointFpTwice;ECPointFp.prototype.multiply=pointFpMultiply;ECPointFp.prototype.multiplyTwo=pointFpMultiplyTwo;var ECCurveFp=function(a,b,c){this.q=a;this.a=this.fromBigInteger(b);this.b=this.fromBigInteger(c);this.infinity=new ECPointFp(this,null,null)};function curveFpGetQ(){return this.q}function curveFpGetA(){return this.a}function curveFpGetB(){return this.b}function curveFpEquals(a){return a==this?!0:this.q.equals(a.q)&&this.a.equals(a.a)&&this.b.equals(a.b)}function curveFpGetInfinity(){return this.infinity}function curveFpFromBigInteger(a){return new ECFieldElementFp(this.q,a)}function curveFpDecodePointHex(a){switch(parseInt(a.substr(0,2),16)){case 0:return this.infinity;case 2:case 3:return null;case 4:case 6:case 7:var b=(a.length-2)/2,c=a.substr(2,b),a=a.substr(b+2,b);return new ECPointFp(this,this.fromBigInteger(new BigInteger(c,16)),this.fromBigInteger(new BigInteger(a,16)));default:return null}}ECCurveFp.prototype.getQ=curveFpGetQ;ECCurveFp.prototype.getA=curveFpGetA;ECCurveFp.prototype.getB=curveFpGetB;ECCurveFp.prototype.equals=curveFpEquals;ECCurveFp.prototype.getInfinity=curveFpGetInfinity;ECCurveFp.prototype.fromBigInteger=curveFpFromBigInteger;ECCurveFp.prototype.decodePointHex=curveFpDecodePointHex;ECFieldElementFp.prototype.getByteLength=function(){return Math.floor((this.toBigInteger().bitLength()+7)/8)};ECPointFp.prototype.getEncoded=function(d){var b=function(c,b){var a=c.toByteArrayUnsigned();if(b<a.length)a=a.slice(a.length-b);else for(;b>a.length;)a.unshift(0);return a},a=this.getX().toBigInteger(),c=this.getY().toBigInteger(),a=b(a,32);d?c.isEven()?a.unshift(2):a.unshift(3):(a.unshift(4),a=a.concat(b(c,32)));return a};ECPointFp.decodeFrom=function(c,d){var a=d.length-1,b=d.slice(1,1+a/2),a=d.slice(1+a/2,1+a);b.unshift(0);a.unshift(0);b=new BigInteger(b);a=new BigInteger(a);return new ECPointFp(c,c.fromBigInteger(b),c.fromBigInteger(a))};ECPointFp.decodeFromHex=function(d,b){var c,a;b.substr(0,2);a=b.length-2;c=b.substr(2,a/2);a=b.substr(2+a/2,a/2);c=new BigInteger(c,16);a=new BigInteger(a,16);return new ECPointFp(d,d.fromBigInteger(c),d.fromBigInteger(a))};ECPointFp.prototype.add2D=function(a){if(this.isInfinity())return a;if(a.isInfinity())return this;if(this.x.equals(a.x))return this.y.equals(a.y)?this.twice():this.curve.getInfinity();var b=a.x.subtract(this.x),b=a.y.subtract(this.y).divide(b),a=b.square().subtract(this.x).subtract(a.x),b=b.multiply(this.x.subtract(a)).subtract(this.y);return new ECPointFp(this.curve,a,b)};ECPointFp.prototype.twice2D=function(){if(this.isInfinity())return this;if(this.y.toBigInteger().signum()==0)return this.curve.getInfinity();var a=this.curve.fromBigInteger(BigInteger.valueOf(2)),b=this.curve.fromBigInteger(BigInteger.valueOf(3)),b=this.x.square().multiply(b).add(this.curve.a).divide(this.y.multiply(a)),a=b.square().subtract(this.x.multiply(a)),b=b.multiply(this.x.subtract(a)).subtract(this.y);return new ECPointFp(this.curve,a,b)};ECPointFp.prototype.multiply2D=function(c){if(this.isInfinity())return this;if(c.signum()==0)return this.curve.getInfinity();for(var d=c.multiply(new BigInteger("3")),f=this.negate(),a=this,b=d.bitLength()-2;b>0;--b){var a=a.twice(),e=d.testBit(b),g=c.testBit(b);e!=g&&(a=a.add2D(e?this:f))}return a};ECPointFp.prototype.isOnCurve=function(){var a=this.getX().toBigInteger(),b=this.getY().toBigInteger(),d=this.curve.getA().toBigInteger(),e=this.curve.getB().toBigInteger(),c=this.curve.getQ(),b=b.multiply(b).mod(c),a=a.multiply(a).multiply(a).add(d.multiply(a)).add(e).mod(c);return b.equals(a)};ECPointFp.prototype.toString=function(){return"("+this.getX().toBigInteger().toString()+","+this.getY().toBigInteger().toString()+")"};ECPointFp.prototype.validate=function(){var a=this.curve.getQ();if(this.isInfinity())throw Error("Point is at infinity.");var b=this.getX().toBigInteger(),c=this.getY().toBigInteger();if(b.compareTo(BigInteger.ONE)<0||b.compareTo(a.subtract(BigInteger.ONE))>0)throw Error("x coordinate out of bounds");if(c.compareTo(BigInteger.ONE)<0||c.compareTo(a.subtract(BigInteger.ONE))>0)throw Error("y coordinate out of bounds");if(!this.isOnCurve())throw Error("Point is not on the curve.");if(this.multiply(a).isInfinity())throw Error("Point is not a scalar multiple of G.");return!0};function parseBigInt(a,b){return new BigInteger(a,b)}function linebrk(b,c){for(var d="",a=0;a+c<b.length;)d+=b.substring(a,a+c),a+=c;return d+b.substring(a,b.length)}function byte2Hex(a){return a<16?"0"+a.toString(16):a.toString(16)}function Utf8Encode(c){for(var c=c.replace(/\r\n/g,"\n"),b="",d=0;d<c.length;d++){var a=c.charCodeAt(d);a<128?(b+=String.fromCharCode(a)):(a>127&&a<2048?(b+=String.fromCharCode(a>>6|192)):(b+=String.fromCharCode(a>>12|224),b+=String.fromCharCode(a>>6&63|128)),b+=String.fromCharCode(a&63|128))}return b}function pkcs1pad2(e,b){for(var c=[],d=e.length-1;d>=0&&b>0;){var a=e.charCodeAt(d--);a<128?(c[--b]=a):a>127&&a<2048?(c[--b]=a&63|128,c[--b]=a>>6|192):(c[--b]=a&63|128,c[--b]=a>>6&63|128,c[--b]=a>>12|224)}c[--b]=0;d=new SecureRandom;for(a=[];b>2;){for(a[0]=0;a[0]==0;)d.nextBytes(a);c[--b]=a[0]}c[--b]=2;c[--b]=0;return new BigInteger(c)}function RSAKey(){this.n=null;this.e=0;this.coeff=this.dmq1=this.dmp1=this.q=this.p=this.d=null}function RSASetPublic(a,b){a!=null&&b!=null&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16)):alert("Invalid RSA public key")}function RSADoPublic(a){return a.modPowInt(this.e,this.n)}function RSAEncrypt(a){a=pkcs1pad2(a,this.n.bitLength()+7>>3);if(a==null)return null;a=RSADoPublic(a);if(a==null)return null;a=a.toString(16);return(a.length&1)==0?a:"0"+a}function getencryptoRSA(){var a=new RSAKey;a.generate(512,"10001");return a}function encryptbyrsa(a,b,c){RSASetPublic(a,b);a=RSAEncrypt(c);return linebrk(a,64)}RSAKey.prototype.doPublic=RSADoPublic;RSAKey.prototype.setPublic=RSASetPublic;RSAKey.prototype.encrypt=RSAEncrypt;function pkcs1unpad2(e,f){for(var b=e.toByteArray(),a=0;a<b.length&&b[a]==0;)++a;if(b.length-a!=f-1||b[a]!=2)return null;for(++a;b[a]!=0;)if(++a>=b.length)return null;for(var d="";++a<b.length;){var c=b[a]&255;c<128?(d+=String.fromCharCode(c)):c>191&&c<224?(d+=String.fromCharCode((c&31)<<6|b[a+1]&63),++a):(d+=String.fromCharCode((c&15)<<12|(b[a+1]&63)<<6|b[a+2]&63),a+=2)}return d}function RSASetPrivate(a,b,c){a!=null&&b!=null&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16),this.d=parseBigInt(c,16)):alert("Invalid RSA private key")}function RSASetPrivateEx(a,b,d,c,f,e,g,h){a!=null&&b!=null&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16),this.d=parseBigInt(d,16),this.p=parseBigInt(c,16),this.q=parseBigInt(f,16),this.dmp1=parseBigInt(e,16),this.dmq1=parseBigInt(g,16),this.coeff=parseBigInt(h,16)):alert("Invalid RSA private key")}function RSAGenerate(c,f){var e=new SecureRandom,d=c>>1;this.e=parseInt(f,16);for(var a=new BigInteger(f,16);true;){for(;true;)if(this.p=new BigInteger(c-d,1,e),this.p.subtract(BigInteger.ONE).gcd(a).compareTo(BigInteger.ONE)==0&&this.p.isProbablePrime(10))break;for(;true;)if(this.q=new BigInteger(d,1,e),this.q.subtract(BigInteger.ONE).gcd(a).compareTo(BigInteger.ONE)==0&&this.q.isProbablePrime(10))break;if(this.p.compareTo(this.q)<=0){var b=this.p;this.p=this.q;this.q=b}var b=this.p.subtract(BigInteger.ONE),g=this.q.subtract(BigInteger.ONE),h=b.multiply(g);if(h.gcd(a).compareTo(BigInteger.ONE)==0){this.n=this.p.multiply(this.q);this.d=a.modInverse(h);this.dmp1=this.d.mod(b);this.dmq1=this.d.mod(g);this.coeff=this.q.modInverse(this.p);break}}}function RSADoPrivate(a){if(this.p==null||this.q==null)return a.modPow(this.d,this.n);for(var b=a.mod(this.p).modPow(this.dmp1,this.p),a=a.mod(this.q).modPow(this.dmq1,this.q);b.compareTo(a)<0;)b=b.add(this.p);return b.subtract(a).multiply(this.coeff).mod(this.p).multiply(this.q).add(a)}function RSADecrypt(a){a=parseBigInt(a,16);a=RSADoPrivate(a);return a==null?null:pkcs1unpad2(a,this.n.bitLength()+7>>3)}function decryptbyrsa(a,d,c,b){RSASetPrivate(a,d,c);return RSADecrypt(b)}RSAKey.prototype.doPrivate=RSADoPrivate;RSAKey.prototype.setPrivate=RSASetPrivate;RSAKey.prototype.setPrivateEx=RSASetPrivateEx;RSAKey.prototype.generate=RSAGenerate;RSAKey.prototype.decrypt=RSADecrypt;var SM3Digest=function(){this.BYTE_LENGTH=64;this.xBuf=[];this.byteCount=this.xBufOff=0;this.DIGEST_LENGTH=32;this.v0=[1937774191,1226093241,388252375,3666478592,2842636476,372324522,3817729613,2969243214];this.v0=[1937774191,1226093241,388252375,-628488704,-1452330820,372324522,-477237683,-1325724082];this.v=Array(8);this.v_=Array(8);this.X0=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];this.X=Array(68);this.xOff=0;this.T_00_15=2043430169;this.T_16_63=2055708042;arguments.length>0?this.InitDigest(arguments[0]):this.Init()};SM3Digest.prototype={Init:function(){this.xBuf=Array(4);this.Reset()},InitDigest:function(a){this.xBuf=Array(a.xBuf.length);Array.Copy(a.xBuf,0,this.xBuf,0,a.xBuf.length);this.xBufOff=a.xBufOff;this.byteCount=a.byteCount;Array.Copy(a.X,0,this.X,0,a.X.length);this.xOff=a.xOff;Array.Copy(a.v,0,this.v,0,a.v.length)},GetDigestSize:function(){return this.DIGEST_LENGTH},Reset:function(){this.xBufOff=this.byteCount=0;Array.Clear(this.xBuf,0,this.xBuf.length);Array.Copy(this.v0,0,this.v,0,this.v0.length);this.xOff=0;Array.Copy(this.X0,0,this.X,0,this.X0.length)},GetByteLength:function(){return this.BYTE_LENGTH},ProcessBlock:function(){for(var e=this.X,f=Array(64),b=16;b<68;b++)e[b]=this.P1(e[b-16]^e[b-9]^this.ROTATE(e[b-3],15))^this.ROTATE(e[b-13],7)^e[b-6];for(b=0;b<64;b++)f[b]=e[b]^e[b+4];var g=this.v,a=this.v_;Array.Copy(g,0,a,0,this.v0.length);var c,d;for(b=0;b<16;b++)d=this.ROTATE(a[0],12),c=Int32.parse(Int32.parse(d+a[4])+this.ROTATE(this.T_00_15,b)),c=this.ROTATE(c,7),d^=c,d=Int32.parse(Int32.parse(this.FF_00_15(a[0],a[1],a[2])+a[3])+d)+f[b],c=Int32.parse(Int32.parse(this.GG_00_15(a[4],a[5],a[6])+a[7])+c)+e[b],a[3]=a[2],a[2]=this.ROTATE(a[1],9),a[1]=a[0],a[0]=d,a[7]=a[6],a[6]=this.ROTATE(a[5],19),a[5]=a[4],a[4]=this.P0(c);for(b=16;b<64;b++)d=this.ROTATE(a[0],12),c=Int32.parse(Int32.parse(d+a[4])+this.ROTATE(this.T_16_63,b)),c=this.ROTATE(c,7),d^=c,d=Int32.parse(Int32.parse(this.FF_16_63(a[0],a[1],a[2])+a[3])+d)+f[b],c=Int32.parse(Int32.parse(this.GG_16_63(a[4],a[5],a[6])+a[7])+c)+e[b],a[3]=a[2],a[2]=this.ROTATE(a[1],9),a[1]=a[0],a[0]=d,a[7]=a[6],a[6]=this.ROTATE(a[5],19),a[5]=a[4],a[4]=this.P0(c);for(b=0;b<8;b++)g[b]^=Int32.parse(a[b]);this.xOff=0;Array.Copy(this.X0,0,this.X,0,this.X0.length)},ProcessWord:function(a,c){var b=a[c]<<24;b|=(a[++c]&255)<<16;b|=(a[++c]&255)<<8;b|=a[++c]&255;this.X[this.xOff]=b;++this.xOff==16&&this.ProcessBlock()},ProcessLength:function(a){this.xOff>14&&this.ProcessBlock();this.X[14]=this.URShiftLong(a,32);this.X[15]=a&4294967295},IntToBigEndian:function(a,c,b){c[b]=Int32.parseByte(this.URShift(a,24));c[++b]=Int32.parseByte(this.URShift(a,16));c[++b]=Int32.parseByte(this.URShift(a,8));c[++b]=Int32.parseByte(a)},DoFinal:function(b,c){this.Finish();for(var a=0;a<8;a++)this.IntToBigEndian(this.v[a],b,c+a*4);this.Reset();return this.DIGEST_LENGTH},Update:function(a){this.xBuf[this.xBufOff++]=a;if(this.xBufOff==this.xBuf.length)this.ProcessWord(this.xBuf,0),this.xBufOff=0;this.byteCount++},BlockUpdate:function(c,b,a){for(;this.xBufOff!=0&&a>0;)this.Update(c[b]),b++,a--;for(;a>this.xBuf.length;)this.ProcessWord(c,b),b+=this.xBuf.length,a-=this.xBuf.length,this.byteCount+=this.xBuf.length;for(;a>0;)this.Update(c[b]),b++,a--},Finish:function(){var a=this.byteCount<<3;for(this.Update(128);this.xBufOff!=0;)this.Update(0);this.ProcessLength(a);this.ProcessBlock()},ROTATE:function(a,b){return a<<b|this.URShift(a,32-b)},P0:function(a){return a^this.ROTATE(a,9)^this.ROTATE(a,17)},P1:function(a){return a^this.ROTATE(a,15)^this.ROTATE(a,23)},FF_00_15:function(a,c,b){return a^c^b},FF_16_63:function(a,c,b){return a&c|a&b|c&b},GG_00_15:function(a,c,b){return a^c^b},GG_16_63:function(a,c,b){return a&c|~a&b},URShift:function(a,b){if(a>Int32.maxValue||a<Int32.minValue)a=Int32.parse(a);return a>=0?a>>b:(a>>b)+(2<<~b)},URShiftLong:function(e,c){var a;a=new BigInteger;a.fromInt(e);if(a.signum()>=0)a=a.shiftRight(c).intValue();else{var b=new BigInteger;b.fromInt(2);var d=~c;a="";if(d<0){b=64+d;for(d=0;d<b;d++)a+="0";b=new BigInteger;b.fromInt(e>>c);a=new BigInteger("10"+a,2);a.toRadix(10);a=a.add(b).toRadix(10)}else a=b.shiftLeft(~c).intValue(),a=(e>>c)+a}return a},GetZ:function(b,d){var a=CryptoJS.enc.Utf8.parse("1234567812345678"),c=a.words.length*32;this.Update(c>>8&255);this.Update(c&255);a=this.GetWords(a.toString());this.BlockUpdate(a,0,a.length);var a=this.GetWords(b.curve.a.toBigInteger().toRadix(16)),c=this.GetWords(b.curve.b.toBigInteger().toRadix(16)),e=this.GetWords(b.getX().toBigInteger().toRadix(16)),f=this.GetWords(b.getY().toBigInteger().toRadix(16)),g=this.GetWords(d.substr(0,64)),h=this.GetWords(d.substr(64,64));this.BlockUpdate(a,0,a.length);this.BlockUpdate(c,0,c.length);this.BlockUpdate(e,0,e.length);this.BlockUpdate(f,0,f.length);this.BlockUpdate(g,0,g.length);this.BlockUpdate(h,0,h.length);a=Array(this.GetDigestSize());this.DoFinal(a,0);return a},GetWords:function(c){for(var a=[],d=c.length,b=0;b<d;b+=2)a[a.length]=parseInt(c.substr(b,2),16);return a},GetHex:function(b){for(var d=[],c=0,a=0;a<b.length*2;a+=2)d[a>>>3]|=parseInt(b[c])<<24-a%8*4,c++;return new WordArray(d,b.length)},encrypt:function(a){var b=new charSet,a=this.GetWords(b.HexStringify(b.parseUTF8(a))),c=Array(32);this.BlockUpdate(a,0,a.length);this.DoFinal(c,0);return b.HexStringify(this.GetHex(c))}};Array.Clear=function(a){for(elm in a)a[elm]=null};Array.Copy=function(b,a,d,c,e){b=b.slice(a,a+e);for(a=0;a<b.length;a++)d[c]=b[a],c++};window.Int32={minValue:-parseInt("10000000000000000000000000000000",2),maxValue:parseInt("1111111111111111111111111111111",2),parse:function(a){if(a<this.minValue){for(var a=new Number(-a),a=a.toString(2),a=a.substr(a.length-31,31),c="",b=0;b<a.length;b++){var d=a.substr(b,1);c+=d=="0"?"1":"0"}a=parseInt(c,2);return a+1}else if(a>this.maxValue){a=Number(a).toString(2);a=a.substr(a.length-31,31);c="";for(b=0;b<a.length;b++)d=a.substr(b,1),c+=d=="0"?"1":"0";a=parseInt(c,2);return-(a+1)}else return a},parseByte:function(a){if(a<0){for(var a=new Number(-a),a=a.toString(2),a=a.substr(a.length-8,8),c="",b=0;b<a.length;b++){var d=a.substr(b,1);c+=d=="0"?"1":"0"}return parseInt(c,2)+1}else return a>255?(a=Number(a).toString(2),parseInt(a.substr(a.length-8,8),2)):a}};if(typeof KJUR=="undefined"||!KJUR)KJUR={};if(typeof KJUR.crypto=="undefined"||!KJUR.crypto)KJUR.crypto={};KJUR.crypto.SM3withSM2=function(a){var b=new SecureRandom;this.type="SM2";this.getBigRandom=function(a){return(new BigInteger(a.bitLength(),b)).mod(a.subtract(BigInteger.ONE)).add(BigInteger.ONE)};this.setNamedCurve=function(a){this.ecparams=KJUR.crypto.ECParameterDB.getByName(a);this.pubKeyHex=this.prvKeyHex=null;this.curveName=a};this.setPrivateKeyHex=function(a){this.isPrivate=!0;this.prvKeyHex=a};this.setPublicKeyHex=function(a){this.isPublic=!0;this.pubKeyHex=a};this.generateKeyPairHex=function(){var a=this.getBigRandom(this.ecparams.n),b=this.ecparams.G.multiply(a),c=b.getX().toBigInteger(),b=b.getY().toBigInteger(),d=this.ecparams.keylen/4,a=("0000000000"+a.toString(16)).slice(-d),c=("0000000000"+c.toString(16)).slice(-d),b=("0000000000"+b.toString(16)).slice(-d),c="04"+c+b;this.setPrivateKeyHex(a);this.setPublicKeyHex(c);return{ecprvhex:a,ecpubhex:c}};this.signWithMessageHash=function(a){return this.signHex(a,this.prvKeyHex)};this.signHex=function(g,h){var e=new BigInteger(h,16),b=this.ecparams.n,i=new BigInteger(g,16),d=null,a=null,c=a=null;do{do a=this.generateKeyPairHex(),d=new BigInteger(a.ecprvhex,16),a=ECPointFp.decodeFromHex(this.ecparams.curve,a.ecpubhex),a=i.add(a.getX().toBigInteger()),a=a.mod(b);while(a.equals(BigInteger.ZERO)||a.add(d).equals(b));var f=e.add(BigInteger.ONE),f=f.modInverse(b),c=a.multiply(e),c=d.subtract(c).mod(b),c=f.multiply(c).mod(b)}while(c.equals(BigInteger.ZERO));return KJUR.crypto.ECDSA.biRSSigToASN1Sig(a,c)};this.sign=function(d,e){var a=this.ecparams.n,f=BigInteger.fromByteArrayUnsigned(d);do var c=this.getBigRandom(a),b=this.ecparams.G.multiply(c).getX().toBigInteger().mod(a);while(b.compareTo(BigInteger.ZERO)<=0);a=c.modInverse(a).multiply(f.add(e.multiply(b))).mod(a);return this.serializeSig(b,a)};this.verifyWithMessageHash=function(a,b){return this.verifyHex(a,b,this.pubKeyHex)};this.verifyHex=function(d,b,c){var a;a=KJUR.crypto.ECDSA.parseSigHex(b);b=a.r;a=a.s;c=ECPointFp.decodeFromHex(this.ecparams.curve,c);return this.verifyRaw(new BigInteger(d,16),b,a,c)};this.verify=function(d,a,b){var c;if(Bitcoin.Util.isArray(a))a=this.parseSig(a),c=a.r,a=a.s;else if("object"===typeof a&&a.r&&a.s)c=a.r,a=a.s;else throw"Invalid value for signature";if(!(b instanceof ECPointFp))if(Bitcoin.Util.isArray(b))b=ECPointFp.decodeFrom(this.ecparams.curve,b);else throw"Invalid format for pubkey value, must be byte array or ECPointFp";return this.verifyRaw(BigInteger.fromByteArrayUnsigned(d),c,a,b)};this.verifyRaw=function(b,c,a,f){var d=this.ecparams.n,g=this.ecparams.G,e=c.add(a).mod(d);if(e.equals(BigInteger.ZERO))return!1;a=g.multiply(a);a=a.add(f.multiply(e));b=b.add(a.getX().toBigInteger()).mod(d);return c.equals(b)};this.serializeSig=function(d,e){var b=d.toByteArraySigned(),c=e.toByteArraySigned(),a=[];a.push(2);a.push(b.length);a=a.concat(b);a.push(2);a.push(c.length);a=a.concat(c);a.unshift(a.length);a.unshift(48);return a};this.parseSig=function(a){var b;if(a[0]!=48)throw Error("Signature not a valid DERSequence");b=2;if(a[b]!=2)throw Error("First element in signature must be a DERInteger");var c=a.slice(b+2,b+2+a[b+1]);b+=2+a[b+1];if(a[b]!=2)throw Error("Second element in signature must be a DERInteger");a=a.slice(b+2,b+2+a[b+1]);c=BigInteger.fromByteArrayUnsigned(c);a=BigInteger.fromByteArrayUnsigned(a);return{r:c,s:a}};this.parseSigCompact=function(a){if(a.length!==65)throw"Signature has the wrong length";var b=a[0]-27;if(b<0||b>7)throw"Invalid signature type";var c=this.ecparams.n,d=BigInteger.fromByteArrayUnsigned(a.slice(1,33)).mod(c),a=BigInteger.fromByteArrayUnsigned(a.slice(33,65)).mod(c);return{r:d,s:a,i:b}};if(a!==void 0&&a.curve!==void 0)this.curveName=a.curve;if(this.curveName===void 0)this.curveName="sm2";this.setNamedCurve(this.curveName);a!==void 0&&(a.prv!==void 0&&this.setPrivateKeyHex(a.prv),a.pub!==void 0&&this.setPublicKeyHex(a.pub))};if(typeof KJUR=="undefined"||!KJUR)KJUR={};if(typeof KJUR.crypto=="undefined"||!KJUR.crypto)KJUR.crypto={};KJUR.crypto.ECParameterDB=new function(){var a={},b={};this.getByName=function(d){var c=d;typeof b[c]!="undefined"&&(c=b[d]);if(typeof a[c]!="undefined")return a[c];throw"unregistered EC curve name: "+c;};this.regist=function(c,e,d,f,g,h,i,j,l,k,m,n){a[c]={};d=new BigInteger(d,16);f=new BigInteger(f,16);g=new BigInteger(g,16);h=new BigInteger(h,16);i=new BigInteger(i,16);d=new ECCurveFp(d,f,g);j=d.decodePointHex("04"+j+l);a[c].name=c;a[c].keylen=e;a[c].curve=d;a[c].G=j;a[c].n=h;a[c].h=i;a[c].oid=m;a[c].info=n;for(e=0;e<k.length;e++)b[k[e]]=c}};KJUR.crypto.ECParameterDB.regist("sm2",256,"FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF","FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC","28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93","FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123","1","32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7","BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0",["sm2","SM2"]);var SboxTable=[[214,144,233,254,204,225,61,183,22,182,20,194,40,251,44,5],[43,103,154,118,42,190,4,195,170,68,19,38,73,134,6,153],[156,66,80,244,145,239,152,122,51,84,11,67,237,207,172,98],[228,179,28,169,201,8,232,149,128,223,148,250,117,143,63,166],[71,7,167,252,243,115,23,186,131,89,60,25,230,133,79,168],[104,107,129,178,113,100,218,139,248,235,15,75,112,86,157,53],[30,36,14,94,99,88,209,162,37,34,124,59,1,33,120,135],[212,0,70,87,159,211,39,82,76,54,2,231,160,196,200,158],[234,191,138,210,64,199,56,181,163,247,242,206,249,97,21,161],[224,174,93,164,155,52,26,85,173,147,50,48,245,140,177,227],[29,246,226,46,130,102,202,96,192,41,35,171,13,83,78,111],[213,219,55,69,222,253,142,47,3,255,106,114,109,108,91,81],[141,27,175,146,187,221,188,127,17,217,92,65,31,16,90,216],[10,193,49,136,165,205,123,189,45,116,208,18,184,229,180,176],[137,105,151,74,12,150,119,126,101,185,241,9,197,110,198,132],[24,240,125,236,58,220,77,32,121,238,95,62,215,203,57,72]],CK=[462357,472066609,943670861,1415275113,1886879365,2358483617,2830087869,3301692121,3773296373,4228057617,404694573,876298825,1347903077,1819507329,2291111581,2762715833,3234320085,3705924337,4177462797,337322537,808926789,1280531041,1752135293,2223739545,2695343797,3166948049,3638552301,4110090761,269950501,741554753,1213159005,1684763257],FK=[2746333894,1453994832,1736282519,2993693404];function bigxor(a,b){return a^b}function leftshift(b,a){a%=32;return b<<a|b>>>32-a}function prefixInteger(b,a){return Array(a+1).join("0").split("").concat(String(b).split("")).slice(-a).join("")}function sm4Sbox(a){return SboxTable[(a&4026531840)>>>28][(a&251658240)>>>24]<<24|SboxTable[(a&15728640)>>>20][(a&983040)>>>16]<<16|SboxTable[(a&61440)>>>12][(a&3840)>>>8]<<8|SboxTable[(a&240)>>>4][(a&15)>>>0]<<0}function GET_ULONG_BE(a){a=sm4Sbox(a);return bigxor(bigxor(bigxor(a,leftshift(a,2)),bigxor(leftshift(a,10),leftshift(a,18))),leftshift(a,24))}function PUT_ULONG_BE(a){a=sm4Sbox(a);return bigxor(a,bigxor(leftshift(a,13),leftshift(a,23)))}function sm4_getkey(a){var b=[],c=[];b[0]=bigxor(a[0],FK[0]);b[1]=bigxor(a[1],FK[1]);b[2]=bigxor(a[2],FK[2]);b[3]=bigxor(a[3],FK[3]);for(a=0;a<32;a++)b[a+4]=bigxor(b[a],PUT_ULONG_BE(bigxor(bigxor(b[a+1],b[a+2]),bigxor(b[a+3],CK[a])))),c[a]=b[a+4].toString(16);return c}function KJUR_encrypt_sm4(e,f){for(var g=Math.ceil(e.length/4),d=[],c=0;c<g;c++){for(var a=e.slice(c*4,(c+1)*4),h=sm4_getkey(f),b=0;b<32;b++)a[b+4]=bigxor(a[b],GET_ULONG_BE(bigxor(bigxor(a[b+1],a[b+2]),bigxor(a[b+3],parseInt(h[b],16)))));d=d.concat([a[35].toString(10),a[34].toString(10),a[33].toString(10),a[32].toString(10)])}return new WordArray(d)}function KJUR_decrypt_sm4(f,h){for(var i=Math.ceil(f.length/4),d=[],c=0;c<i;c++){for(var b=f.slice(c*4,(c+1)*4),e=sm4_getkey(h),g=[],a=e.length-1;a>=0;a--)g[e.length-1-a]=e[a];for(a=0;a<32;a++)b[a+4]=bigxor(b[a],GET_ULONG_BE(bigxor(bigxor(b[a+1],b[a+2]),bigxor(b[a+3],parseInt(g[a],16)))));d=d.concat([b[35].toString(10),b[34].toString(10),b[33].toString(10),b[32].toString(10)])}return new WordArray(d)}function SM2Cipher(){this.ct=1;this.sm3c3=this.sm3keybase=this.p2=null;this.key=Array(32);this.keyOff=0}SM2Cipher.prototype={Reset:function(){this.sm3keybase=new SM3Digest;this.sm3c3=new SM3Digest;var a=this.p2.getX().toBigInteger().toRadix(16),b=this.p2.getY().toBigInteger().toRadix(16);if(a.length!=64)for(var d=64-a.length,c=0;c<d;c++)a="0"+a;if(b.length!=64&&b.length!=64){d=64-b.length;for(c=0;c<d;c++)b="0"+b}a=this.GetWords(a);b=this.GetWords(b);if(a.length!=32)for(c=0;c<32-a.length;c++)d=[0],a=d.concat(a);if(b.length!=32)for(c=0;c<32-b.length;c++)d=[0],b=d.concat(b);this.sm3keybase.BlockUpdate(a,0,a.length);this.sm3c3.BlockUpdate(a,0,a.length);this.sm3keybase.BlockUpdate(b,0,b.length);this.ct=1;this.NextKey()},NextKey:function(){var a=new SM3Digest(this.sm3keybase);a.Update(this.ct>>24&255);a.Update(this.ct>>16&255);a.Update(this.ct>>8&255);a.Update(this.ct&255);a.DoFinal(this.key,0);this.keyOff=0;this.ct++},InitEncipher:function(h){var b=null,c=null,c=new KJUR.crypto.SM3withSM2({curve:"sm2"}),d=c.generateKeyPairHex(),a=d.ecpubhex,b=a.length-2,e=a.substr(2,b/2),f=new BigInteger(e,16);e.charAt(0);var a=a.substr(2+b/2,b/2),g=new BigInteger(a,16);for(a.charAt(0);e.charAt(0)=="0"||a.charAt(0)=="0"||f.t!=10||g.t!=10;)d=c.generateKeyPairHex(),a=d.ecpubhex,e=a.substr(2,b/2),a=a.substr(2+b/2,b/2),f=new BigInteger(e,16),g=new BigInteger(a,16);b=new BigInteger(d.ecprvhex,16);c=ECPointFp.decodeFromHex(c.ecparams.curve,d.ecpubhex);this.p2=h.multiply(b);this.Reset();return c},EncryptBlock:function(a){this.sm3c3.BlockUpdate(a,0,a.length);for(var b=0;b<a.length;b++){this.keyOff==this.key.length&&this.NextKey();var c=this.key[this.keyOff++];c==256&&(c=0);a[b]^=c}},InitDecipher:function(b,a){this.p2=a.multiply(b);this.Reset()},DecryptBlock:function(a){for(var b=0;b<a.length;b++){this.keyOff==this.key.length&&this.NextKey();var c=this.key[this.keyOff++];c==256&&(c=0);a[b]^=c}this.sm3c3.BlockUpdate(a,0,a.length)},Dofinal:function(b){this.p2.getY().toBigInteger();var a=this.GetWords(this.p2.getY().toBigInteger().toRadix(16));this.sm3c3.BlockUpdate(a,0,a.length);this.sm3c3.DoFinal(b,0);this.Reset()},Encrypt:function(h,f){var b=Array(f.length);Array.Copy(f,0,b,0,f.length);var a=this.InitEncipher(h);this.EncryptBlock(b);var e=Array(32);this.Dofinal(e);var c=a.getX().toBigInteger().toRadix(16);if(c.length!=64)for(var g=64-c.length,d=0;d<g;d++)c="0"+c;a=a.getY().toBigInteger().toRadix(16);if(a.length!=64&&a.length!=64){g=64-a.length;for(d=0;d<g;d++)a="0"+a}b=this.GetHex(b).toString();e=this.GetHex(e).toString();return c+a+b+e},GetWords:function(b){var d=[],c=b.length;if(c<64&&c>60)for(var e=64-c,a=0;a<e;a++)b="0"+b;for(a=0;a<c;a+=2)e=b.substr(a,2),d[d.length]=parseInt(e,16);return d},GetHex:function(b){for(var c=[],d=0,a=0;a<b.length*2;a+=2)c[a>>>3]|=parseInt(b[d])<<24-a%8*4,d++;return new WordArray(c,b.length)},Decrypt:function(f,b){var a=b.substr(0,64),c=b.substr(0+a.length,64),d=b.substr(a.length+c.length,b.length-a.length-c.length-64),e=b.substr(b.length-64),d=this.GetWords(d),a=this.CreatePoint(a,c);this.InitDecipher(f,a);this.DecryptBlock(d);a=Array(32);this.Dofinal(a);if(this.GetHex(a).toString()==e)var e=this.GetHex(d),g=(new charSet).stringifyUTF8(e);else console.error("decrypt error!");return g},CreatePoint:function(b,a){var c=new KJUR.crypto.SM3withSM2({curve:"sm2"});return ECPointFp.decodeFromHex(c.ecparams.curve,"04"+b+a)}};function encryptbySM2(e,a){var b=(new charSet).parseUTF8(e);a.length>128&&(a=a.substr(a.length-128));var d=a.substr(0,64),f=a.substr(64),c=new SM2Cipher,d=c.CreatePoint(d,f),b=c.GetWords(b.toString()),b=c.Encrypt(d,b);return"04"+b}function decryptbySM2(a,b){var a=a.substring(2,a.length),c=new BigInteger(b,16);return(new SM2Cipher).Decrypt(c,a)}function encryptbySM3(a){return(new SM3Digest).encrypt(a)}function encryptbySM4(b,c){var a=new charSet,d=KJUR_encrypt_sm4(a.parseUTF8(b).getArrs(),a.parseUTF8(c).getArrs());return a.HexStringify(d)}function decryptbySM4(c,d){var a=new charSet,b=a.HexParse(c),a=a.parseUTF8(d),b=KJUR_decrypt_sm4(b.getArrs(),a.getArrs());return(new charSet).stringifyUTF8(b)}function encryptbyRSA(a,b,c){return encryptbyrsa(a,b,c)}function decryptbyRSA(a,b,c,d){return decryptbyrsa(a,b,c,d)}function encryptbySHA1(a){return(new sha1Obj).encryptbysha1(a)}function encryptbySHA256(a){return(new SHA256Obj).encryptbysha256(a)}function encryptbyMD5(a){return(new md5Obj).encryptbymd5(a)}function encryptbyDES(a,b){return(new desObj).encryptbydes(b,a)}function decryptbyDES(a,b){return(new desObj).decryptbydes(b,a)}function encryptby3DES(a,b){return(new desObj).encryptbyTripledes(b,a)}function decryptby3DES(a,b){return(new desObj).decryptbyTripledes(b,a)}function encryptbyBASE64(a){return(new base64Obj).encryptbybase64(a)}function decryptbyBASE64(a){return(new base64Obj).decryptbybase64(a)}function encryptbyAES(a,b){return(new aesObj).encryptbyaes(b,a)}function decryptbyAES(a,b){return(new aesObj).decryptbyaes(b,a)}
    function rc4Init(key) {
        var s = [],
            j = 0,
            x;
        for (var i = 0; i < 256; i++) {
            s[i] = i;
        }
        for ( i = 0; i < 256; i++) {
            j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
        }
        return s;
    }

    /*
     用rc4 进行加解密
     @param String str 要加密的数据
     @param Array s 初始化好的s-box

     */
    function rc4Encrypt(str, s) {
        var i = 0;
        var j = 0;
        var res = '';
        var k = [];
        var x = null;
        k = k.concat(s);
        for (var y = 0; y < str.length; y++) {
            i = (i + 1) % 256;
            j = (j + k[i]) % 256;
            x = k[i];
            k[i] = k[j];
            k[j] = x;
            var dest = str.charCodeAt(y) ^ k[(k[i] + k[j]) % 256] || str.charCodeAt(y)
            res +=String.fromCharCode(dest);

        }
        return res;
    }

    /*
     直接加密数据合并两个方法

     */
    function CustomEncrypt(key, content) {
        if (!key || !content) {
            return '';
        }
        var sbox = rc4Init(key);
        return rc4Encrypt(content, sbox);
    }

    function MD5(data) {

        // convert number to (unsigned) 32 bit hex, zero filled string
        function to_zerofilled_hex(n) {
            var t1 = (n >>> 0).toString(16)
            return "00000000".substr(0, 8 - t1.length) + t1
        }

        // convert array of chars to array of bytes
        function chars_to_bytes(ac) {
            var retval = []
            for (var i = 0; i < ac.length; i++) {
                retval = retval.concat(str_to_bytes(ac[i]))
            }
            return retval
        }

        // convert a 64 bit unsigned number to array of bytes. Little endian
        function int64_to_bytes(num) {
            var retval = []
            for (var i = 0; i < 8; i++) {
                retval.push(num & 0xFF)
                num = num >>> 8
            }
            return retval
        }

        //  32 bit left-rotation
        function rol(num, places) {
            return ((num << places) & 0xFFFFFFFF) | (num >>> (32 - places))
        }

        // The 4 MD5 functions
        function fF(b, c, d) {
            return (b & c) | (~b & d)
        }

        function fG(b, c, d) {
            return (d & b) | (~d & c)
        }

        function fH(b, c, d) {
            return b ^ c ^ d
        }

        function fI(b, c, d) {
            return c ^ (b | ~d)
        }

        // pick 4 bytes at specified offset. Little-endian is assumed
        function bytes_to_int32(arr, off) {
            return (arr[off + 3] << 24) | (arr[off + 2] << 16) | (arr[off + 1] << 8) | (arr[off])
        }

        /*
         Conver string to array of bytes in UTF-8 encoding
         See:
         http://www.dangrossman.info/2007/05/25/handling-utf-8-in-javascript-php-and-non-utf8-databases/
         http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string
         How about a String.getBytes(<ENCODING>) for Javascript!? Isn't it time to add it?
         */
        function str_to_bytes(str) {
            var retval = []
            for (var i = 0; i < str.length; i++)
                if (str.charCodeAt(i) <= 0x7F) {
                    retval.push(str.charCodeAt(i))
                } else {
                    var tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
                    for (var j = 0; j < tmp.length; j++) {
                        retval.push(parseInt(tmp[j], 0x10))
                    }
                }
            return retval
        }

        // convert the 4 32-bit buffers to a 128 bit hex string. (Little-endian is assumed)
        function int128le_to_hex(a, b, c, d) {
            var ra = ""
            var t = 0
            var ta = 0
            for (var i = 3; i >= 0; i--) {
                ta = arguments[i]
                t = (ta & 0xFF)
                ta = ta >>> 8
                t = t << 8
                t = t | (ta & 0xFF)
                ta = ta >>> 8
                t = t << 8
                t = t | (ta & 0xFF)
                ta = ta >>> 8
                t = t << 8
                t = t | ta
                ra = ra + to_zerofilled_hex(t)
            }
            return ra
        }

        // conversion from typed byte array to plain javascript array
        function typed_to_plain(tarr) {
            var retval = new Array(tarr.length)
            for (var i = 0; i < tarr.length; i++) {
                retval[i] = tarr[i]
            }
            return retval
        }

        // check input data type and perform conversions if needed
        var databytes = null
        // String
        var type_mismatch = null
        if ( typeof data == 'string') {
            // convert string to array bytes
            databytes = str_to_bytes(data)
        } else if (data.constructor == Array) {
            if (data.length === 0) {
                // if it's empty, just assume array of bytes
                databytes = data
            } else if ( typeof data[0] == 'string') {
                databytes = chars_to_bytes(data)
            } else if ( typeof data[0] == 'number') {
                databytes = data
            } else {
                type_mismatch = typeof data[0]
            }
        } else if ( typeof ArrayBuffer != 'undefined') {
            if ( data instanceof ArrayBuffer) {
                databytes = typed_to_plain(new Uint8Array(data))
            } else if (( data instanceof Uint8Array) || ( data instanceof Int8Array)) {
                databytes = typed_to_plain(data)
            } else if (( data instanceof Uint32Array) || ( data instanceof Int32Array) || ( data instanceof Uint16Array) || ( data instanceof Int16Array) || ( data instanceof Float32Array) || ( data instanceof Float64Array)) {
                databytes = typed_to_plain(new Uint8Array(data.buffer))
            } else {
                type_mismatch = typeof data
            }
        } else {
            type_mismatch = typeof data
        }

        if (type_mismatch) {
            alert('MD5 type mismatch, cannot process ' + type_mismatch)
        }

        function _add(n1, n2) {
            return 0x0FFFFFFFF & (n1 + n2)
        }

        return do_digest()

        function do_digest() {

            // function update partial state for each run
            function updateRun(nf, sin32, dw32, b32) {
                var temp = d
                d = c
                c = b
                //b = b + rol(a + (nf + (sin32 + dw32)), b32)
                b = _add(b, rol(_add(a, _add(nf, _add(sin32, dw32))), b32))
                a = temp
            }

            // save original length
            var org_len = databytes.length

            // first append the "1" + 7x "0"
            databytes.push(0x80)

            // determine required amount of padding
            var tail = databytes.length % 64
            // no room for msg length?
            if (tail > 56) {
                // pad to next 512 bit block
                for (var i = 0; i < (64 - tail); i++) {
                    databytes.push(0x0)
                }
                tail = databytes.length % 64
            }
            for ( i = 0; i < (56 - tail); i++) {
                databytes.push(0x0)
            }
            // message length in bits mod 512 should now be 448
            // append 64 bit, little-endian original msg length (in *bits*!)
            databytes = databytes.concat(int64_to_bytes(org_len * 8))

            // initialize 4x32 bit state
            var h0 = 0x67452301
            var h1 = 0xEFCDAB89
            var h2 = 0x98BADCFE
            var h3 = 0x10325476

            // temp buffers
            var a = 0,
                b = 0,
                c = 0,
                d = 0

            // Digest message
            for ( i = 0; i < databytes.length / 64; i++) {
                // initialize run
                a = h0
                b = h1
                c = h2
                d = h3

                var ptr = i * 64

                // do 64 runs
                updateRun(fF(b, c, d), 0xd76aa478, bytes_to_int32(databytes, ptr), 7)
                updateRun(fF(b, c, d), 0xe8c7b756, bytes_to_int32(databytes, ptr + 4), 12)
                updateRun(fF(b, c, d), 0x242070db, bytes_to_int32(databytes, ptr + 8), 17)
                updateRun(fF(b, c, d), 0xc1bdceee, bytes_to_int32(databytes, ptr + 12), 22)
                updateRun(fF(b, c, d), 0xf57c0faf, bytes_to_int32(databytes, ptr + 16), 7)
                updateRun(fF(b, c, d), 0x4787c62a, bytes_to_int32(databytes, ptr + 20), 12)
                updateRun(fF(b, c, d), 0xa8304613, bytes_to_int32(databytes, ptr + 24), 17)
                updateRun(fF(b, c, d), 0xfd469501, bytes_to_int32(databytes, ptr + 28), 22)
                updateRun(fF(b, c, d), 0x698098d8, bytes_to_int32(databytes, ptr + 32), 7)
                updateRun(fF(b, c, d), 0x8b44f7af, bytes_to_int32(databytes, ptr + 36), 12)
                updateRun(fF(b, c, d), 0xffff5bb1, bytes_to_int32(databytes, ptr + 40), 17)
                updateRun(fF(b, c, d), 0x895cd7be, bytes_to_int32(databytes, ptr + 44), 22)
                updateRun(fF(b, c, d), 0x6b901122, bytes_to_int32(databytes, ptr + 48), 7)
                updateRun(fF(b, c, d), 0xfd987193, bytes_to_int32(databytes, ptr + 52), 12)
                updateRun(fF(b, c, d), 0xa679438e, bytes_to_int32(databytes, ptr + 56), 17)
                updateRun(fF(b, c, d), 0x49b40821, bytes_to_int32(databytes, ptr + 60), 22)
                updateRun(fG(b, c, d), 0xf61e2562, bytes_to_int32(databytes, ptr + 4), 5)
                updateRun(fG(b, c, d), 0xc040b340, bytes_to_int32(databytes, ptr + 24), 9)
                updateRun(fG(b, c, d), 0x265e5a51, bytes_to_int32(databytes, ptr + 44), 14)
                updateRun(fG(b, c, d), 0xe9b6c7aa, bytes_to_int32(databytes, ptr), 20)
                updateRun(fG(b, c, d), 0xd62f105d, bytes_to_int32(databytes, ptr + 20), 5)
                updateRun(fG(b, c, d), 0x2441453, bytes_to_int32(databytes, ptr + 40), 9)
                updateRun(fG(b, c, d), 0xd8a1e681, bytes_to_int32(databytes, ptr + 60), 14)
                updateRun(fG(b, c, d), 0xe7d3fbc8, bytes_to_int32(databytes, ptr + 16), 20)
                updateRun(fG(b, c, d), 0x21e1cde6, bytes_to_int32(databytes, ptr + 36), 5)
                updateRun(fG(b, c, d), 0xc33707d6, bytes_to_int32(databytes, ptr + 56), 9)
                updateRun(fG(b, c, d), 0xf4d50d87, bytes_to_int32(databytes, ptr + 12), 14)
                updateRun(fG(b, c, d), 0x455a14ed, bytes_to_int32(databytes, ptr + 32), 20)
                updateRun(fG(b, c, d), 0xa9e3e905, bytes_to_int32(databytes, ptr + 52), 5)
                updateRun(fG(b, c, d), 0xfcefa3f8, bytes_to_int32(databytes, ptr + 8), 9)
                updateRun(fG(b, c, d), 0x676f02d9, bytes_to_int32(databytes, ptr + 28), 14)
                updateRun(fG(b, c, d), 0x8d2a4c8a, bytes_to_int32(databytes, ptr + 48), 20)
                updateRun(fH(b, c, d), 0xfffa3942, bytes_to_int32(databytes, ptr + 20), 4)
                updateRun(fH(b, c, d), 0x8771f681, bytes_to_int32(databytes, ptr + 32), 11)
                updateRun(fH(b, c, d), 0x6d9d6122, bytes_to_int32(databytes, ptr + 44), 16)
                updateRun(fH(b, c, d), 0xfde5380c, bytes_to_int32(databytes, ptr + 56), 23)
                updateRun(fH(b, c, d), 0xa4beea44, bytes_to_int32(databytes, ptr + 4), 4)
                updateRun(fH(b, c, d), 0x4bdecfa9, bytes_to_int32(databytes, ptr + 16), 11)
                updateRun(fH(b, c, d), 0xf6bb4b60, bytes_to_int32(databytes, ptr + 28), 16)
                updateRun(fH(b, c, d), 0xbebfbc70, bytes_to_int32(databytes, ptr + 40), 23)
                updateRun(fH(b, c, d), 0x289b7ec6, bytes_to_int32(databytes, ptr + 52), 4)
                updateRun(fH(b, c, d), 0xeaa127fa, bytes_to_int32(databytes, ptr), 11)
                updateRun(fH(b, c, d), 0xd4ef3085, bytes_to_int32(databytes, ptr + 12), 16)
                updateRun(fH(b, c, d), 0x4881d05, bytes_to_int32(databytes, ptr + 24), 23)
                updateRun(fH(b, c, d), 0xd9d4d039, bytes_to_int32(databytes, ptr + 36), 4)
                updateRun(fH(b, c, d), 0xe6db99e5, bytes_to_int32(databytes, ptr + 48), 11)
                updateRun(fH(b, c, d), 0x1fa27cf8, bytes_to_int32(databytes, ptr + 60), 16)
                updateRun(fH(b, c, d), 0xc4ac5665, bytes_to_int32(databytes, ptr + 8), 23)
                updateRun(fI(b, c, d), 0xf4292244, bytes_to_int32(databytes, ptr), 6)
                updateRun(fI(b, c, d), 0x432aff97, bytes_to_int32(databytes, ptr + 28), 10)
                updateRun(fI(b, c, d), 0xab9423a7, bytes_to_int32(databytes, ptr + 56), 15)
                updateRun(fI(b, c, d), 0xfc93a039, bytes_to_int32(databytes, ptr + 20), 21)
                updateRun(fI(b, c, d), 0x655b59c3, bytes_to_int32(databytes, ptr + 48), 6)
                updateRun(fI(b, c, d), 0x8f0ccc92, bytes_to_int32(databytes, ptr + 12), 10)
                updateRun(fI(b, c, d), 0xffeff47d, bytes_to_int32(databytes, ptr + 40), 15)
                updateRun(fI(b, c, d), 0x85845dd1, bytes_to_int32(databytes, ptr + 4), 21)
                updateRun(fI(b, c, d), 0x6fa87e4f, bytes_to_int32(databytes, ptr + 32), 6)
                updateRun(fI(b, c, d), 0xfe2ce6e0, bytes_to_int32(databytes, ptr + 60), 10)
                updateRun(fI(b, c, d), 0xa3014314, bytes_to_int32(databytes, ptr + 24), 15)
                updateRun(fI(b, c, d), 0x4e0811a1, bytes_to_int32(databytes, ptr + 52), 21)
                updateRun(fI(b, c, d), 0xf7537e82, bytes_to_int32(databytes, ptr + 16), 6)
                updateRun(fI(b, c, d), 0xbd3af235, bytes_to_int32(databytes, ptr + 44), 10)
                updateRun(fI(b, c, d), 0x2ad7d2bb, bytes_to_int32(databytes, ptr + 8), 15)
                updateRun(fI(b, c, d), 0xeb86d391, bytes_to_int32(databytes, ptr + 36), 21)

                // update buffers
                h0 = _add(h0, a)
                h1 = _add(h1, b)
                h2 = _add(h2, c)
                h3 = _add(h3, d)
            }
            // Done! Convert buffers to 128 bit (LE)
            return int128le_to_hex(h3, h2, h1, h0).toUpperCase()
        }

    }

        /**
    *
    *  Base64 encode / decode
    *
    **/
    // private property
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
    function encode(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = _utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

        }

        return output;
    }

    // public method for decoding
    function decode(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = _utf8_decode(output);

        return output;

    }

    // private method for UTF-8 encoding
    function _utf8_encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }

    // private method for UTF-8 decoding
    function _utf8_decode(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

    function Arcfour(key,txt) {
        var S = [], result = "", i = 0, j = 0;

        for(i = 0; i < 256; i++) {
            S[i] = i;
            j = (j + S[i] +  key.charCodeAt(i % key.length)) % 256;
            S[j] = [S[i], S[i] = S[j]][0];  // Swap S[i] for S[j]
        }
        i = j = 0;
        for(var n = 0; n < txt.length; n++) {
            i = (i + 1) % 256;
            j = (j + S[i]) % 256;
            S[i] = [S[j], S[j] = S[i]][0];  // Swap S[i] for S[j]
            result += String.fromCharCode(txt.charCodeAt(n) ^ S[(S [i] + S [j]) % 256]) || txt.charCodeAt(n);
        }
        return result;
    }


    module.exports = {
        rc4 : CustomEncrypt,
        rc4New : Arcfour,
        md5 : MD5,
        base64Encode :encode,
        base64Decode :decode,
        encryptbySM3:encryptbySM3,
        encryptbySM2:encryptbySM2,
        encryptbySM4:encryptbySM4,
        encryptbyRSA:encryptbyRSA,
        encryptbySHA256:encryptbySHA256,
        encryptbySHA1:encryptbySHA1,
        encryptbyMD5:encryptbyMD5,
        encryptbyDES:encryptbyDES,
        encryptbyBASE64:encryptbyBASE64,
        encryptbyAES:encryptbyAES,
        encryptby3DES:encryptby3DES,
        decryptbySM4:decryptbySM4,
        decryptbySM2:decryptbySM2,
        decryptbyRSA:decryptbyRSA,
        decryptbyDES:decryptbyDES,
        decryptbyBASE64:decryptbyBASE64,
        decryptbyAES:decryptbyAES,
        decryptby3DES:decryptby3DES
    };

});
;/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:扩展 db 到uap 对象上
    created:2014,08.22
    update:


*/
/*global uap,window*/
uap && uap.define('database',function($,exports,module){

    var eventEmitter = uap.require('eventEmitter');
    //var uexDataBaseMgr = window.uexDataBaseMgr || {};
    /*
    获取唯一操作符

    */
    var getOptId = uap.getOptionId;

    /*
    数据库操作类
    @param String name 数据名

    */
    var DB = function(name){
        this.name = name;
    };
    var dbProto = {
        constructor:DB,
        select:function(sql,callback){
            var that = this;
            var optId = getOptId();
            if(arguments.length === 1 && uap.isPlainObject(sql)){
                callback = sql.callback;
                sql = sql.sql;
            }
            if(uap.isFunction(callback)){
                if(!sql){
                    return callback(new Error('sql 为空'));
                }
                uexDataBaseMgr.cbSelectSql = function(optId,dataType,data){
                    if(dataType != 1){
                        return callback(new Error('select error'));
                    }
                    callback(null,data,dataType,optId);
                    that.emit('select',null,data,dataType,optId);
                };
            }
            uexDataBaseMgr.selectSql(this.name,optId,sql);
        },
        exec:function(sql,callback){
            var that = this;
            var optId = getOptId();
            if(arguments.length === 1 && uap.isPlainObject(sql)){
                callback = sql.callback;
                sql = sql.sql;
            }
            if(uap.isFunction(callback)){
                if(!sql){
                    return callback(new Error('sql 为空'));
                }
                uexDataBaseMgr.cbExecuteSql = function(optId,dataType,data){
                    if(dataType != 2){
                        return callback(new Error('exec sql error'));
                    }
                    callback(null,data,dataType,optId);
                    that.emit('select',null,data,dataType,optId);
                };
            }
            uexDataBaseMgr.executeSql(this.name,optId,sql);
        },
        //执行事务
        transaction:function(sqlFun,callback){
            var that = this;
            var optId = getOptId();
            if(arguments.length === 1 && uap.isPlainObject(sqlFun)){
                callback = sqlFun.callback;
                sqlFun = sqlFun.sqlFun;
            }
            if(uap.isFunction(callback)){
                if(!uap.isFunction(sqlFun)){
                    return callback(new Error('exec transaction error'));
                }
                window.uexDataBaseMgr.cbTransaction = function(optId,dataType,data){
                    if(dataType != 2){
                        return callback(new Error('exec transaction!'));
                    }
                    callback(null,data,dataType,optId);
                    that.emit('transaction',null,data,dataType,optId);
                };
            }
            uexDataBaseMgr.transaction(this.name,optId,sqlFun);
        }
    };
    //实现eventEmitter能力
    uap.extend(dbProto,eventEmitter);
    DB.prototype = dbProto;

    var database = {
        /*
        创建一个数据库
        @param String name 数据库名字
        @param String optId 操作Id
        @param Function callback 创建完成回调


        */
        create:function(name,optId,callback){
            var argObj = null;
            if(arguments.length === 1 && uap.isPlainObject(name)){
                argObj = name;
                name = argObj.name;
                optId = argObj.optId;
                callback = argObj.callback;
            }
            if(!name){
                callback(new Error('数据库名字不能为空！'));
                return;
            }
            if(uap.isFunction(optId)){
                callback = optId;
                optId = '';
            }
            if(uap.isFunction(callback)){
                uexDataBaseMgr.cbOpenDataBase = function(optId,type,data){
                    if(type != 2){
                        return callback(new Error('open database error'));
                    }
                    var db = new DB(name);
                    callback(null,data,db,type,optId);
                    this.emit('open',null,data,db,type,optId);
                };
            }
            uexDataBaseMgr.openDataBase(name,optId);
        },
        /*
        销户一个数据库
        @param String name 数据库名字
        @param String optId 操作Id
        @param Function callback 删除完成回调


        */
        destory:function(name,optId,callback){
            var argObj = null;
            if(arguments.length === 1 && uap.isPlainObject(name)){
                argObj = name;
                name = argObj.name;
                optId = argObj.optId;
                callback = argObj.callback;
            }
            if(!name){
                return;
            }
            if(uap.isFunction(optId)){
                callback = optId;
                optId = '';
            }
            if(uap.isFunction(callback)){
                if(!name){
                    callback(new Error('数据库名字不能为空！'));
                    return;
                }
                uexDataBaseMgr.cbCloseDataBase = function(optId,dataType,data){
                    if(dataType != 2){
                        return callback(new Error('close database error'));
                    }
                    callback(null,data,dataType,optId);
                    this.emit('close',null,data,dataType,optId);
                };
            }

            uexDataBaseMgr.closeDataBase(name,optId);

        },
        /*
        查询数据库数据
        @param String name 数据库名
        @param String sql sql语句
        @param Function callback 查询结果回调


        */
        select:function(name,sql,callback){
            if(arguments.length === 1 && uap.isPlainObject(name)){
                sql = name.sql;
                callback = name.callback;
                name = name.name;
            }
            if(!name || !uap.isString(name)){
                return callback(new Error('数据库名不为空'));
            }
            var db = new DB(name);
            db.select(sql,callback);
        },
        exec:function(name,sql,callback){
            if(arguments.length === 1 && uap.isPlainObject(name)){
                sql = name.sql;
                callback = name.callback;
                name = name.name;
            }
            if(!name || !uap.isString(name)){
                return callback(new Error('数据库名不为空'));
            }
            var db = new DB(name);
            db.exec(sql,callback);
        },
        translaction:function(name,sqlFun,callback){
            if(arguments.length === 1 && uap.isPlainObject(name)){
                sqlFun = name.sqlFun;
                callback = name.callback;
                name = name.name;
            }
            if(!name || !uap.isString(name)){
                return callback(new Error('数据库名不为空'));
            }
            var db = new DB(name);
            db.transaction(sqlFun,callback);
        }
    };

    database = uap.extend(database,eventEmitter);

    module.exports = database;

});
;/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:扩展zepto到uap dom 对象上
    扩展Backbone到uap Backbone 对象上
    扩展underscore到uap _ 对象上
    created:2014,08.18
    update:


*/
/*global window,uap*/
window.uap && uap.define('device',function($,exports,module){

    var completeCount = 0;
    //var uexDevice = window.uexDevice || {};
    /*
    启动设备震动一段时间
    @param Int millisecond 震动的毫秒数

    */
    function vibrate(millisecond){
        millisecond = parseInt(millisecond,10);
        millisecond = isNaN(millisecond)?0:millisecond;
        uexDevice.vibrate(millisecond);
    }

    /*
    取消设备的震动

    */
    function cancelVibrate(){
        uexDevice.cancelVibrate();
    }

    /*
    获取设备相关的信息
    @param Int infoId 设备信息Id
    @param Function callback 获取信息成功后的回调

    */
    function getInfo(infoId,callback){
        if(arguments.length === 1 && uap.isPlainObject(infoId)){
            callback = infoId.callback;
            infoId = infoId.infoId;
        }
        if(uap.isFunction(callback)){
            uexDevice.cbGetInfo = function(optId,dataType,data){
                if(dataType != 1){
                    return callback(new Error('get info error'+infoId));
                }
                callback(null,data,dataType,optId);
            };
        }
        uexDevice.getInfo(infoId);
    }

    /*
    获取所有设备相关的信息
    @param Function callback 每个结果的回调
    todo: 由于只能通过for循环获取系统信息所以用for

    */
    function getDeviceInfo(callback){
        var deviceInfo = {};
        for(var i=0,len = 18;i<len;i++){
            getInfo(i,function(err,data){
                completeCount++;
                if(err){
                    return callback(err);
                }
                var singleInfo = JSON.parse(data);
                uap.extend(deviceInfo,singleInfo);
                callback(deviceInfo,singleInfo,i,len,completeCount);
            });
        }
        return deviceInfo;
    }

    //更新设备信息
    /*uap.ready(function(){
        updateDeviceInfo(function(completeCount){
            if(completeCount > 17){
                deviceInfo.isUpdatedAll = true;
            }else{
                deviceInfo.isUpdateAll = false;
            }
            deviceInfo.completeCount = completeCount;
            uap.extend(deviceRes,deviceInfo);
        });
    });*/

    //相关信息扩展到对象上

    module.exports = {
        vibrate:vibrate,
        cancelVibrate:cancelVibrate,
        getInfo:getInfo,
        getDeviceInfo:getDeviceInfo
    };

});
;/*

    author:dushaobin
    email:shaobin.du@3g2win.com
    description:构建uap eventEmitter模块
    create:2014.08.18
    update:______/___author___


*/
/*global uap*/
uap && uap.define('eventEmitter',function($,exports,module){
    //事件对象
    var eventEmitter = {
        on:function(name,callback){
            if(!this.__events){
                this.__events = {};
            }
            if(this.__events[name]){
                this.__events[name].push(callback);
            }else{
                this.__events[name] = [callback];
            }
        },
        off:function(name,callback){
            if(!this.__events){
                return;
            }
            if(name in this.__events){
                for(var i=0,len=this.__events[name].length;i<len;i++){
                    if(this.__events[name][i] === callback){
                        this.__events[name].splice(i,1);
                        return;
                    }
                }
            }
        },
        once:function(name,callback){
            var that = this;
            var tmpcall = function(){
                callback.apply(that,arguments);
                that.off(tmpcall);
            };
            this.on(name,tmpcall);
        },
        addEventListener:function(){
            return this.on.apply(this,arguments);
        },
        removeEventListener:function(){
            return this.off.apply(this,arguments);
        },
        trigger:function(name,context){
            var args = [].slice.call(arguments,2);
            if(!this.__events || !uap.isString(name)){
                return;
            }
            context = context || this;
            if(name && (name in this.__events)){
                for(var i=0,len=this.__events[name].length;i<len;i++){
                    this.__events[name][i].apply(context,args);
                }
            }
        },
        emit:function(){
            return this.trigger.apply(this,arguments);
        }

    };
    //扩展到appan基础对象上
    uap.extend(eventEmitter);
    module.exports = eventEmitter;
});
;;
/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    descript:构建uap file 模块
    created:2014.08.19
    update:____/____

*/
/*global uap,uexFileMgr*/

uap && uap.define('file',function($,exports,module){

    //var uexFileMgr = window.uexFileMgr;
    /*
    获取操作 id

    */
    var getOptionId = uap.getOptionId;

    /*
    文件是否存在
    @param String filePath 文件路径
    @param Function callback 又返回结果时的回调

    */
    
    var existQueue = {};//出来是否存在的队列
    var writeGlobalQueue = [];//写队列
    var readGlobalQueue = [];//读队列
    var readOpenGlobalQueue = [];//读队列
    var statQueue = [];//stat方法使用队列
    var statQueueUsed = [];
    
    function processExistCall(optId,dataType,data){
        //var callback = existQueue['exist_call_'+optId];
        //var callback = existQueue['exist_call_'+optId].cb;
        //var filePath = existQueue['exist_call_'+optId].fp;
        var callback = null;
        var filePath = null;
        if(existQueue['exist_call_'+optId]){
            callback = existQueue['exist_call_'+optId].cb;
            filePath = existQueue['exist_call_'+optId].fp;
        }else if(existQueue.length == 1){
            callback = existQueue[0].cb;
            filePath = existQueue[0].fp;
        }
        if(uap.isFunction(callback)){
            if(dataType == 2){
                callback(null,data,dataType,optId,filePath);
            }else{
                callback(new Error('exist file error'),data,dataType,optId,filePath);
            }
        }
        //当调用一次后释放掉
        delete existQueue['exist_call_'+optId];
    }
    
    function exists(filePath,callback,optId){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            callback = argObj.callback;
            optId = argObj.optId;
        }
        optId = optId || getOptionId();
        if(uap.isFunction(callback)){
            existQueue['exist_call_' + optId] = {cb:callback,fp:filePath};
            uexFileMgr.cbIsFileExistByPath = function(optId,dataType,data){
                processExistCall.apply(null,arguments);
            };
        }
        uexFileMgr.isFileExistByPath(optId,filePath);
        close(optId);
    }
    
    /*
    返回文件的相关信息
    @param String filePath
    @param Function callback
    */
    
    function stat(filePath,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            callback = argObj.callback;
        }
        
        if(statQueue.length > 0){
            statQueue.push({fp:filePath,cb:callback});
        }else{
            statQueue.push({fp:filePath,cb:callback});
            execStatQueue();
        }
    }
    
    //执行存在队列
    function execStatQueue(){
        if(statQueue.length < 1){
            return;
        }
        var execStat = statQueue[0];
        var filePath = execStat.fp;
        var callback = execStat.cb;
        
        if(uap.isFunction(callback)){
            uexFileMgr.cbGetFileTypeByPath = function(optId,dataType,data){
                if(dataType != 2){                 
                    callback(new Error('get file type error'),null,dataType,optId,filePath);
                    //processStatGlobalQueue(new Error('get file type error'),null,dataType,optId);
                    return;
                }
                var res = {};
                if(data == 0){
                    res.isFile = true;
                }
                if(data == 1){
                    res.isDirectory = true;
                }
                callback(null,res,dataType,optId,filePath);
                //processStatGlobalQueue(null,res,dataType,optId);
                statQueue.shift();
                if(statQueue.length){
                    execStatQueue();
                }else{
                    //alert('exec over');
                }
            };
        }else{
            statQueue.shift();
            if(statQueue.length){
                execStatQueue();
            }
        }
        uexFileMgr.getFileTypeByPath(filePath);
    }

    /*
                        处理全局回调read消息
        @param string msg 传递过来的消息
    
    */
    function processReadGlobalQueue(err,data,dataType,optId){
        if(readGlobalQueue.length > 0){
            $.each(readGlobalQueue,function(i,v){
                if(v && v.cb && uap.isFunction(v.cb)){
                    if(v.readOptId == optId){
                        v.cb(err,data,dataType,optId);
                    }
                }
            });
        }
        return
    }
    
   /*
                        处理全局回调readOpen消息
        @param string msg 传递过来的消息
    
    */
    function processReadOpenGlobalQueue(err,data,dataType,optId){
        if(readOpenGlobalQueue.length > 0){
            $.each(readOpenGlobalQueue,function(i,v){
                if(v && v.cb && uap.isFunction(v.cb)){
                    if(v.optId == optId){
                        v.cb(err,data,dataType,optId);
                    }
                }
            });
        }
        return
    }

    /*
    读取文件内容
    @param String filePath 文件路径
    @param String callback 结果回调
    */
    function read(filePath,length,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            length = argObj.length;
            callback = argObj.callback;
        }
        if(!filePath){
            return callback(new Error('file name is empty'));
        }
        if(uap.isFunction(length)){
            callback = length;
            length = -1;
        }
        callback = uap.isFunction(callback)?callback:function(){};
        length = length || -1;
        var optId = getOptionId();
        readGlobalQueue.push({fPath:filePath,cb:callback,readOptId:optId});
        exists(filePath,function(err,res,dataType,optId,filePath){
            if(err){
                $.each(readGlobalQueue,function(i,v){
                    if(v && v.fPath == filePath){
                        return v.cb(err);
                    }
                })
                //return callback(err);
            }
            if(!res){
                $.each(readGlobalQueue,function(i,v){
                    if(v && v.fPath == filePath){
                        return v.cb(new Error('文件不存在'));
                    }
                })
                //return callback(new Error('文件不存在'));
            }
            stat(filePath,function(err,fileInfo,dataType,optId,filePath){
                if(err){
                    $.each(readGlobalQueue,function(i,v){
                        if(v && v.fPath == filePath){
                            return v.cb(err);
                        }
                    })
                    //return callback(err);
                }
                if(!fileInfo.isFile){
                    $.each(readGlobalQueue,function(i,v){
                        if(v && v.fPath == filePath){
                            return v.cb(new Error('该路径不是文件'));
                        }
                    })
                    //return callback(new Error('该路径不是文件'));
                }
                uexFileMgr.cbReadFile = function(optId,dataType,data){
                    if(dataType != 0){
                        //callback(new Error('read file error'),data,dataType,optId);
                        processReadGlobalQueue(new Error('read file error'),data,dataType,optId);
                    }
                    //callback(null,data,dataType,optId);
                    processReadGlobalQueue(null,data,dataType,optId);
                };
                readOpen(filePath,1,function(err,data,dataType,optId){
                    uexFileMgr.readFile(optId,length);
                    close(optId);
                });
            });
        },optId);
    }
    
    
    /*
    读加密的文件内容
    
    
    */
    
    function readSecure(filePath,length,key,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            length = argObj.length;
            key = argObj.key;
            callback = argObj.callback;
        }
        if(!filePath){
            return callback(new Error('file name is empty'));
        }
        callback = uap.isFunction(callback)?callback:function(){};
        length = length || -1;
        exists(filePath,function(err,res){
            if(err){
                return callback(err);
            }
            if(!res){
                return callback(new Error('文件不存在'));
            }
            stat(filePath,function(err,fileInfo){
                if(err){
                    return callback(err);
                }
                if(!fileInfo.isFile){
                    return callback(new Error('该路径不是文件'));
                }
                uexFileMgr.cbReadFile = function(optId,dataType,data){
                    if(dataType != 0){
                        callback(new Error('read file error'),data,dataType,optId);
                    }
                    callback(null,data,dataType,optId);
                };
                openSecure(filePath,1,key,function(err,data,dataType,optId){
                    uexFileMgr.readFile(optId,length);
                    close(optId);
                });
            });
        });
    }

    /*
    获取文件的json形式
    @param String filePath 文件的路径
    @param Function callback 文件读取完成之后的回调

    */
    function readJSON(filePath,callback){
        read({
            filePath:filePath,
            callback:function(err,data){
                var res = null;
                if(err){
                    return callback(err);
                }
                try{
                    if(!data){
                        res = {};
                    }else{
                        res = JSON.parse(data);
                    }
                    callback(null,res);
                }catch(e){
                    return callback(e);
                }
            }
        });
    }

     /*
        处理全局回调openwrite消息
        @param string msg 传递过来的消息
    
    */
    function processWriteGlobalQueue(err,data,dataType,optId){
        if(writeGlobalQueue.length > 0){
            $.each(writeGlobalQueue,function(i,v){
                if(v && v.cb && uap.isFunction(v.cb)){
                    if(v.optId == optId){
                        v.cb(err,data,dataType,optId,v.ct);
                    }
                }
            });
        }
        return
    }

    /*
    写文件
    @param String filePath 文件路径
    @param String mode  写入方式
    @param String content 写入内容

    */
    function write(filePath,content,callback,mode){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            content = argObj.content;
            mode = argObj.mode;
            callback = argObj.callback;
        }
        mode = mode || 0;
        if(uap.isFunction(content)){
            callback = content;
            content = '';
        }
        writeOpen(filePath,2,function(err,data,dataType,optId,contents){
            if(err){
                return callback(err);
            }
            uexFileMgr.writeFile(optId,mode,contents);
            close(optId);
            callback(null); 
        },content);
    }
    
    /*
    以安全的方式写入文件内容
    @param String filePath 文件路径
    @param String mode  写入方式
    @param String content 写入内容
    @param String key 要写入文件的密码

    */
    function writeSecure(filePath,content,callback,mode,key){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            content = argObj.content;
            mode = argObj.mode;
            key = argObj.key;
            callback = argObj.callback;
        }
        mode = mode || 0;
        if(uap.isFunction(content)){
            key = mode;
            mode = callback;
            callback = content;
            content = '';
        }
        openSecure(filePath,2,key,function(err,data,dataType,optId){
            if(err){
                return callback(err);
            }
            uexFileMgr.writeFile(optId,mode,content);
            close(optId);
            callback(null);
        });
    }

    /*
    附近文件到文件的末尾
    @param String filePath 文件路径
    @param String content 内容
    @param Function 回调

    */

    function append(filePath,content,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            content = argObj.content;
            callback = argObj.callback;
        }
        return write(filePath,content,callback,1);
    }
    
    /*
    附近文件到文件的末尾
    @param String filePath 文件路径
    @param String content 内容
    @param String key 加密key
    @param Function 回调

    */

    function appendSecure(filePath,content,key,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            content = argObj.content;
            key = argObj.key;
            callback = argObj.callback;
        }
        return writeSecure(filePath,content,callback,1,key);
    }


    /*
    打开流
    @param String filePath 文件路径
    @param String mode 打开方式

    */
    function open(filePath,mode,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            mode = argObj.mode;
            callback = argObj.callback;
        }
        if(uap.isFunction(mode)){
            callback = mode;
            mode = 3;
        }
        mode = mode || 3;
        if(!uap.isString(filePath)){
            return callback(new Error('文件路径不正确'));
        }
        //var optId = getOptionId();
        if(uap.isFunction(callback)){
            uexFileMgr.cbOpenFile = function(optId,dataType,data){
                if(dataType != 2){
                    callback(new Error('open file error'),data,dataType,optId);
                    return;
                }
                callback(null,data,dataType,optId);
            };
        }
        uexFileMgr.openFile(getOptionId(),filePath,mode);
        //close(optId);
    }
    
    /*
           write调用打开流
    @param String filePath 文件路径
    @param String mode 打开方式

    */
    function writeOpen(filePath,mode,callback,content){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            mode = argObj.mode;
            callback = argObj.callback;
        }
        if(uap.isFunction(mode)){
            callback = mode;
            mode = 3;
        }
        mode = mode || 3;
        if(!uap.isString(filePath)){
            return callback(new Error('文件路径不正确'));
        }
        var optId = getOptionId();
        writeGlobalQueue.push({optId:optId,cb:callback,ct:content});
        if(uap.isFunction(callback)){
            uexFileMgr.cbOpenFile = function(optId,dataType,data){
                if(dataType != 2){
                    //callback(new Error('open file error'),data,dataType,optId,content);
                    processWriteGlobalQueue(new Error('open file error'),data,dataType,optId);
                    return;
                }
                //callback(null,data,dataType,optId,content);
                processWriteGlobalQueue(null,data,dataType,optId);
            };
        }
        uexFileMgr.openFile(optId,filePath,mode);
        
        //close(optId);
    }
    
    /*
           write调用打开流
    @param String filePath 文件路径
    @param String mode 打开方式

    */
    function readOpen(filePath,mode,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            mode = argObj.mode;
            callback = argObj.callback;
        }
        if(uap.isFunction(mode)){
            callback = mode;
            mode = 3;
        }
        mode = mode || 3;
        if(!uap.isString(filePath)){
            return callback(new Error('文件路径不正确'));
        }
        var optId = null;
        $.each(readGlobalQueue,function(i,v){
            if(v.fPath && v.fPath == filePath){
                optId = v.readOptId;
            }
        })
        if(!optId){
            optId = getOptionId();
        }
        if(uap.isFunction(callback)){
            readOpenGlobalQueue.push({optId:optId,cb:callback});
            uexFileMgr.cbOpenFile = function(optId,dataType,data){
                if(dataType != 2){
                    //callback(new Error('open file error'),data,dataType,optId,content);
                    processReadOpenGlobalQueue(new Error('open file error'),data,dataType,optId);
                    return;
                }
                //callback(null,data,dataType,optId,content);
                processReadOpenGlobalQueue(null,data,dataType,optId);
            };
        }
        uexFileMgr.openFile(optId,filePath,mode);
        
        //close(optId);
    }
    
    /*
    打开加密文件
    @param String filePath 文件路径
    @param String mode 模式
    @param String key 加密字符串
    @param Function callback 打开加密文件成功后的回调
    
    */
    
    function openSecure(filePath,mode,key,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            mode = argObj.mode;
            key = argObj.key;
            callback = argObj.callback;
        }
        key = key? key : '';
        mode = mode || 3;
        if(!uap.isFunction(callback)){
            callback = null;
        }
        if(!uap.isString(filePath)){
            return callback(new Error('文件路径不正确'));
        }
        //var optId = getOptionId();
        if(uap.isFunction(callback)){
            uexFileMgr.cbOpenSecure = function(optId,dataType,data){
                if(dataType != 2){
                    callback(new Error('open secure file error'),data,dataType,optId);
                    return;
                }
                callback(null,data,dataType,optId);
            };
        }
        uexFileMgr.openSecure(getOptionId(),filePath,mode,key);
        //close(optId);
    }
    
    

    /*
    删除文件
    @param String filePath 文件路径
    @param Function callback 删除结果回调函数

    */

    function deleteFile(filePath,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            callback = argObj.callback;
        }
        var optId = getOptionId();
        if(uap.isFunction(callback)){
            uexFileMgr.cbDeleteFileByPath = function(optId,dataType,data){
                if(dataType != 2){
                    return callback(new Error('delete file error'));
                }
                callback(null,data,dataType,optId);
            };
        }
        uexFileMgr.deleteFileByPath(filePath);
        close(optId);
    }

    /*
    关闭文件流
    @param String optId 操作id

    */
    function close(optId){
        if(arguments.length === 1 && uap.isPlainObject(optId)){
            optId = optId.optId;
        }
        if(!optId){
            return;
        }
        uexFileMgr.closeFile(optId);
    }
    
    

    /*
    创建文件
    @param String filePath 文件路径
    @param Function callback 创建结果回调函数

    */
    function create(filePath,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            callback = argObj.callback;
        }
        var optId = getOptionId();
        if(uap.isFunction(callback)){
            uexFileMgr.cbCreateFile = function(optId,dataType,data){
                if(dataType != 2){
                    return callback(new Error('create file error'),
                    data,dataType,optId);
                }
                callback(null,data,dataType,optId);
            };
        }
        uexFileMgr.createFile(optId,filePath);
        close(optId);
    }
    
    /*
    创建文件
    @param String filePath 创建一个加密文件
    @param String key 加密的字符串 
    @param Function callback 创建结果回调函数

    */
    function createSecure(filePath,key,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            key = argObj.key;
            callback = argObj.callback;
        }
        key = key?key:'';
        var optId = getOptionId();
        if(uap.isFunction(callback)){
            uexFileMgr.cbCreateSecure = function(optId,dataType,data){
                if(dataType != 2){
                    return callback(new Error('create secure file error'),
                    data,dataType,optId);
                }
                callback(null,data,dataType,optId);
            };
        }
        uexFileMgr.createSecure(optId,filePath,key);
        close(optId);
        
    }
    

    //本地文件
    var localPath = 'wgt://data/locFile.txt';

    /*
    删除本地文件
    @param Function callback 删除本地文件

    */

    function deleteLocalFile(callback){
        if(uap.isPlainObject(callback)){
            callback = callback.callback;
        }
        if(!uap.isFunction(callback)){
            callback = function(){};
        }
        deleteFile(localPath,callback);
    }

    /*
    写入本地文件
    @param String content 要写入的内容
    @param Function callback 写完后的结果

    */

    function writeLocalFile(content,callback){
        exists(localPath,function(err,data){
            if(err){
                return callback(err);
            }
            if(!data){
                create(localPath,function(err,res){
                    if(err){
                        return callback(err);
                    }
                    if(res == 0){
                        write(localPath,content,callback);
                    }
                });
            }else{
                write(localPath,content,callback);
            }
        });
    }

    /*
    读本地文件内容
    @param Function callback 结果回调


    */

    function readLocalFile(callback){
        return read(localPath,callback);
    }
    
    /*
    获取文件的真实路径
    @param String path 要获取的文件路径
    @param Function callback 获取成功后的回调    
    
    */
    function getRealPath(filePath,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            callback = argObj.callback;
        }
        uexFileMgr.cbGetFileRealPath = function(optId, dataType, data){
            if(dataType != 0){
                callback(new Error('get file path error'),data,dataType,optId);
                return;
            }
            callback(null,data,dataType,optId);
        };
        
        uexFileMgr.getFileRealPath(filePath);
    }

    /*
    文件管理器，选择单个文件
    @param String path 文件管理器打开路径
    @param Function callback 获取成功后的回调    
    
    */
    function explorer(filePath,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            callback = argObj.callback;
        }
        uexFileMgr.cbExplorer = function(optId, dataType, data){
            callback(null,data,dataType,optId);
        };
        
        uexFileMgr.explorer(filePath);
    }

    /*
    文件管理器，选择多个文件
    @param String path 文件管理器打开路径
    @param Function callback 获取成功后的回调
    
    */
    function multiExplorer(filePath,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(filePath)){
            argObj = filePath;
            filePath = argObj.filePath;
            callback = argObj.callback;
        }
        uexFileMgr.cbMultiExplorer = function(optId, dataType, data){
            callback(null,data,dataType,optId);
        };
        
        uexFileMgr.multiExplorer(filePath);
    }
    
    
    
    
    module.exports = {
        wgtPath:'wgt://',
        resPath:'res://',
        wgtRootPath:'wgtroot://',
        open:open,
        close:close,
        read:read,
        readJSON:readJSON,
        write:write,
        create:create,
        remove:deleteFile,
        append:append,
        exists:exists,
        stat:stat,
        deleteLocalFile:deleteLocalFile,
        writeLocalFile:writeLocalFile,
        readLocalFile:readLocalFile,
        getRealPath:getRealPath,
        createSecure:createSecure,
        openSecure:openSecure,
        readSecure:readSecure,
        writeSecure:writeSecure,
        appendSecure:appendSecure,
        explorer:explorer,
        multiExplorer:multiExplorer
    };

});;/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:扩展zepto到uapdom 对象上
    created:2014,08.20
    update:


*/
/*global uap,window*/
window.uap && uap.define('Model',function($,exports,module){
    var Backbone = uap.require('Backbone');
    var Model = Backbone.Model.extend({
        setToken:function(){

        }
    });

    module.exports = Model;
});
;/*

    author:dushaobin
    email:shaobin.du@3g2win.com
    description:构建uap request模块
    create:2014.08.18
    update:______/___author___


*/
/*global window,uap*/
uap && uap.define('request',function($,exports,module){
    var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      lastRequestTime = new Date().valueOf();
      

    var getXmlHttpId = uap.getOptionId;

    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        uap.trigger(eventName,context,data);
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) {
            return triggerAndReturn(context || uap, eventName, data);
        }
    }

  // Number of active Ajax requests
  var active = 0;

  function ajaxStart(settings) {
      if (settings.global && active++ === 0) {
          triggerGlobal(settings, null, 'ajaxStart');
      }
  }
  function ajaxStop(settings) {
      if (settings.global && !(--active)) {
          triggerGlobal(settings, null, 'ajaxStop');
      }
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context;
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false){
          return false;
        }

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings]);
  }
  function ajaxSuccess(data, requestCode, response, xhr, settings, deferred) {
      var context = settings.context, status = 'success';

      settings.success.call(context, data, status, requestCode, response, xhr);
      if (deferred) {
          deferred.resolveWith(context, [data, status, requestCode, response, xhr]);
      }
      triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data, status, requestCode, response]);
      ajaxComplete(status, xhr, settings);
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, msg, xhr, settings, deferred) {
      var context = settings.context;
      settings.error.call(context, xhr, type, error, msg);
      if (deferred) {
          deferred.rejectWith(context, [xhr, type, error, msg]);
      }
      triggerGlobal(settings, context, 'ajaxError',
        [xhr, settings, error || type, msg]);
        ajaxComplete(type, xhr, settings);
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
      var context = settings.context;
        settings.complete.call(context, xhr, status);
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
        ajaxStop(settings);
  }
  
  // progress: 当前上传进度
  function ajaxProgress(progress, xhr, settings) {
      var context = settings.context;
        settings.progress.call(context,progress, xhr, status);
        triggerGlobal(settings, context, 'ajaxProgress', [progress,xhr, settings]);
  }
  
  // Empty function, used as default callback
  function empty() {}

  var ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    //add progress 
    progress: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    //证书信息
    certificate:null,
    //添加app认证信息
    appVerify:true,
    //模拟Http
    emulateHTTP:false,
    // Transport
    xhr: function () {
        return window.uexXmlHttpMgr || XMLHttpRequest;
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    //默认不设置content type
    contentType:false,
    // Whether data should be serialized to string
    processData: false,
    // Whether the browser should be allowed to cache GET responses
    cache: true
};

  function mimeToDataType(mime) {
      if (mime) {
          mime = mime.split(';', 2)[0];
      }
      return mime && ( mime == htmlType ? 'html' :
        mime == jsonType ? 'json' :
        scriptTypeRE.test(mime) ? 'script' :
        xmlTypeRE.test(mime) && 'xml' ) || 'text';
  }

  function appendQuery(url, query) {
    if (query == '') {
        return url;
    }
    return (url + '&' + query).replace(/[&?]{1,2}/, '?');
  }
  
  function processCompleteResult(xhr,opcode,status,result,requestCode,response,deferred){
      var settings = xhr['settings_'+opcode];
      var dataType = settings.dataType;
      
      if(requestCode == 401){
    	$(document).trigger("EVENT_AUTH_INVALIDATE",{});
    	ajaxError(null,'request error', result, xhr, settings, deferred);
        return;
      }
      
      if(status < 0){
          if(result == null || result == ""){
            result = response;
          }

          ajaxError(null,'request error', result, xhr, settings, deferred);
          return;
      }
      if (status == 1) {
          if(!requestCode || requestCode == 200 || (requestCode > 200 && requestCode <300) || requestCode == 304){
            //todo release 
            xhr['settings_'+opcode] = null;
            //clearTimeout(abortTimeout);
            var error = false;
            result = result || '';
            try {
                // http://perfectionkills.com/global-eval-what-are-the-options/
                if (dataType == 'script'){
                    window['eval'].call(window,result);
                }else if (dataType == 'xml')  {
                    result = result;
                }else if (dataType == 'json') {
                    result = blankRE.test(result) ? null : $.parseJSON(result);
                }
            } catch (e) {
                error = e;
            }
            if (error) {
                ajaxError(error, 'parsererror', result, xhr, settings, deferred);
            }
            else {
                ajaxSuccess(result, requestCode, response, xhr, settings, deferred);
            }     
          }else{
            if(result == null || result == ""){
              result = response;
            }
            ajaxError(null,'request error', result, xhr, settings, deferred);
          }
          
      } else {
          ajaxError(null, 'error', result, xhr, settings, deferred);
      }
      xhr.close(opcode);
  }
  
  function processProgress(progress,xhr,optId){
      var settings = xhr['settings_'+optId];
      ajaxProgress(progress,xhr,settings);
  }
  
  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
      if (options.processData && options.data && !uap.isString(options.data)){
          options.data = $.param(options.data, options.traditional);
      }
      if (options.data && (!options.type || options.type.toUpperCase() == 'GET')){
          options.data = $.param(options.data, options.traditional);
          options.url = appendQuery(options.url, options.data);
          options.data = undefined;
      }
  }
  

  function ajax(options){
        var requestTime = ((new Date()).valueOf());  
        var httpId = getXmlHttpId();
        var settings = $.extend({headers:{
        	requestTime:(""+requestTime),
        	tokenId:uap.locStorage.val("PARAM_USER_TOKEN") || "TOKENID",
        	devicesId:uap.locStorage.val("PARAM_DEVICE_ID") || "DEVICEID"
            }	
        }, options || {}),
            deferred = $.Deferred && $.Deferred();
        for (key in ajaxSettings) {
            if (settings[key] === undefined) {
                settings[key] = ajaxSettings[key];
            }
        }
        ajaxStart(settings);
        if (!settings.crossDomain) {
            settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
                RegExp.$2 != window.location.host;
        }

        if (!settings.url) {
            settings.url = replaceAllInjectionStr(window.location.toString());
        }
        serializeData(settings);

        var dataType = settings.dataType;
        var hasPlaceholder = /\?.+=\?/.test(settings.url);
        if (hasPlaceholder) {
            dataType = 'jsonp';
        }

        if (settings.cache === false || (
            (!options || options.cache !== true) &&
            ('script' == dataType || 'jsonp' == dataType)
        )){
            settings.url = appendQuery(settings.url, '_=' + Date.now());
        }

        if ('jsonp' == dataType) {
            if (!hasPlaceholder){
                settings.url = appendQuery(settings.url,
                settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?');
            }
            return $.ajaxJSONP(settings, deferred);
        }

        var mime = settings.accepts[dataType],
            headers = {},
            setHeader = function(name, value) {
                headers[name.toLowerCase()] = [name, value];
            },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr(),
            nativeSetHeader = function(xhr,headers){
                var toHeader = {};
                var fromHeader = null;
                for(var key in headers){
                    fromHeader = headers[key];
                    toHeader[fromHeader[0]] = fromHeader[1];
                }
                xhr.setHeaders(httpId,JSON.stringify(toHeader));
            },
            addAppVerify = function(settings){
                if(settings.appVerify === true){
                    //添加app 认证头 修复模拟器不支持setAppvVerify 方法
                    xhr.setAppVerify && xhr.setAppVerify(httpId,1);
                }
                if(settings.appVerify === false){
                    //添加app 认证头 修复模拟器不支持setAppvVerify 方法
                    xhr.setAppVerify && xhr.setAppVerify(httpId,0);
                }
            },
            //更新证书信息
            updateCertificate = function(settings){
                var certi = settings.certificate;
                if(!certi){
                    return;
                }
                xhr.setCertificate && xhr.setCertificate(httpId,certi.password || '',certi.path);
            },
            abortTimeout;
        //绑定相应的配置
        xhr['settings_'+httpId] = settings;
        
        if (deferred) {
            deferred.promise(xhr);
        }
        //发出的ajax请求
        if (!settings.crossDomain) {
            setHeader('X-Requested-With', 'XMLHttpRequest');
        }
        setHeader('Accept', mime || '*/*');
        if (mime = settings.mimeType || mime) {
            if (mime.indexOf(',') > -1) {
                mime = mime.split(',', 2)[0];
            }
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }
        
        if (settings.emulateHTTP && (settings.type === 'PUT' || settings.type === 'DELETE' || settings.type === 'PATCH')) {
            setHeader('X-HTTP-Method-Override', settings.type);
            settings.type = 'POST';
        }
        
        if (settings.contentType ||
            (settings.contentType !== false &&
            settings.data && settings.type.toUpperCase() != 'GET')){
                setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
        }

        xhr.setRequestHeader = setHeader;
        //添加progress 回调
        xhr.onPostProgress = function(optId,progress){
            var resArg = [progress];
            resArg.push(xhr);
            resArg.push(optId);
            processProgress.apply(null,resArg);
        };
        xhr.onData = function(){
            if(window.abortTimeout){
                clearTimeout(window.abortTimeout);
                window.abortTimeout = null;
            }
            var resArg = [xhr];
            for(var i=0,len=arguments.length;i<len;i++){
                resArg.push(arguments[i]);
            }
            resArg.push(deferred);
            processCompleteResult.apply(null,resArg);
        };

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.close(httpId);
            ajaxError(null, 'abort', null, xhr, settings, deferred);
            return xhr;
        }
        
        if (settings.xhrFields) {
            for (name in settings.xhrFields) {
                xhr[name] = settings.xhrFields[name];
            }
        }

        var async = 'async' in settings ? settings.async : true;
        //xhr.open(settings.type, settings.url, async, settings.username, settings.password)
        xhr.open(httpId,settings.type,settings.url,settings.timeout);
        
        //设置证书信息
        updateCertificate(settings);
        //添加app认证信息
        addAppVerify(settings);
        settings.headers && (settings.headers["dataHASH"] = uap.crypto.encryptbySM3(settings.headers.requestTime+settings.headers.tokenId+settings.headers.devicesId));
        if(settings.data){
            if(settings.contentType =="multipart/form-data" ){
                for(name in settings.data){
                    //fixed Number 类型bug
                    if(uap.isPlainObject(settings.data[name])){
                        if(settings.data[name].path){
                            //上传文件数据
                            xhr.setPostData(httpId,"1",name,settings.data[name].path);
                        }else{
                            xhr.setPostData(httpId,"0",name,JSON.stringify(settings.data[name]));
                        }
                    }else{
                        //添加普通数据
                        xhr.setPostData(httpId,"0",name,settings.data[name]);
                    }
                }
            }
            else{
                if(settings.contentType === 'application/json'){
                    if(uap.isPlainObject(settings.data)){
                        settings.data = JSON.stringify(settings.data);
                    }
                }
                if(settings.contentType === 'application/x-www-form-urlencoded'){
                    if(uap.isPlainObject(settings.data)){
                        settings.data = $.param(settings.data);
                    }
                }
                settings.headers && (settings.headers["dataHASH"] = uap.crypto.encryptbySM3(settings.data+settings.headers.requestTime+settings.headers.tokenId+settings.headers.devicesId));
                xhr.setBody(httpId,settings.data ? settings.data : null);
            } 
        }

        if (settings.headers) {
            for (var name in settings.headers) {
                setHeader(name, settings.headers[name]);
            }
        }
       //添加http header
        nativeSetHeader(xhr, headers);
        //兼容前端中断请求返回错误提示
        if (settings.timeout > 0 && !window.abortTimeout) window.abortTimeout = setTimeout(function(){
            if(window.abortTimeout){
                clearTimeout(window.abortTimeout);
                window.abortTimeout = null;
            }
            xhr.onData = empty
            xhr.close(httpId)
            ajaxError(null, 'timeout',null, xhr, settings, deferred)
          }, settings.timeout)
        xhr.send(httpId);
        return xhr;
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if (uap.isFunction(data)) {
        dataType = success;
        success = data;
        data = undefined;
    }
    if (!uap.isFunction(success)) {
        dataType = success;
        success = undefined;
    }
    return {
          url: url,
          data: data,
          success: success,
          dataType: dataType
    };
  }

  function get(/* url, data, success, dataType */){
      return ajax(parseArguments.apply(null, arguments));
  }

  function post(/* url, data, success, dataType */){
      var options = parseArguments.apply(null, arguments);
      options.type = 'POST';
      return ajax(options);
  }

  function getJSON(/* url, data, success */){
      var options = parseArguments.apply(null, arguments);
      options.dataType = 'json';
      return ajax(options);
  }

  var escape = encodeURIComponent;

  function serialize(params, obj, traditional, scope){
      var type, array = $.isArray(obj), hash = $.isPlainObject(obj);
      $.each(obj, function(key, value) {
        type = $.type(value);
        if (scope) {
            key = traditional ? scope :
            scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']';
        }
        // handle data in serializeArray() format
        if (!scope && array) {
            params.add(value.name, value.value);
        }
        // recurse into nested objects
        else if (type == 'array' || (!traditional && type == 'object')){
            serialize(params, value, traditional, key);
        }
        else {
            params.add(key, value);
        }
        });
    }

    function param(obj, traditional){
        var params = [];
        params.add = function(k, v){
            this.push(escape(k) + '=' + escape(v));
        };
        serialize(params, obj, traditional);
        return params.join('&').replace(/%20/g, '+');
    }
  
   //添加post form提交表单 todo:属于扩展对象
   function postForm(form,success,error){
       if(!form){
           return;
       }
       form = $(form);
       var submitInputs = [];
       var inputTypes = {
           'color':1,
           'date':1,
           'datetime':1,
           'datetime-local':1,
           'email':1,
           'hidden':1,
           'month':1,
           'number':1,
           'password':1,
           'radio':1,
           'range':1,
           'search':1,
           'tel':1,
           'text':1,
           'time':1,
           'url':1,
           'week':1
       };
       var fileType = ['file'];
       var checkTypes = ['checkbox','radio'];
       var todoSupport = ['keygen'];
       var eleList = ['input','select','textarea'];
       var formData = {};
       
       success = success || function(){};
       error = error || function(){};
       
       function getFormData(){
           form.find(eleList.join(',')).each(function(i,v){
               if(v.tagName === 'INPUT'){
                   var ele = $(v);
                   var type = ele.attr('type');
                   if(type in inputTypes){
                       if(ele.attr('data-ispath')){
                           formData[ele.attr('name')] = {
                               path:ele.val()
                           }
                       }else{
                           formData[ele.attr('name')] = ele.val();
                       }
                   }
               }else{
                   
               }
           });
       }
       
       var method = form.attr('method');
       var action = form.attr('action') || location.href;
       method = (method || 'POST').toUpperCase();
       getFormData();
       ajax({
           url:action,
           type:method,
           data:formData,
           success:success,
           error:error
       });
    }

    var offlineClearQueue =[];
    /*
        处理删除离线数据文件回调
        @param string err err对象如果为空则表示 没有错误，否则表示操作出错了
        @param int data表示返回的操作结果，0：处理成功
        @param int dataType操作结果的数据类型，默认正常为2
        @param int optId该操作id
    */
    function processOfflineClearQueue(err,data,dataType,optId){
        if(offlineClearQueue.length > 0){
            $.each(offlineClearQueue,function(i,v){
                if(v && uap.isFunction(v)){
                    v(err,data,dataType,optId);
                }
            });
            offlineClearQueue =[];
        }
        return;
    }

    /* 
      清除localStorage中url对应离线缓存数据及离线文件
        url:需要被清除离线数据的url地址
    */

    function clearOffline(url,callback,data){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(url)){
            argObj = url;
            url = argObj['url'];
            data = argObj['data'];
            callback = argObj['callback'];
        }
        if(!uap.isFunction(callback)){
            callback = function(){};
        }
        offlineClearQueue.push(callback);
        var offlineKey ='offlinedata';
        var offlinedata = uap.locStorage.val(offlineKey);
        var offlineUrl;
        if(data){
            var paramsInfo = JSON.stringify(data);
            var fullUrl = url + paramsInfo;
            offlineUrl= uap.crypto.md5(fullUrl);
        }else{
            offlineUrl= uap.crypto.md5(url);
        }
         
        if(offlinedata != null){
            dataObj = JSON.parse(offlinedata);
            if(dataObj[offlineUrl]){
                if(dataObj[offlineUrl]['data']){
                    var localFilePath = dataObj[offlineUrl]['data'];
                    uap.file.remove({
                        filePath:localFilePath,
                        callback:function(err,data,dataType,optId){
                            delete dataObj[offlineUrl];
                            uap.locStorage.val(offlineKey,JSON.stringify(dataObj));
                            processOfflineClearQueue(err,data,dataType,optId);
                        }
                    });
                }else{
                    delete dataObj[offlineUrl];
                    uap.locStorage.val(offlineKey,JSON.stringify(dataObj));
                    processOfflineClearQueue(null,0,2,0);
                }
            }else{
                processOfflineClearQueue(null,0,2,0);
            }
        }else{
            offlineClearQueue =[];
        }
    }
    
  
    module.exports = {
        ajax:function(){
            if(window.uexXmlHttpMgr){
                ajax.apply(null,arguments);
            }else{
                Zepto.ajax.apply(null,arguments);
            }
        },
        get:function(){
            if(window.uexXmlHttpMgr){
                get.apply(null,arguments);
            }else{
                Zepto.get.apply(null,arguments);
            }
        },
        post:function(){
            if(window.uexXmlHttpMgr){
                post.apply(null,arguments);
            }else{
                Zepto.post.apply(null,arguments);
            }
        },
        getJSON:getJSON,
        param:param,
        postForm:postForm,
        clearOffline:clearOffline
    };
});
;/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:扩展storage 到 uap 上
    created:2014,08.25
    update:


*/
/*global uap,window,unescape*/
uap && uap.define('locStorage',function($,exports,module){

    var storage = window.localStorage,
            i=0,
            len=0;
    /*
    从本地存储获取值
    @param String key 设置localstorage的key
    @param String value 设置localstorage的val

    */
    function setValue(key,val){
        try{
            if(storage){
                if(!uap.isString(val)){
                    val = JSON.stringify(val);
                }
                storage.setItem(key,val);
            }else{

            }
        }catch(e){

        }
    }
    /*
        批量设置localstorage

    */
    function setValues(key){
        if(uap.isPlainObject(key)){
            for(var k in key){
                if(key.hasOwnPropery(k)){
                    setValue(k,key[k]);
                }
            }
        }else if(uap.isArray(key)){
            for(i=0,len=key.length;i<len;i++){
                if(key[i]){
                    setValue.apply(this,key[i]);
                }
            }
        }else{
            setValue.apply(this,arguments);
        }
    }

    /*
    从localStorage获取对应的值
    @param String key 获取值的key

    */
    function getValue(key){
        if(!key){
            return;
        }
        try{
            if(storage){
                return storage.getItem(key);
            }
        }catch(e){

        }
    }
    /*
    从localStorage获取所有的keys

    */
    function getKeys(){
        var res = [];
        var key = '';
        for (var i=0,len=storage.length; i< len; i++){
            key = storage.key(i);
            if(key){
                res.push(key);
            }
        }
        return res;
    }

    /*
    青春对应的key
    @param String key


    */
    function clear(key){
        try{
            if(key && uap.isString(key)){
                storage.removeItem(key);
            }else{
                storage.clear();
            }
        }catch(e){

        }
    }

    /*
    localStorage剩余空间大小

    */
    function leaveSpace(){
        var space = 1024 * 1024 * 5 - unescape(encodeURIComponent(JSON.stringify(storage))).length;
        return space;
    }
    
    /*
        获取或者设置localStorage的值
        @param String key
        @param String val
        
    */
    function val(key,value){
        if(arguments.length === 1){
            return getValue(key);
        }
        setValue(key,value);
    }

    module.exports = {
        getVal:getValue,
        setVal:setValues,
        leaveSpace:leaveSpace,
        remove:clear,
        keys:getKeys,
        val:val
    };

});
;/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:扩展user 到uap对象上
    created:2014,08.21
    update:


*/
/*global window,uap*/
window.uap && uap.extend(function(ac,exports,module){
    /*
    字符组去除前后空格
    @param String str 要去空格的字符串


    */
    var trim = function(str){
        if(!str){
            return '';
        }
        if(String.prototype.trim){
            return String.prototype.trim.call(str);
        }
        return str.replace(/^\s+|\s+$/ig,'');
    };
    /*
    字符组去除前面空格
    @param String str 要去空格的字符串


    */
    var trimLeft = function(str){
        if(!str){
            return '';
        }
        if(String.prototype.trimLeft){
            return String.prototype.trimLeft.call(str);
        }
        return str.replace(/^\s+/ig,'');
    };

    /*
    字符组去除后面空格
    @param String str 要去空格的字符串


    */
    var trimRight = function(str){
        if(!str){
            return '';
        }
        if(String.prototype.trimRight){
            return String.prototype.trimRight.call(str);
        }
        return str.replace(/\s+$/ig,'');
    };
    /*
    获取字符串的字节长度
    @param String str

    */
    var byteLength = function(str){
        if(!str){
            return 0;
        }
        var totalLength = 0;
        var i;
        var charCode;
        for (i = 0; i < str.length; i++) {
            charCode = str.charCodeAt(i);
          if (charCode < 0x007f) {
              totalLength = totalLength + 1;
          } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
              totalLength += 2;
          } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
              totalLength += 3;
          }
        }
        return totalLength;
    };

    module.exports = {
        trim:trim,
        trimLeft:trimLeft,
        trimRight:trimRight,
        byteLength:byteLength
    };
    
});
;/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:扩展user 到uap对象上
    created:2014,08.21
    update:


*/
/*global uap*/
uap && uap.define('User',function($,exports,module){
    var Backbone = uap.require('Backbone');
    var db = uap.require('database');
    var User = Backbone.Model.extend({
        login:function(){

        },
        signup:function(){

        },
        logout:function(){


        },
        changePassword:function(){

        }
    });
    module.exports = User;
});
;/*

    author:dushaobin
    email:shaobin.du@3g2win.com
    description:构建uap view模块
    create:2014.08.19
    update:______/___author___


*/
/*global window,uap*/
window.uap && uap.define('view',function($,exports,module){
    var _ = uap.require('underscore');
    var settings = {};
    /*
        配置模版参数
        @param Object newSettings 新的配置信息

    */
    var config = function(newSettings){
        settings = _.defaults({},settings,newSettings);
    };
    /*
        替换内容到制定的元素中
        @param String selector 选择器
        @param String template 模板
        @param Object dataSource 数据源
        @param Object options 参数

    */
    var renderTemp = function(selector,template,dataSource,options){
        options = _.defaults({},settings,options);
        var render = _.template(template,options);
        var dataRes = render(dataSource);
        $(selector).html(dataRes);
        return dataRes;
    };
    /*
        附加内容到指定的元素中
        @param String selector 选择器
        @param String template 模板
        @param Object dataSource 数据源
        @param Object options 参数

    */
    var apRenderTemp = function(selector,template,dataSource,options){
        options = _.defaults({},settings,options);
        var render = _.template(template,options);
        var dataRes = render(dataSource);
        $(selector).append(dataRes);
        return dataRes;
    };
    module.exports = {
        template:_.template,
        render:renderTemp,
        appendRender:apRenderTemp,
        config:config
    };
});
;/*

    author:dushaobin
    email:shaobin.du@3g2win.com
    description:构建uap window模块
    create:2014.08.18
    update:______/___author___


*/
/*global window,uap,uexWindow*/

window.uap && uap.define('window',function($,exports,module){
    
    var subscribeGlobslQueue = [];//订阅队列
    var bounceCallQueue = [];//
    var multiPopoverQueue = {};
    var currentOS = '';
    var keyFuncMapper = {};//映射
    
    /*
        捕获android实体键
        @param Number id 要拦截的键值,0-返回键，1-菜单键
        @param Number enable 是否拦截,0-不拦截，1-拦截  
        @param Function callback 当点击时触发的回调函数
    
    
    */
    function monitorKey(id,enable,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(id)){
            argObj = id;
            id = argObj['id'];
            enable = argObj['enable'] ;
            callback = argObj['callback'] || function(){};
        }
        keyFuncMapper[id] = callback;
        uexWindow.setReportKey(id,enable);
        uexWindow.onKeyPressed = function(keyCode){
            keyFuncMapper[keyCode] && keyFuncMapper[keyCode](keyCode);    
        }
    }
    
    /*
    打开一个新窗口
    @param String name 新窗口的名字 如果该window已经存在则直接打开
    @param String dataType 数据类型：0：url 1：html 数据 2：html and url
    @param String data 载入的数据
    @param Int aniId 动画id：
        0：无动画
        1:从左向右推入
        2:从右向左推入
        3:从上向下推入
        4:从下向上推入
        5:淡入淡出
        6:左翻页
        7:右翻页
        8:水波纹
        9:由左向右切入
        10:由右向左切入
        11:由上先下切入
        12:由下向上切入

        13:由左向右切出
        14:由右向左切出
        15:由上向下切出
        16:由下向上切出
    @param int width 窗口宽度
    @param int height 窗口的高度
    @param int tpye 窗口的类型
        0:普通窗口
        1:OAuth 窗口
        2:加密页面窗口
        4:强制刷新
        8:url用系统浏览器打开
        16:view不透明
        32:隐藏的winwdow
        64:等待popOver加载完毕后显示
        128:支持手势
        256:标记opn的window上一个window不隐藏
        512:标记呗open的浮动窗口用友打开wabapp
    @param animDuration 动画时长


    */
    function open(name,data,aniId,type,dataType,width,height,animDuration,extraInfo){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(name)){
            argObj = name;
            name = argObj['name'];
            dataType = argObj['dataType'] || 0;
            aniId = argObj['aniId'] || 0;
            width = argObj['width'];
            height = argObj['height'];
            type = argObj['type'] || 0;
            animDuration = argObj['animDuration'];
			extraInfo = argObj['extraInfo'];
            data = argObj['data'];
        }
        dataType = dataType || 0;
        aniId = aniId || 0;
        type = type || 0;
        animDuration = animDuration || 300;
		
		try{
			extraInfo = uap.isString(extraInfo) ? extraInfo : JSON.stringify(extraInfo);
			extraInfo = JSON.parse(extraInfo);
			if(!extraInfo.extraInfo){
				extraInfo = {extraInfo:extraInfo};
			}
			extraInfo = JSON.stringify(extraInfo);
		}catch(e){
			extraInfo = extraInfo || '';
		}
		
        //打开新窗口
        uexWindow.open(name,dataType,data,aniId,width,height,type,animDuration,extraInfo);
    }

    /*
    关闭窗口
    @param String animateId 窗口关闭动画
    @param Int animDuration 动画持续时间

    */
    function close(animId,animDuration){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(animId)){
            argObj = animId;
            animId = argObj['animId'];
            animDuration = argObj['animDuration'];
        }
        if(animId){
            animId = parseInt(animId,10);
            if(isNaN(animId) || animId > 16 || animId < 0){
                animId = -1;
            }
        }
        if(animDuration){
            animDuration = parseInt(animDuration,10);
            animDuration = isNaN(animDuration)?'':animDuration;
        }
        animDuration = animDuration || 300;
        uexWindow.close(animId,animDuration);
    }

    /*
    在指定的窗口执行js脚本

    @param string name 窗口的名字
    @param string type 窗口类型
    @param string inscript 窗口内容

    */
    function evaluateScript(name,scriptContent,type){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(name)){
            argObj = name;
            name = argObj['name'];
            type = argObj['type'] || 0;
            scriptContent = argObj['scriptContent'];
        }
        type = type || 0;
        uexWindow.evaluateScript(name,type,scriptContent);
    }
    /*
    在指定的浮动窗口中执行脚本
    @param String name 执行的窗口名字
    @param String popName 浮动窗口名
    @param String scriptContent 脚本内容

    */
    function evaluatePopoverScript(name,popName,scriptContent){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(name)){
            argObj = name;
            name = argObj['name'];
            popName = argObj['popName'] || 0;
            scriptContent = argObj['scriptContent'];
        }
        name = name || '';
        if(!uap.isString(popName) || !popName){
            return;           
        }
        uexWindow.evaluatePopoverScript(name,popName,scriptContent);
    }

    /*
    设置窗口的上拉，下拉效果
    @param String bounceType 弹动效果类型
        0:无任何效果
        1:颜色弹动效果
        2:设置图片弹动
    @param Function downEndCall 下拉到底的回调
    @param Function upEndCall 上拉到底的回调
    @param String color 设置下拉视图的颜色
    @param String imgSettings 设置显示内容
    
    todo:该方法需要重写，

    */

    function setBounce(bounceType,startPullCall,downEndCall,upEndCall,color,imgSettings){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(bounceType)){
            argObj = bounceType;
            bounceType = argObj['bounceType'] || '0';
            startPullCall = argObj['startPullCall'];
            downEndCall = argObj['downEndCall'];
            upEndCall = argObj['upEndCall'];
            color = argObj['color'] || 'rgba(255,255,255,0)';
            imgSettings = argObj['imgSettings'] || '{"imagePath":"res://reload.png",'+
            '"textColor":"#530606","pullToReloadText":"拖动刷新",'+
            '"releaseToReloadText":"释放刷新",'+
            '"loadingText":"加载中，请稍等"}';
        
        }
        color = color || 'rgba(255,255,255,0)';
        imgSettings = imgSettings || '{"imagePath":"res://reload.png",'+
        '"textColor":"#530606","pullToReloadText":"拖动刷新",'+
        '"releaseToReloadText":"释放刷新",'+
        '"loadingText":"加载中，请稍等"}';

        // if(!bounceType){
            // return;
        // }
        var startBounce = 1;
        //绑定回弹通知函数
        uexWindow.onBounceStateChange = function (type,status){
            if(status == 0){
                startPullCall && startPullCall(type);
            }
            if(status == 1) {
                downEndCall && downEndCall(type);
            }
            if(status == 2) {
                upEndCall && upEndCall(type);
            }
        };
        uexWindow.setBounce(startBounce);
        //设置颜色
        /*if(bounceType == 1){
            uexWindow.showBounceView('0',color,'1');
        }
        if(bounceType == 2){
            uexWindow.setBounceParams('0',imgSettings);
            uexWindow.showBounceView('0',color,1);
        }*/
        //绑定下拉回调
        if(startPullCall || downEndCall || upEndCall){
            if(!uap.isArray(bounceType)){
                bounceType=[bounceType];
            }
            for(var i=0;i<bounceType.length;i++){
                uexWindow.notifyBounceEvent(bounceType[i],'1');

                setBounceParams(bounceType[i],imgSettings);
                uexWindow.showBounceView(bounceType[i],color,'1'); 
                
                
            }
            
        }
    }
	
	
	var bounceStateQueue =[];
            /*
        处理回调获取弹动状态
        @param string msg 传递过来的消息
    
    */
    function processGetBounceStateQueue(data,dataType,opId){
        if(bounceStateQueue.length > 0){
            $.each(bounceStateQueue,function(i,v){
                if(v && uap.isFunction(v)){
                    if(dataType == 2){
                        v(data,dataType,opId);
                    }
                    
                }
            });
        }
        bounceStateQueue=[];
        return;
    }

    /*
        获取当前的弹动状态
        
        
    */
    function getBounceStatus(callback){
        if(arguments.length === 1 && uap.isPlainObject(callback)){
            callback = callback['callback'];
        }
        if(!uap.isFunction(callback)){
            return;
        }
        bounceStateQueue.push(callback);
        uexWindow.cbBounceState = function(opId, dataType, data){
            processGetBounceStateQueue(data,dataType,opId);
        };

        uexWindow.getBounce();
    }
    
    /*
        开启上下滑动回弹
        
        
    */
    function enableBounce(){
        //1:开启回弹效果
        uexWindow.setBounce(1);
    }
    
    /*
        关闭回弹效果
    
    */
    function disableBounce(){
        //0:禁用回弹效果
        uexWindow.setBounce(0);
    }
    
    /*
        设置回弹类
        @param String type 设置回弹的类型 
        @param String color 设置回弹显示的颜色 
        @param Int flag 设置是否添加回弹回调 
        @param Function callback 回弹的回调函数 
        
    
    */
    function setBounceType(type,color,flag,callback){
        if(arguments.length ===1 && uap.isPlainObject(type)){
            flag = type.flag;
            color = type.color;
            callback = type.callback;
            type = type.type;
        }
        flag = (flag === void 0 ? 1 : flag);
        flag = parseInt(flag,10);
        color = color || 'rgba(0,0,0,0)';
        type = (type === void 0 ? 0 : type);
        callback = callback || function(){};
        //强制开启页面弹动效果
        enableBounce();
        
        uexWindow.showBounceView(type,color,flag);
        if(flag){
            bounceCallQueue.push({type:type,callback:callback});
            uexWindow.onBounceStateChange || (uexWindow.onBounceStateChange = function(backType,status){
                var currCallObj = null;
                for(var i=0,len=bounceCallQueue.length;i<len;i++){
                    currCallObj = bounceCallQueue[i];
                    if(currCallObj){
                        if(backType === currCallObj.type){
                            if(uap.isFunction(currCallObj.callback)){
                                currCallObj.callback(status,type);
                            }
                        }
                    }
                }
            });
            //1:接收回调函数
            uexWindow.notifyBounceEvent(type,1);
        }
    }
    
    /*
        给上下回弹添加参数
        @param String position 设置回弹的类型
        @param Object data 要设置回弹显示出来内容的json参数
        {
            imagePath:'回弹显示的图片路径',
            textColor:'设置回弹内容的字体颜色',
            levelText:'设置文字的级别',
            pullToReloadText:'下拉超过边界显示出的内容',
            releaseToReloadText:'拖动超过刷新边界后显示的内容',
            loadingText:'拖动超过刷新临界线并且释放，并且拖动'
        }
    
    */
    function setBounceParams(position,data){
        if(arguments.length ===1 && uap.isPlainObject(position)){
            data = position.data;
            position = position.position;
        }
        if(uap.isPlainObject(data)){
            data = JSON.stringify(data);
        }
        uexWindow.setBounceParams(position,data);
    }
    

    /*
    展示弹动结束后显示的网页
    @param String position 0为顶端恢复弹动，1为底部恢复弹动

    */

    function resetBounceView(position){
        if(uap.isPlainObject(position)){
            position = position['position'];
        }
        position = parseInt(position,10);
        if(isNaN(position)){
            position = 0;
        }else{
            position = position;
        }
        position = position || 0;
        uexWindow.resetBounceView(position);
    }

    /*
    弹出一个非模态的提示框
    @param String type 消息提示框显示的模式
        0:没有进度条
        1:有进度条
    @param String position 提示在手机上的位置
        1:left_top
        2:top
        3:right_top
        4:left
        5:middle
        6:right
        7:bottom_left
        8:bottom
        9:right_bottom
    @param String msg 提示内容
    @param String duration 提示框存在时间，小于0不会自动关闭


    */
    

    function openToast(msg,duration,position,type){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(msg)){
            argObj = msg;
            msg = argObj['msg'];
            duration = argObj['duration'];
            position = argObj['position'] || 5;
            type = argObj['type'];
        }
        type = type || (type?0:1);
        duration = duration || 0;
        position = position || 5;
        //执行跳转
        uexWindow.toast(type,position,msg,duration);
    }

    /*
    关闭提示框

    */
    function closeToast(){
        uexWindow.closeToast();
    }

    /*
    移动浮动窗口位置动画
    @param String left 距离左边界的位置
    @param String top 距离上边界的位置
    @param Function callback 动画完成的回调函数
    @param Int duration 动画的移动时间

    */

    function moveAnim(left,top,callback,duration){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(left)){
            argObj = left;
            left = argObj['left'] || 0;
            top = argObj['top'] || 0;
            callback = argObj['callback'];
            duration = argObj['duration'] || 250;
        }
        left = left || 0;
        top = top || 0;
        duration = duration || 250;
        uexWindow.beginAnimition();
        uexWindow.setAnimitionDuration(duration);
        uexWindow.setAnimitionRepeatCount('0');
        uexWindow.setAnimitionAutoReverse('0');
        uexWindow.makeTranslation(left,top,'0');
        uexWindow.commitAnimition();
        if(uap.isFunction(callback)) {
            uexWindow.onAnimationFinish = callback;
        }
    }

    /*
    浮动窗口透明度动画
    @param Number alpha 相对于当前alpha的值，0.0到1.0的float型数据
    @param Function callback 动画完成的回调函数
    @param Number duration 动画的时间
    */

    function alphaAnim(alpha,callback,duration){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(alpha)){
            argObj = alpha;
            alpha = argObj['alpha'] || 0.5;
            callback = argObj['callback'];
            duration = argObj['duration'] || 250;
        }
        alpha = argObj['alpha'] || 0.5;
        duration = duration || 250;
        uexWindow.beginAnimition();

        uexWindow.setAnimitionDuration(duration);
        uexWindow.setAnimitionRepeatCount('0');
        uexWindow.setAnimitionAutoReverse('0');
        
        uexWindow.makeAlpha(alpha);
        
        uexWindow.commitAnimition();
        if(uap.isFunction(callback)) {
            uexWindow.onAnimationFinish = callback;
        }
    }
    
    /*
    浮动窗口伸缩动画
    @param Number x 相对于当前大小的x轴方向上的放大倍率，大于0的float型数据
    @param Number y 相对于当前大小的y轴方向上的放大倍率，大于0的float型数据
    @param Number z 相对于当前大小的z轴方向上的放大倍率，大于0的float型数据
    @param Number duration 动画的移动时间
    @param Function callback 动画完成的回调函数
    */

    function scaleAnim(x,y,z,callback,duration){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(x)){
            argObj = x;
            x = argObj['x'] || 1;
            y = argObj['y'] || 1;
            z = argObj['z'] || 1;
            duration = argObj['duration'] || 250;
            callback = argObj['callback'];
        }
        
        x = x || 1;
        y = y || 1;
        z = z || 1;
        duration = duration || 250;
        uexWindow.beginAnimition();

        uexWindow.setAnimitionDuration(duration);
        uexWindow.setAnimitionRepeatCount('0');
        uexWindow.setAnimitionAutoReverse('0');
        uexWindow.makeScale(x,y,z);
        uexWindow.commitAnimition();
        if(uap.isFunction(callback)) {
            uexWindow.onAnimationFinish = callback;
        }
    }
    
    /*
                    浮动窗口旋转动画
    @param Number degrees 相对于当前角度的旋转度数
    @param Number x 是否绕X轴旋转。0为false，1为true
    @param Number y 是否绕X轴旋转。0为false，1为true
    @param Number z 是否绕X轴旋转。0为false，1为true
    @param Number duration 动画的移动时间
    @param Function callback 动画完成的回调函数
    */

    function rotateAnim(degrees,x,y,z,callback,duration){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(degrees)){
            argObj = degrees;
            degrees = argObj['degrees'];
            x = argObj['x'] || 0 ;
            y = argObj['y'] || 0  ;
            z = argObj['z'] || 0  ;
            duration = argObj['duration'] || 250;
            callback = argObj['callback'];
        }
        
        x = argObj['x'] || 0;
        y = argObj['y'] || 0;
        z = argObj['z'] || 0;
        duration = duration || 250;
        uexWindow.beginAnimition();
        uexWindow.setAnimitionDuration(duration);
        uexWindow.setAnimitionRepeatCount('0');
        uexWindow.setAnimitionAutoReverse('0');
        uexWindow.makeRotate(degrees, x, y, z);
        uexWindow.commitAnimition();
        if(uap.isFunction(callback)) {
            uexWindow.onAnimationFinish = callback;
        }
    }
    
    /*
    浮动窗口自定义动画
    @param Number left 距离左边界的位置
    @param Number top 距离上边界的位置
    @param Number scaleX 相对于当前大小的x轴方向上的放大倍率，大于0的float型数据
    @param Number scaleY 相对于当前大小的y轴方向上的放大倍率，大于0的float型数据
    @param Number scaleZ 相对于当前大小的z轴方向上的放大倍率，大于0的float型数据
    @param Number degrees 相对于当前角度的旋转度数
    @param Number rotateX 是否绕X轴旋转。0为false，1为true
    @param Number rotateY 是否绕y轴旋转。0为false，1为true
    @param Number rotateZ 是否绕z轴旋转。0为false，1为true
    @param Number alpha 相对于当前alpha的值，0.0到1.0的float型数据
    @param Number delay 延迟执行的时间(单位：毫秒)，默认为0
    @param Number curve 动画曲线类型，默认为0，详见CONSTANT中Window AnimCurveType
    @param Number repeatCount 动画重复次数，默认为0
    @param Number isReverse 设置动画结束后自动恢复位置和状态：0-不恢复；1-恢复。默认为0
    @param Function callback 动画完成的回调函数
    @param Int duration 动画的移动时间

    */
 
    function customAnim(left,top,scaleX,scaleY,scaleZ,degrees,rotateX,rotateY,rotateZ,alpha,delay,curve,repeatCount,isReverse,callback,duration){
        
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(left)){
            argObj = left;
            
            left = argObj['left'] || 0;
            top = argObj['top'] || 0;
            
            scaleX = argObj['scaleX'] || 1;
            scaleY = argObj['scaleY'] || 1;
            scaleZ = argObj['scaleZ'] || 1;
            
            degrees = argObj['degrees'] || 0;
            rotateX = argObj['rotateX'] || 0;
            rotateY = argObj['rotateY'] || 0;
            rotateZ = argObj['rotateZ'] || 0;
            
            alpha = argObj['alpha'] || 0;
            
            delay = argObj['delay'] || 0;
            curve = argObj['curve'] || 0;
            repeatCount = argObj['repeatCount'] || 0;
            isReverse = argObj['isReverse'] || 0;
            
            callback = argObj['callback'];
            duration = argObj['duration'] || 250;
        }
        
        left = argObj['left'] || 0;
        top = argObj['top'] || 0;
        
        scaleX = argObj['scaleX'] || 1;
        scaleY = argObj['scaleY'] || 1;
        scaleZ = argObj['scaleZ'] || 1;
        
        degrees = argObj['degrees'] || 0;
        rotateX = argObj['rotateX'] || 0;
        rotateY = argObj['rotateY'] || 0;
        rotateZ = argObj['rotateZ'] || 0;
        
        alpha = argObj['alpha'] || 0;
        
        delay = argObj['delay'] || 0;
        curve = argObj['curve'] || 0;
        repeatCount = argObj['repeatCount'] || 0;
        isReverse = argObj['isReverse'] || 0;
        
        duration = duration || 250;
        
        uexWindow.beginAnimition();
        
        if(delay){
            uexWindow.setAnimitionDelay(delay);
        }
        uexWindow.setAnimitionDuration(duration);
        uexWindow.setAnimitionCurve(curve);
        uexWindow.setAnimitionRepeatCount(repeatCount);
        uexWindow.setAnimitionAutoReverse(isReverse);
        
        if(Math.abs(left) + Math.abs(top)){
            uexWindow.makeTranslation(left,top,'0');
        }
        if(!(scaleX== 1 && scaleY == 1 && scaleZ == 1)){
            uexWindow.makeScale(scaleX,scaleY,scaleZ);
        }
        if(degrees && Math.abs(degrees)>0 && (parseInt(rotateX) + parseInt(rotateY) + parseInt(rotateZ) >0)){
            uexWindow.makeRotate(degrees,rotateX,rotateY,rotateZ);
        }
        if(alpha){
            uexWindow.makeAlpha(alpha);
        }
        
        uexWindow.commitAnimition();
        if(uap.isFunction(callback)) {
            uexWindow.onAnimationFinish = callback;
        }
    }

    /*
        
    
    */
        
    function setWindowFrame(dx,dy,duration,callback){
        if(arguments.length === 1 && uap.isPlainObject(dx)){
            argObj = dx;
            dx = argObj['dx'] || 0;
            dy = argObj['dy'] || 0;
            duration = argObj['duration'] || 250;
            callback = argObj['callback'] || function(){};
        }
        uexWindow.onSetWindowFrameFinish = callback;
        uexWindow.setWindowFrame(dx,dy,duration);
    }
    
    
    /*
    依指定的样式弹出一个提示框
    @param String selector css选择器
    @param String url 加载的数据内容
    @param String left 居左距离
    @param String top 居上距离
    @param String name 弹窗名称

    */

    function popoverElement(id,url,left,top,name,extraInfo){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(id)){
            argObj = id;
            id = argObj['id'] || 0;
            url = argObj['url'];
            top = argObj['top'];
            left = argObj['left'];
			extraInfo = argObj['extraInfo'];
            name = argObj['name'];
        }
        top = top || 0;
        left = left || 0;
        var ele = $('#'+id);
        var width = ele.width();
        var height = ele.height();
        var fontSize = ele.css('font-size');
        top = parseInt(top,10);
        top = isNaN(top)?ele.offset().top:top;//默认使用元素本身的top
        left = parseInt(left,10);
        left = isNaN(left)?ele.offset().left:left;//默认使用元素本身的left
        name = name?name:id;
        
		extraInfo = extraInfo || '';
		
        //fixed xiaomi 2s bug
        fontSize = parseInt(fontSize,10);
        fontSize = isNaN(fontSize)? 0 : fontSize;
        
        openPopover(name,0,url,'',left,top,width,height,fontSize,0,0,extraInfo);
    }

    /*
    打开一个浮动窗口
    @param String name 浮动窗口名
    @param String dataType 数据类型0:url 1:html 2:url html
    @param String url  url地址
    @param String data 数据
    @param Int left 居左距离
    @param Int top 居上距离
    @param Int width 宽
    @param Int height 高
    @param Int fontSize 默认字体
    @param Int tpye 窗口的类型
        0:普通窗口
        1:OAuth 窗口
        2:加密页面窗口
        4:强制刷新
        8:url用系统浏览器打开
        16:view不透明
        32:隐藏的winwdow
        64:等待popOver加载完毕后显示
        128:支持手势
        256:标记opn的window上一个window不隐藏
        512:标记呗open的浮动窗口用友打开wabapp
    
    @param Int bottomMargin 浮动窗口相对父窗口底部的距离。为空或0时，默认为0。当值不等于0时，inHeight参数无效


    */
    function openPopover(name,dataType,url,data,left,top,width,height,fontSize,type,bottomMargin,extraInfo,position){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(name)){
            argObj = name;
            name = argObj['name'];
            dataType = argObj['dataType'];
            url = argObj['url'];
            data = argObj['data'];
            left = argObj['left'];
            top = argObj['top'];
            width = argObj['width'];
            height = argObj['height'];
            fontSize = argObj['fontSize'];
            type = argObj['type'];
            bottomMargin = argObj['bottomMargin'];
			extraInfo = argObj['extraInfo'];
            position = argObj['position'];
        }
        dataType = dataType || 0;
        left = left || 0;
        top = top || 0;
        height = height || 0;
        width = width || 0;
        type = type || 0;
        bottomMargin = bottomMargin || 0;
        fontSize = fontSize || 0;
        data = data || '';
        //fixed xiaomi 2s bug
        fontSize = parseInt(fontSize,10);
        fontSize = isNaN(fontSize)?0:fontSize;
		
		try{
			extraInfo = uap.isString(extraInfo) ? extraInfo : JSON.stringify(extraInfo);
			extraInfo = JSON.parse(extraInfo);
			if(!extraInfo.extraInfo){
				extraInfo = {extraInfo:extraInfo};
			}
			extraInfo = JSON.stringify(extraInfo);
		}catch(e){
			extraInfo = extraInfo || '';
		}
		
        //fixed ios bug
        if(uexWidgetOne.platformName && uexWidgetOne.platformName.toLowerCase().indexOf('ios') > -1){
            var args = ['"'+name+'"',dataType,'"'+url+'"','"'+data+'"',left,top,width,height,fontSize,type,bottomMargin,"'"+extraInfo+"'"];
            var scriptContent = 'uexWindow.openPopover(' + args.join(',') +')';
            evaluateScript('',scriptContent);
            return;
        }
        uexWindow.openPopover(name,dataType,url,data,left,top,width,height,fontSize,type,bottomMargin,extraInfo,position);
    }

    /*
    关闭浮动按钮
    @param String name 浮动窗口的名字

    */

    function closePopover(name){
        if(arguments.length === 1 && uap.isPlainObject(name)){
            name = name['name'];
        }
        uexWindow.closePopover(name);
    }
    

    /*
    根据制定元素重置提示框的位置大小
    @param String id 元素id
    @param String left 距左边距离
    @param String top 距上边的距离
    @param String name 名称，默认为id
    */

    function resizePopoverByEle(id,left,top,name){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(id)){
            argObj = id;
            id = argObj['id'];
            left = argObj['left'];
            top = argObj['top'];
            name = argObj['name'];
        }
        left = left || 0;
        top = top || 0;
        var ele = $('#'+id);
        var width = ele.width();
        var height = ele.height();
        left = parseInt(left,10);
        left = isNaN(left)?0:left;
        top = parseInt(top,10);
        top = isNaN(top)?0:top;
        name = name?name:id;
        uexWindow.setPopoverFrame(name,left,top,width,height);
    }

    /*
    重置提示框的位置大小
    @param String name popover名
    @param String left 距左边距离
    @param String top 距上边的距离
    @param String width 窗口的宽
    @param String height 窗口的高


    */

    function resizePopover(name,left,top,width,height){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(name)){
            argObj = name;
            name = argObj['name'];
            left = argObj['left'];
            top = argObj['top'];
            width = argObj['width'];
            height = argObj['height'];
        }
        left = left || 0;
        top = top || 0;
        width = width || 0;
        height = height || 0;

        left = parseInt(left,10);
        left = isNaN(left)?0:left;

        top = parseInt(top,10);
        top = isNaN(top)?0:top;

        width = parseInt(width,10);
        width = isNaN(width)?0:width;

        height = parseInt(height,10);
        height = isNaN(height)?0:height;

        uexWindow.setPopoverFrame(name,left,top,width,height);
    }


    /*
    弹出一个确认框
    @param String title 对话框的标题
    @param String content 对话框的内容
    @param Array buttons 按钮文字


    */
    function windowConfirm(title,content,buttons,callback){
        if(arguments.length === 1 && uap.isPlainObject(title)){
            callback = title['callback'];
            buttons = title['buttons'];
            content = title['content'];
            title = title['title'];
        }
        title = title || '提示';
        buttons = buttons || ['确定'];
        buttons = uap.isArray(buttons)?buttons:[buttons];
        popConfirm(title,content,buttons,callback);
    }
    
    /*
    弹出一个警告框
    @param String title 对话框的标题
    @param String content 对话框的内容
    @param Array buttons 按钮文字


    */
    function popAlert(title,content,buttons){
        if(arguments.length === 1 && uap.isPlainObject(title)){
            buttons = title['buttons'];
            content = title['content'];
            title = title['title'];
        }
        buttons = uap.isArray(buttons)?buttons:[buttons];
        uexWindow.alert(title,content,buttons[0]);
    }
    
    var popConfirmCallQueue =[];
    function processpopConfirmCallQueue(data,dataType,opId){
        if(popConfirmCallQueue.length > 0){
            $.each(popConfirmCallQueue,function(i,v){
                if(v && uap.isFunction(v)){
                    if(dataType != 2){
                        return v(new Error('confirm error'));
                    }
                    v(null,data,dataType,opId);
                }
            });
        }
        popConfirmCallQueue=[];
        return;
    }
    /*
        弹出一个提示框
        @param String title 对话框的标题
        @param String content 对话框的内容
        @param Array buttons 按钮文字
       
    */
    function popConfirm(title,content,buttons,callback){
        if(arguments.length === 1 && uap.isPlainObject(title)){
            callback = title['callback'];
            buttons = title['buttons'];
            content = title['content'];
            title = title['title'];
        }
        buttons = uap.isArray(buttons)?buttons:[buttons];
        if(uap.isFunction(callback)){
            popConfirmCallQueue.push(callback);
            uexWindow.cbConfirm = function(optId,dataType,data){
                processpopConfirmCallQueue(data,dataType,optId);
            };
        }
        
        uexWindow.confirm(title,content,buttons);
    }
    
    /*
        弹出一个可提示用户输入的对话框
        @param String title 对话框的标题
        @param String content 对话框显示的内容
        @param String defaultValue 输入框默认文字
        @param Array  buttons 显示在按钮上的文字集合
        @param Function callback  对话框关闭的回调 
        
        
    */
    function popPrompt(title, content, defaultValue, buttons,callback){
        if(arguments.length === 1 && uap.isPlainObject(title)){
            callback = title['callback'];
            buttons = title['buttons'];
            content = title['content'];
            defaultValue = title['defaultValue'];
            title = title['title'];
        }
        buttons = uap.isArray(buttons)?buttons:[buttons];
        if(uap.isFunction(callback)){
            uexWindow.cbPrompt = function(optId,dataType,data){
                try{
                    var data=JSON.parse(data);
                    callback(null,data,dataType,optId);
                }
                catch(e){
                    callback(e);
                }
            };
        }
        
        uexWindow.prompt(title,content,defaultValue,buttons);
    }
    
    /*
    把指定的浮动窗口排在所有浮动窗口最上面
    @param String name 浮动窗口的名字

    */

    function bringPopoverToFront(name){
        if(arguments.length === 1 && uap.isPlainObject(name)){
            name = name['name'];
        }
        if(!name){
            uexWindow.bringToFront();
        }else{
            uexWindow.bringPopoverToFront(name);
        }
    }
    
    /*
    把指定的浮动窗口排在所有浮动窗口最下面
    @param String name 浮动窗口的名字

    */
    
    function sendPopoverToBack(name){
        if(arguments.length === 1 && uap.isPlainObject(name)){
            name = name['name'];
        }
        if(!name){
            uexWindow.sendToBack();
        }else{
            uexWindow.sendPopoverToBack(name);
        }
    }
    
    /*
        订阅一个频道消息,当有消息发布的时候该该回调将会调用该回调
        @param Int channelId 频道id
        @param Function callback回调函数
        
    */
    function subscribe(channelId,callback){
        if(arguments.length === 1 && uap.isPlainObject(channelId)){
            callback = channelId['callback'];
            channelId = channelId['channelId'];
        }
        if(!uap.isFunction(callback)){
            return;
        }
        var funName = 'notify_callback_' + uap.getUID();
        uexWindow[funName] = callback;
        uexWindow.subscribeChannelNotification(channelId,funName);
    }
    
    /*
        发布一个消息
        @param Int channelId :频道id
        @param String msg : 要发布的消息
    
    */
    function publish(channelId,msg){
        if(arguments.length === 1 && uap.isPlainObject(channelId)){
            msg = channelId['msg'];
            channelId = channelId['channelId'];
        }
        if(uap.isPlainObject(msg)){
            msg = JSON.stringify(msg);
        }
        uexWindow.publishChannelNotification(channelId,msg);
    }
    
    /*
        向全局的公共频道发送消息
        @param String msg 向全局频道发送消息
    
    */
    
    function publishGlobal(msg){
        if(arguments.length === 1 && uap.isPlainObject(msg)){
            msg = msg['msg'];
        }
        uexWindow.postGlobalNotification(msg);
    }
    
    /*
        处理全局回调订阅消息
        @param string msg 传递过来的消息
    
    */
    function processSubscribeGolbalQueue(msg){
        if(subscribeGlobslQueue.length > 0){
            $.each(subscribeGlobslQueue,function(i,v){
                if(v && uap.isFunction(v)){
                    v(msg);
                }
            });
        }
        return
    }
    
    /*
        订阅全局的频道
        @param Function callback 订阅的回调
    
    */
    function subscribeGlobal(callback){
        if(arguments.length === 1 && uap.isPlainObject(callback)){
            callback = callback['callback'];
        }
        if(!uap.isFunction(callback)){
            return;
        }
        subscribeGlobslQueue.push(callback);
        uexWindow.onGlobalNotification = function(msg){
            processSubscribeGolbalQueue(msg);
        };
    }
    
    /*
        移除全局订阅事件
        @param Function callback：要移除的回调的引用
    
    */
    function removeGlobalSubscribe(callback){
        if(arguments.length === 1 && uap.isPlainObject(callback)){
            callback = callback['callback'];
        }
        if(!uap.isFunction(callback)){
            return;
        }
        for(var i=0,len=subscribeGlobslQueue.length;i<len;i++){
            if(subscribeGlobslQueue[i] === callback){
                subscribeGlobslQueue.splice(i,1);
                return;
            }
        }
    }
    
    /*
        处理多窗口滑动回调事件
        
    */
    function processMultiPopover(err,res){
        if(err){
            //todo call error
        }else{
            if(uap.isString(res)){
                res = JSON.parse(res);
            }
            if(!res.multiPopName){
                return;
            }
            var multiCalls = multiPopoverQueue[res.multiPopName];
            $.each(multiCalls,function(i,fun){
                if(uap.isFunction(fun)){
                    fun(null,res);
                }
            });
        }
    }
    
    /*
        弹出多页面浮动窗口
        @param String popName:弹出窗口的名称 
        @param String content:传入的数据 
        @param String dataType:传入数据的类型 0：url方式载入；1：html内容 方式载入；2：既有url方式，又有html内容方式 
        @param Int left:距离左边的距离 
        @param Int top:距离上边界的距离 
        @param Int width:弹出窗口的宽
        @param Int height:弹出窗口的高 
        @param Int fontSize:字体大小 
        @param Int flag:弹出类型的标识
        @param Int indexSelected:默认选中的窗口 
        
    
    */
    function openMultiPopover(popName,content,dataType, left, top, width, height,change, fontSize, flag, indexSelected,extraInfo){
        if(arguments.length === 1 && uap.isPlainObject(popName)){
            indexSelected = popName['indexSelected'];
            flag = popName['flag'];
            fontSize = popName['fontSize'];
            change = popName['change'];
            height = popName['height'];
            width = popName['width'];
            top = popName['top'];
            left = popName['left'];
            dataType = popName['dataType'];
            content = popName['content'];
			extraInfo = popName['extraInfo']
            popName = popName['popName'];
        }
        dataType = dataType || 0;
        flag = flag || 0;
        indexSelected = parseInt(indexSelected,10);
        indexSelected = isNaN(indexSelected)? 0 : indexSelected;
        width = width || '';
        height = height || '';
        change = change || function(){};
		
		try{
			extraInfo = uap.isString(extraInfo) ? extraInfo : JSON.stringify(extraInfo);
			extraInfo = JSON.parse(extraInfo);
			if(!extraInfo.extraInfo){
				extraInfo = {extraInfo:extraInfo};
			}
			extraInfo = JSON.stringify(extraInfo);
		}catch(e){
			extraInfo = extraInfo || '';
		}
        
        //fixed android 如果少任何一个key就会crash bug
        if(!uap.isString(content)){
            if(!content.content){
                content={
                    content:content
                };
            }
        }else{
            content = JSON.parse(content);
            if(!content.content){
                content={
                    content:content
                };
            }
        }
        //check all key
        var mustKey = ['inPageName','inUrl','inData'];
        var realContent = content.content;
        $.each(realContent,function(i,v){
            $.each(mustKey,function(i1,v1){
                if(!(v1 in v)){
                    v[v1] = '';
                }
            });
        });
        //content
        content = JSON.stringify(content);
        if(multiPopoverQueue[popName]){
            multiPopoverQueue[popName].push(change);
        }else{
            multiPopoverQueue[popName] = [change];
        }
        uexWindow.openMultiPopover(content,popName,dataType, left, top, width, height, fontSize, flag, indexSelected,extraInfo);
        uexWindow.cbOpenMultiPopover = function(optId,dataType,res){
            if(optId == 0){
                if(dataType != 1){
                    processMultiPopover(new Error('multi popover error'));
                }else{
                    processMultiPopover(null,res);
                }
            }
        };
        //fixed ios indexed bug
        setSelectedPopOverInMultiWindow(popName, indexSelected);
    }
    
    /*
        关闭多页面浮动窗口
        @param String popName:多页面弹出窗口
        
    
    */
    function closeMultiPopover(popName){
        if(arguments.length === 1 && uap.isPlainObject(popName)){
            popName = popName['popName'];
        }
        if(!popName){
            return;
        }
        
        uexWindow.closeMultiPopover(popName)
        
    }
    
    /*
        设置多页面浮动窗口跳转到的子页面窗口的索引
        @param String popName:多窗口弹出框的名称
        @param String index:页面的索引 
        
        
    */
    function setSelectedPopOverInMultiWindow(popName,index){
        if(arguments.length === 1 && uap.isPlainObject(popName)){
            index = popName['index'];
            popName = popName['popName'];
        }
        if(!popName){
            return;
        }
        index = parseInt(index,10);
        index = isNaN(index)? 0 : index;
        //fixed 模拟器不支持MultiPopOver bug
        uexWindow.setSelectedPopOverInMultiWindow && uexWindow.setSelectedPopOverInMultiWindow(popName,index);
        
    }
    
    
    
    var windowStatusCallList = [];
    
    /*
        
        处理窗口回调事件
        @param Function state:当前的状态
        
        
    */
    function processWindowStateChange(state){
        $.each(windowStatusCallList,function(i,v){
            if(uap.isFunction(v)){
                v(state);
            }
        })
    }
    
    
    /*
        当前窗口的状态改变
        @param Function callback:窗口事件改变后的回调函数
        
    
    */
    function onStateChange(callback){
        if(!uap.isFunction(callback)){
            return;
        }
        //兼容老用法
        
        windowStatusCallList.push(callback);
        
        uexWindow.onStateChange = processWindowStateChange;
    }
    
    /*
        默认状态改变事件
        
    
    */
    
    function defaultStatusChange(state){
        var tmpResumeCall = null;
        var tmpPauseCall = null;
        if(uap.window.onResume){
            tmpResumeCall = uap.window.onResume;
        }
        if(uap.window.onPause){
            tmpPauseCall = uap.window.onPause;
        }
        
        if(state === 0){
            uapWindow.emit('resume');
            tmpResumeCall && tmpResumeCall();
        }
        
        if(state === 1){
            uapWindow.emit('pause');
            tmpPauseCall && tmpPauseCall();
        }
        
    }
    
    
    /*
    
        swipe回调列表
        
        
    */
    var swipeCallbackList = {
        left:[],
        right:[] 
    };
    
    function processSwipeLeft(){
        
        $.each(swipeCallbackList.left,function(i,v){
            if(uap.isFunction(v)){
                v();
            }
        })
        
    }
    
    function processSwipeRight(){
        
        $.each(swipeCallbackList.right,function(i,v){
            if(uap.isFunction(v)){
                v();
            }
        })
    }
    
    /*
        当页面滑动的时候，执行的回调方法
        
    
    */
    function onSwipe(direction,callback){
        
        if(direction === 'left'){
            swipeCallbackList[direction].push(callback);
            
            uexWindow.onSwipeLeft = processSwipeLeft;
            return;
        }
        if(direction === 'right'){
            swipeCallbackList[direction].push(callback);
            
            uexWindow.onSwipeRight = processSwipeRight;
            return;
        }
    }
    
    function onSwipeLeft(callback){
        if(!uap.isFunction(callback)){
            return;
        }
        onSwipe('left',callback);
    }
    
    function onSwipeRight(callback){
        if(!uap.isFunction(callback)){
            return;
        }
        onSwipe('right',callback);
    }
    
    /*
        
        兼容原始uap.frame.onSwipeLeft 和 uap.window.onSwipeLeft 方法
        
    
    */
    function defaultSwipeLeft(){
        var tmpSwipeLeftCall = null;
        var tmpFrameSLCall = null;
        
        if(uap.window.onSwipeLeft){
            tmpSwipeLeftCall = uap.window.onSwipeLeft;
        }
        
        if(uap.frame.onSwipeLeft){
            tmpFrameSLCall = uap.frame.onSwipeLeft;
        }
        
        uapWindow.emit('swipeLeft');
        uap.frame && uap.frame.emit && uap.frame.emit('swipeLeft');
        tmpSwipeLeftCall && tmpSwipeLeftCall();
        tmpFrameSLCall && tmpFrameSLCall();
        
    }
    
    
     /*
        
        兼容原始uap.frame.onSwipeRight 和 uap.window.onSwipeRight 方法
        
    
    */
    function defaultSwipeRight(){
        var tmpSwipeRightCall = null;
        var tmpFrameSRCall = null;
        
        if(uap.window.onSwipeRight){
            tmpSwipeRightCall = uap.window.onSwipeRight;
        }
        
        if(uap.frame.onSwipeRight){
            tmpFrameSRCall = uap.frame.onSwipeRight;
        }
        
        uapWindow.emit('swipeRight');
        uap.frame && uap.frame.emit && uap.frame.emit('swipeRight');
        tmpSwipeRightCall && tmpSwipeRightCall();
        tmpFrameSRCall && tmpFrameSRCall();
    }
    /*
        
        控制父组件是否拦截子组件的事件 
        @param Int enable 设置父组件是否拦截子组件的事件,参数不为1时设置默认拦截；0:可以拦截，子组件不可以正常响应事件 ；1:不拦截，子组件可以正常响应事件 
    */
    function setMultilPopoverFlippingEnbaled(enable){
        var enable = parseInt(enable,10);
        enable = isNaN(enable)?0:enable;
        enable = enable!=1?0:enable;
        uexWindow.setMultilPopoverFlippingEnbaled(enable);
    }

    var popActionSheetCallQueue =[];
    function processpopActionSheetCallQueue(data,dataType,opId){
        if(popActionSheetCallQueue.length > 0){
            $.each(popActionSheetCallQueue,function(i,v){
                if(v && uap.isFunction(v)){
                    if(dataType != 2){
                        return v(new Error(' error'));
                    }
                    v(null,data,dataType,opId);
                }
            });
        }
        popActionSheetCallQueue=[];
        return;
    }
    /*
        弹出一个可选的菜单列表
        @param String title 菜单列表的标题
        @param String cancelText 取消按钮上显示文字内容
        @param Array  buttons 显示在菜单列表上的文字集合
        @param Function callback  菜单列表关闭的回调 
        buglly:需添加opId参数传入与回调对应
        
    */
    function popActionSheet(title, cancelText, buttons,callback){
        if(arguments.length === 1 && uap.isPlainObject(title)){
            callback = title['callback'];
            buttons = title['buttons'];
            cancelText = title['cancelText'];
            title = title['title'];
        }
        buttons = uap.isArray(buttons)?buttons:[buttons];
        if(uap.isFunction(callback)){
            uexWindow.cbActionSheet  = function(opId,dataType,data){
                //callback(null,data,dataType,optId);
                popActionSheetCallQueue.push(callback);
                processpopActionSheetCallQueue(data,dataType,opId);
            };
        }
        
        uexWindow.actionSheet(title,cancelText,buttons);
    }

        /*
     * 设置侧滑窗口信息
     * @param Object leftSliding 侧滑左窗口信息 JSON对象{width:240,url:"uexWindow_left.html"}
     * @param Object rightSliding 侧滑左窗口信息 JSON对象{width:240,url:"uexWindow_right.html"}
     * 支持只设置一个对象参数，例如： {leftSliding: {width:240,url:"uexWindow_left.html"},rightSliding: {width:240,url:"uexWindow_left.html"}}
     */
    function setSlidingWindow(leftSliding,rightSliding,animationId,bg){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(leftSliding)){
            argObj = JSON.stringify(leftSliding);
        }else{
            argObj = {};
            if(uap.isPlainObject(leftSliding)){
                argObj.leftSliding = leftSliding;
            }else{
                argObj.leftSliding = JSON.parse(leftSliding);
            }
            if(uap.isPlainObject(rightSliding)){
                argObj.rightSliding = rightSliding;
            }else{
                argObj.rightSliding = JSON.parse(rightSliding);
            }
            argObj.animationId = animationId||'1';
            argObj.bg = bg ||'';
            argObj = JSON.stringify(argObj);
        }
        uexWindow.setSlidingWindow(argObj);
    }
    /*
        打开或关闭侧滑窗口，注：打开侧滑窗口前，需先调用setSlidingWindow设置打开的侧滑窗口信息
        @param Number mark 必选 左右侧窗口标识，0：左侧，1：右侧
        @param Number reload 可选 是否重新加载页面 ，1：重新加载
     * */
    function toggleSlidingWindow(mark,reload){
        var argObj = null;
        if(!uap.isPlainObject(mark) && !JSON.parse(mark)){
            argObj = {};
            argObj.mark = mark;
            if(reload) argObj.reload = reload;
        }else{
            argObj = mark;
        }
        if(uap.isPlainObject(argObj)){
            argObj = JSON.stringify(argObj);
        }
        uexWindow.toggleSlidingWindow(argObj);
    }
    
    /*
     设置侧滑窗口是否可用
     * @param Number enable 侧滑窗口是否可用，0：不可用，1：可用
     * */
    function setSlidingWindowEnabled(enable){
        var enable = parseInt(enable,10);
        enable = isNaN(enable)?0:enable;
        enable = enable!=0?1:enable;
        uexWindow.setSlidingWindowEnabled(enable);
    }

    var urlQueryQueue =[];
    /*
        处理回调获取加载页面时传入的参数
        @param Number data 传递过来的数据信息
        @param Number dataType 回调返回的数据类型
        @param Number opId 该回调的操作Id
    */
    function processGetUrlQueryQueue(data,dataType,opId){
        if(urlQueryQueue.length > 0){
            $.each(urlQueryQueue,function(i,v){
                if(v && uap.isFunction(v)){
                    v(data,dataType,opId);
                }
            });
        }
        urlQueryQueue=[];
        return;
    }

    /*
        获取加载页面时传入的参数
    @param Function callback 获取成功后的回调函数
    */
    function getUrlQuery(callback){
        if(arguments.length === 1 && uap.isPlainObject(callback)){
            callback = callback['callback'];
        }
        if(!uap.isFunction(callback)){
            return;
        }
        urlQueryQueue = urlQueryQueue || [],
        urlQueryQueue.push(callback);
        uexWindow.cbGetUrlQuery = function(opId, dataType, data){
            processGetUrlQueryQueue(data,dataType,opId);
        };

        uexWindow.getUrlQuery();
    }
    
    var slidingWindowStateQueue =[];
    /*
        处理回调返回的状态信息
        @param string state 回调返回的状态信息
    */
    function processSlidingWindowStateQueue(state){
        if(slidingWindowStateQueue.length > 0){
            $.each(slidingWindowStateQueue,function(i,v){
                if(v && uap.isFunction(v)){
                    v(state);
                }
            });
        }
        slidingWindowStateQueue=[];
        return;
    }

    /*
        获取侧滑窗口显示情况
        @param Function callback 获取成功后的回调函数
    */
    function getSlidingWindowState(callback){
        if(arguments.length === 1 && uap.isPlainObject(callback)){
            callback = callback['callback'];
        }
        if(!uap.isFunction(callback)){
            return;
        }
        slidingWindowStateQueue = slidingWindowStateQueue || [];
        slidingWindowStateQueue.push(callback);
        uexWindow.cbSlidingWindowState = function(state){
            processSlidingWindowStateQueue(state);
        };
        uexWindow.getSlidingWindowState();
    }

    /*
     设置状态条上字体的颜色
     * @param Number type 状态条上字体的颜色，0为白色(iOS7以上为透明底,iOS7以下为黑底)， 1为黑色(iOS7以上为透明底,iOS7以下为白底)
     * */
    function setStatusBarTitleColor(type){
        var type = parseInt(type,10);
        type = isNaN(type)?0:type;
        type = type!=0?1:type;
        uexWindow.setStatusBarTitleColor(type);
    }

    /*
    在多窗口机制中，前进到下一个window
    @param Number animateId 动画类型Id
        animateId:动画类型Id
            0: 无动画
            1: 从左向右推入
            2: 从右向左推入
            3: 从上向下推入
            4: 从下向上推入
            5: 淡入淡出
            6: 左翻页
            7: 右翻页
            8: 水波纹
            9: 由左向右切入
          10: 由右向左切入
          11: 由上先下切入
          12: 由下向上切入
          13: 由左向右切出
          14: 由右向左切出
          15: 由上向下切出
          16: 由下向上切出
    @param Number animDuration 动画持续时长，单位为毫秒，默认为260毫秒

    */
    function windowForward(animId,animDuration){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(animId)){
            argObj = animId;
            animId = argObj['animId'];
            animDuration = argObj['animDuration'];
        }
        if(animId){
            animId = parseInt(animId,10);
            if(isNaN(animId) || animId > 16 || animId < 0){
                animId = 0;
            }
        }
        if(animDuration){
            animDuration = parseInt(animDuration,10);
            animDuration = isNaN(animDuration)?'':animDuration;
        }
        animDuration = animDuration || 260;
        uexWindow.windowForward(animId,animDuration);
    }
    
     /*
    在多窗口机制中，返回到上一个窗口:在多窗口机制中，用于返回上一个window，比如在A window中uap.window.open了B window，那么在Bwindow中返回Awindow就可使用此方法。
    @param Number animateId 动画类型Id
        animateId:动画类型Id
            0: 无动画
            1: 从左向右推入
            2: 从右向左推入
            3: 从上向下推入
            4: 从下向上推入
            5: 淡入淡出
            6: 左翻页
            7: 右翻页
            8: 水波纹
            9: 由左向右切入
          10: 由右向左切入
          11: 由上先下切入
          12: 由下向上切入
          13: 由左向右切出
          14: 由右向左切出
          15: 由上向下切出
          16: 由下向上切出
    @param Number animDuration 动画持续时长，单位为毫秒，默认为260毫秒

    */
    function windowBack(animId,animDuration){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(animId)){
            argObj = animId;
            animId = argObj['animId'];
            animDuration = argObj['animDuration'];
        }
        if(animId){
            animId = parseInt(animId,10);
            if(isNaN(animId) || animId > 16 || animId < 0){
                animId = 0;
            }
        }
        if(animDuration){
            animDuration = parseInt(animDuration,10);
            animDuration = isNaN(animDuration)?'':animDuration;
        }
        animDuration = animDuration || 260;
        uexWindow.windowBack(animId,animDuration);
    }
    
    /*
     调用uap.window.open方法且其中type为64时打开的主窗口ready方法中调用：预加载浮动窗口开始
     */
    function preOpenStart(){
        uexWindow.preOpenStart();
    }
    
    /*
     调用uap.window.open方法且其中type为64时打开的主窗口ready方法中调用：预加载浮动窗口结束
     */
    function preOpenFinish(){
        uexWindow.preOpenFinish();
    }

    var stateQueue =[];
    /*
        处理回调返回的状态信息
        @param Number data 回调返回的数据信息
        @param Number dataType 回调返回的数据类型
        @param Number opId 该回调的操作Id
    */
    function processGetStateQueue(data,dataType,opId){
        if(stateQueue.length > 0){
            $.each(stateQueue,function(i,v){
                if(v && uap.isFunction(v)){
                    v(null,data,dataType,opId);
                }
            });
        }
        stateQueue=[];
        return;
    }

    /*
        获取当前窗口处于前台还是后台
    @param Function callback(err,data,dataType) 获取成功后的回调函数
           err:第一个参数是Error对象如果为空则表示没有错误，否则表示操作出错了，
           data:表示返回的数据，0：前台；1：后台,
           dataType:操作结果的数据类型，默认为2：Number类型
           optId:该操作id
    */
    function getState(callback){
        if(arguments.length === 1 && uap.isPlainObject(callback)){
            callback = callback['callback'];
        }
        if(!uap.isFunction(callback)){
            return;
        }
        stateQueue.push(callback);
        //data:返回的数据，0：前台；1：后台
        try{
            uexWindow.cbGetState = function(opId,dataType,data){
                processGetStateQueue(data,dataType,opId);
            };
        }catch(e){
            callback(e);
        }
        
        uexWindow.getState();
    }

    /*
        发送消息到状态栏
        @param Number title 必选  标题
        @param Number msg 必选 消息
     * */
    function statusBarNotification(title,msg){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(title)){
            argObj = title;
            title = argObj['title'] || '';
            msg = argObj['msg'] || '';
        }
        title = title || '';
        msg = msg || '';
        if(msg == ''){
            return;
        }
        uexWindow.statusBarNotification(title,msg);
    }

    /*
     设置内容超过一屏滚动的时候滚动条的显示和隐藏
     * @param Number enable 滚动条的显示和隐藏，0：隐藏，1：显示
     * */
    function setWindowScrollbarVisible(enable){
        var enable = parseInt(enable,10);
        enable = isNaN(enable)?0:enable;
        enable = enable!=0?'true':'false';
        uexWindow.setWindowScrollbarVisible(enable);//android引擎只接受字符串true,false
    }
    
    /*
            隐藏弹动效果
        @param Number type 隐藏的位置，0:顶端，1：底部
     * */
    function hiddenBounceView(type){
        type = type!=1?0:type;
        uexWindow.hiddenBounceView(type);
    }
    
    /*
            显示弹动效果
        @param Number type 弹动的位置，0：顶端弹动；1：底部弹动
        @param String color 弹动显示部位的颜色值，内容不超过一屏时底部弹动内容不显示,
        @param String flag 是否显示内容，1：显示；0：不显示
     * * */
    function showBounceView(type,color,flag){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(type)){
            argObj = type;
            type = argObj["type"] || 0;
            color = argObj["color"] ;
            flag = argObj["flag"] || 1;
        }
        type = type || 0;
        flag = flag || 1;
        uexWindow.showBounceView(type,color,flag);
    }
    
    /*
     将当前浮动窗口插入到指定浮动窗口之上
     @param String name 目标浮动窗口的名称
     * */
    function insertAbove(name){
        if(arguments.length === 1 && uap.isPlainObject(name)){
            name = name["name"];
        }
        if(!name){
            return;
        }
        uexWindow.insertAbove(name);
    }
    
    /*
     将当前浮动窗口插入到指定浮动窗口之下
     @param String name 目标浮动窗口的名称
     * */
    function insertBelow(name){
        if(arguments.length === 1 && uap.isPlainObject(name)){
            name = name["name"];
        }
        if(!name){
            return;
        }
        uexWindow.insertBelow(name);
    }
    
    /*
     将指定浮动窗口插入到另一浮动窗口之上,只在主窗口中有效
     @param String nameA 指定浮动窗口A的名称
     @param String nameB 指定浮动窗口B的名称
     * */
    function insertPopoverAbovePopover (nameA,nameB){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(nameA)){
            argObj = nameA;
            nameA = argObj["nameA"];
            nameB = argObj["nameB"];
        }
        if(!nameA || !nameB){
            return;
        }
        uexWindow.insertPopoverAbovePopover(nameA,nameB);
    }
    
    /*
     将指定浮动窗口插入到另一浮动窗口之下,只在主窗口中有效
     @param String nameA 指定浮动窗口A的名称
     @param String nameB 指定浮动窗口B的名称
     * */
    function insertPopoverBelowPopover (nameA,nameB){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(nameA)){
            argObj = nameA;
            nameA = argObj["nameA"];
            nameB = argObj["nameB"];
        }
        if(!nameA || !nameB){
            return;
        }
        uexWindow.insertPopoverBelowPopover(nameA,nameB);
    }
    
    /*
    设置当前窗口显示和隐藏，该接口仅对显示在屏幕上且不被隐藏的window起作用。（即open该window时，flag传入的是256）
        @param Number type 显示或隐藏，0-显示；1-隐藏
     * */
    function setWindowHidden(type){
        type = type!=1?0:type;
        uexWindow.setWindowHidden(type);
    }

    /*
     将指定窗口A插入到另一窗口B之上，该接口仅对显示在屏幕上且不被隐藏的window起作用。（即open该window时，flag传入的是256）
     @param String nameA 指定窗口A的名称
     @param String nameB 指定窗口B的名称
     * */
    function insertWindowAboveWindow (nameA,nameB){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(nameA)){
            argObj = nameA;
            nameA = argObj["nameA"];
            nameB = argObj["nameB"];
        }
        if(!nameA || !nameB){
            return;
        }
        uexWindow.insertWindowAboveWindow(nameA,nameB);
    }
    
    /*
     将指定窗口A插入到另一窗口B之下，该接口仅对显示在屏幕上且不被隐藏的window起作用。（即open该window时，flag传入的是256）
     @param String nameA 指定窗口A的名称
     @param String nameB 指定窗口B的名称
     * */
    function insertWindowBelowWindow (nameA,nameB){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(nameA)){
            argObj = nameA;
            nameA = argObj["nameA"];
            nameB = argObj["nameB"];
        }
        if(!nameA || !nameB){
            return;
        }
        uexWindow.insertWindowBelowWindow(nameA,nameB);
    }

    var popoverLoadFinishInRootWndCallList = [];
    
    /*
        处理浮动窗口加载完成回调事件
        @param String name:浮动窗口的名称
        @param String url:浮动窗口的url；当浮动窗口加载的是本地网页时，url返回网页的绝对路径（file:// 开头）当浮动窗口加载的是网络上的网页时，url返回网址（http:// 开头）
    */
    function processPopoverLoadFinishInRootWnd(name,url){
        $.each(popoverLoadFinishInRootWndCallList,function(i,v){
            if(uap.isFunction(v)){
                v(name,url);
            }
        });
        popoverLoadFinishInRootWndCallList = [];
        return;
    }
    
    /*
        浮动窗口加载完成的监听方法
        @param Function callback(name,url):浮动窗口加载完成的回调函数
            name:浮动窗口的名称
            url:浮动窗口的url；当浮动窗口加载的是本地网页时，url返回网页的绝对路径（file:// 开头）当浮动窗口加载的是网络上的网页时，url返回网址（http:// 开头）
    */
    function onPopoverLoadFinishInRootWnd(callback){
        if(!uap.isFunction(callback)){
            return;
        }
        popoverLoadFinishInRootWndCallList.push(callback);
        uexWindow.onPopoverLoadFinishInRootWnd = processPopoverLoadFinishInRootWnd;
    }
    
    
    //默认绑定状态
    uap.ready(function(){
        //绑定默认状态改变事件
        onStateChange(defaultStatusChange);
        //绑定默认swipe事件
        onSwipeLeft(defaultSwipeLeft);
        //绑定默认swipe事件
        onSwipeRight(defaultSwipeRight);
    });
    
    //导出接口
    var uapWindow = module.exports = {
        open:open,
        close:close,
        evaluateScript:evaluateScript,
        evaluatePopoverScript:evaluatePopoverScript,
        setBounce:setBounce,
        setBounceParams:setBounceParams,
        enableBounce:enableBounce,
        disableBounce:disableBounce,
        setBounceType:setBounceType,
        resetBounceView:resetBounceView,
        openToast:openToast,
        closeToast:closeToast,
        moveAnim:moveAnim,
        popoverElement:popoverElement,
        openPopover:openPopover,
        closePopover:closePopover,
        resizePopover:resizePopover,
        resizePopoverByEle:resizePopoverByEle,
        alert:windowConfirm,
        //popAlert:popAlert, 隐藏该接口，因为confirm
        confirm:popConfirm,
        prompt:popPrompt,
        bringPopoverToFront:bringPopoverToFront,
        sendPopoverToBack:sendPopoverToBack,
        publish:publish,
        subscribe:subscribe,
        //publishGlobal:publishGlobal,
        //subscribeGlobal:subscribeGlobal,
        selectMultiPopover:setSelectedPopOverInMultiWindow,
        openMultiPopover:openMultiPopover,
        closeMultiPopover:closeMultiPopover,
        setWindowFrame:setWindowFrame,
        monitorKey:monitorKey,
        stateChange:onStateChange,
        swipeLeft:onSwipeLeft,
        swipeRight:onSwipeRight,
		getBounceStatus:getBounceStatus,
        setMultilPopoverFlippingEnbaled:setMultilPopoverFlippingEnbaled,
        
        actionSheet:popActionSheet,
        scaleAnim:scaleAnim,
        alphaAnim:alphaAnim,
        rotateAnim:rotateAnim,
        customAnim:customAnim,
        setSlidingWindow:setSlidingWindow,
        toggleSlidingWindow:toggleSlidingWindow,
        getSlidingWindowState:getSlidingWindowState,
        setSlidingWindowEnabled:setSlidingWindowEnabled,
        getUrlQuery:getUrlQuery,
        setStatusBarTitleColor:setStatusBarTitleColor,
        windowForward:windowForward,
        windowBack:windowBack,
        preOpenStart:preOpenStart,
        preOpenFinish:preOpenFinish,
        getState:getState,
        //statusBarNotification:statusBarNotification,//android正常，IOS调用本地推送只显示了msg没显示title
        setWindowScrollbarVisible:setWindowScrollbarVisible,
        insertPopoverBelowPopover:insertPopoverBelowPopover,
        insertPopoverAbovePopover:insertPopoverAbovePopover,
        insertBelow:insertBelow,
        insertAbove:insertAbove,
        insertWindowBelowWindow:insertWindowBelowWindow,
        insertWindowAboveWindow:insertWindowAboveWindow,
        //setWindowHidden:setWindowHidden,IOS,android不同有问题
        showBounceView:showBounceView,
        hiddenBounceView:hiddenBounceView,
        onPopoverLoadFinishInRootWnd:onPopoverLoadFinishInRootWnd
    };
    
    uap.extend(uapWindow,uap.eventEmitter);

});

/*
    author:dushaobin
    email:shaobin.du@3g2win.com
    description:构建uap window模块
    create:2014.08.18
    update:______/___author___

*/
window.uap && uap.define('frame',function($,exports,module){
    var appWin = uap.require('window');
    
    var uapFrame = module.exports = {
        //open:appWin.openPopover,
        close:appWin.closePopover,
        //resize:appWin.resizePopover,
        bringToFront:appWin.bringPopoverToFront,
        sendToBack:appWin.sendPopoverToBack,
        evaluateScript:appWin.evaluatePopoverScript,
        publish:appWin.publish,
        subscribe:appWin.subscribe,
        //publishGlobal:appWin.publishGlobal,
        //subscribeGlobal:appWin.subscribeGlobal,
        selectMulti:appWin.selectMultiPopover,
        openMulti:appWin.openMultiPopover,
        closeMulti:appWin.closeMultiPopover,
        setBounce:appWin.setBounce,
		getBounceStatus:appWin.getBounceStatus,
        resetBounce:appWin.resetBounceView,
        open:function(id,url,left,top,name,index,change,extraInfo){
            var argObj = null;
            if(arguments.length === 1 && uap.isPlainObject(id)){
                argObj = id;
                id = argObj['id'] || 0;
                url = argObj['url'];
                top = argObj['top'];
                left = argObj['left'];
                name = argObj['name'];
                index = argObj['index'];
                change = argObj['change'];
            }
            if(uap.isArray(url)){
                var ele = $('#'+id);
                var width = ele.width();
                var height = ele.height();
                var fontSize = ele.css('font-size');
                top = parseInt(top,10);
                top = isNaN(top)?ele.offset().top:top;//默认使用元素本身的top
                left = parseInt(left,10);
                left = isNaN(left)?ele.offset().left:left;//默认使用元素本身的left
                name = name?name:id;
                //fixed xiaomi 2s bug
                fontSize = parseInt(fontSize,10);
                fontSize = isNaN(fontSize)? 0 : fontSize;
                appWin.openMultiPopover(name || id,
                    url,0,left,top,width,height,change||function(){},fontSize,0,index,extraInfo);
            }
            else{
                appWin.popoverElement(id,url,left,top,name,extraInfo);
            }
        },
        resize:appWin.resizePopoverByEle,
        swipeLeft:appWin.swipeLeft,
        swipeRight:appWin.swipeRight
    };
    
    uap.extend(uapFrame,uap.eventEmitter);
    
    
});
;/*

    author:jiaobingqian
    email:bingqian.jiao@3g2win.com
    description:封装ajax方法的offline离线缓存
    create:2015.08.03
    update:______/___author___

*/
;(function() {
    var requestAjax = uap.request.ajax;
    //默认缓存文件路径
    var baseFilePath ='wgt://offlinedata/';
    //默认缓存到LocalStorage数据信息的key
    var offlineKey = 'offlinedata';

    var readFile = uap.file.read;
    var readSecureFile = uap.file.readSecure;
    var writeFile = uap.file.write;
    var writeSecureFile = uap.file.writeSecure;

    /*
        offline缓存数据主函数
        @param Object opts 离线缓存的ajax请求的参数对象
    */
    function ajax(opts) {
        if (arguments.length === 1 && uap.isPlainObject(opts)) {
            var url;
            var expires;
            if(opts.data){
                var paramsInfo =JSON.stringify(opts.data);
                var fullUrl = opts.url + paramsInfo;
                url = uap.crypto.md5(fullUrl);
            }else{
                url = uap.crypto.md5(opts.url);
            }
            if(opts.expires && typeof(opts.expires) == 'number'){
                expires = parseInt(opts.expires) + parseInt(new Date().getTime());
            }else if(opts.expires && typeof(opts.expires) == 'string'){
                var result = setISO8601(opts.expires);
                expires = result;
            }else{
                expires = 0;
            }
            if (opts.offlineDataPath != undefined && typeof(opts.offlineDataPath) == 'string'){
                baseFilePath = opts.offlineDataPath;
            }
            //如果设置加密，未设置password,给默认password
            if(opts.crypto && !opts.password){
				alert("Must Set Password for AJAX if you open the switch of crypto!");
                return;
            }
            if (opts.offline != undefined) {
                var isOffline = opts.offline;

                if (isOffline === true) {
                    var offlinedata = uap.locStorage.val(offlineKey);
                    var dataObj = null;
                    if (offlinedata != null) {
                        dataObj = JSON.parse(offlinedata);
                        if (dataObj[url]) {
                            var urlData = dataObj[url];
                            var localFilePath = urlData.data?urlData.data:'';
                            var readFileParams ={
                                filePath:localFilePath,
                                length:-1,
                                callback:function(err,data,dataType,optId){
                                    if(err == null){
                                        var tempSucc = opts.success;
                                        if (typeof(tempSucc) == 'function') {
                                            if(typeof(data)=='string'&& opts.dataType &&opts.dataType.toLowerCase()=='json'){
                                                data=JSON.parse(data);
                                            }
                                            opts.success(data,"success",200,null,null);
                                        }
                                    }else{
                                        var tempSucc = opts.success;
                                        var tempError = opts.error;
                                        opts.success = function(res) {
                                            tempSucc.apply(this, arguments);
                                            setLocalStorage(url, res, expires, opts);
                                        };
                                        opts.error = function(res) {
                                            tempError.apply(this, arguments);
                                        };

                                        requestAjax(opts);
                                    }
                                }
                            };
                            if (urlData.timeout && urlData.now && urlData.data) {
                                var timeout = parseInt(urlData.now) + parseInt(urlData.timeout);
                                var now = new Date();
                                if(urlData.expires && (urlData.expires > now.getTime())){
                                   if(opts.crypto){
                                        readFileParams.key = opts.password;
                                        readSecureFile(readFileParams); 
                                   }else{
                                        readFile(readFileParams); 
                                   }
                                }
                                else if (timeout > now.getTime()) {
                                    if(opts.crypto){
                                        readFileParams.key = opts.password;
                                        readSecureFile(readFileParams); 
                                    }else{
                                        readFile(readFileParams); 
                                    }      
                                } else {
                                    var tempSucc = opts.success;
                                    var tempError = opts.error;
                                    opts.success = function(res) {
                                        tempSucc.apply(this, arguments);
                                        setLocalStorage(url, res, expires, opts);
                                    };
                                    opts.error = function(res) {
                                        tempError.apply(this, arguments);
                                    };
                                    requestAjax(opts);
                                }
                            } else if (urlData.data) {
                                if(urlData.expires){
                                    var now = new Date();
                                    if(urlData.expires > now.getTime()){
                                        if(opts.crypto){
                                            readFileParams.key = opts.password;
                                            readSecureFile(readFileParams); 
                                        }else{
                                            readFile(readFileParams); 
                                        }
                                    }else{
                                        var tempSucc = opts.success;
                                        var tempError = opts.error;
                                        opts.success = function(res) {
                                            tempSucc.apply(this, arguments);
                                            setLocalStorage(url, res, expires, opts);
                                        };
                                        opts.error = function(res) {
                                            tempError.apply(this, arguments);
                                        };
                                        requestAjax(opts);
                                    }
                                }else{
                                    if(opts.crypto){
                                        readFileParams.key = opts.password;
                                        readSecureFile(readFileParams); 
                                    }else{
                                        readFile(readFileParams); 
                                    } 
                                } 
                            } else {
                                var tempSucc = opts.success;
                                var tempError = opts.error;
                                opts.success = function(res) {
                                    tempSucc.apply(this, arguments);
                                    setLocalStorage(url, res, expires, opts);
                                };
                                opts.error = function(res) {
                                    tempError.apply(this, arguments);
                                };

                                requestAjax(opts);
                            }
                        } else {
                            var tempSucc = opts.success;
                            var tempError = opts.error;
                            opts.success = function(res) {
                                tempSucc.apply(this, arguments);
                                setLocalStorage(url, res, expires, opts);
                            };
                            opts.error = function(res) {
                                tempError.apply(this, arguments);
                            };
                            requestAjax(opts);
                        }
                    } else {
                        var tempSucc = opts.success;
                        var tempError = opts.error;
                        opts.success = function(res) {
                            tempSucc.apply(this, arguments);
                            setLocalStorage(url, res, expires, opts);
                        };
                        opts.error = function(res) {
                            tempError.apply(this, arguments);
                        };
                        requestAjax(opts);
                    }
                } else {
                    var tempSucc = opts.success;
                    var tempError = opts.error;
                    opts.success = function(res) {
                        tempSucc.apply(this, arguments);
                        setLocalStorage(url, res, expires, opts);
                    };
                    opts.error = function(res) {
                        tempError.apply(this, arguments);
                    };
                    requestAjax(opts);
                }
            } else {
                var tempSucc = opts.success;
                var tempError = opts.error;
                opts.success = function(res) {
                    tempSucc.apply(this, arguments);
                };
                opts.error = function(res) {
                    tempError.apply(this, arguments);
                };
                requestAjax(opts);
            }
        }
    }
    /*
        缓存ajax请求到的数据并写入文件
        @param String fileUrl 缓存的文件名
        @param String fileData 缓存的JSON格式字符串数据
        @param Number exp 缓存过期时间
        @param Object  opts 缓存ajax请求的参数对象
    */

    function setLocalStorage(fileUrl, fileData, exp, opts) {
        try {
            var filename = fileUrl;
            var localFilePath = baseFilePath + filename + '.txt';
            var saveData = {};
            if((typeof(fileData)=="object")&&(Object.prototype.toString.call(fileData).toLowerCase()=="[object object]")&&!fileData.length){
                fileData=JSON.stringify(fileData);    
            }
            var now = new Date().getTime();
            var data=fileData;
            writeFileParams ={
                filePath:localFilePath,
                content:fileData,
                callback:function(err){
                    if(err == null){
                        saveData['now'] = now;
                        saveData['data'] = localFilePath;
                        if (data.timeout) {
                            saveData.timeout= data.timeout;
                        }else if(typeof data == "string"){
                            try{
                               var parseData = JSON.parse(data);
                               if(parseData.timeout){
                                   saveData.timeout = parseData.timeout;
                               }
                            }catch(e){
                                //console.log(e);
                            }
                        }
                        if(exp > 0){
                            saveData['expires'] = exp;
                        }
                        var offdata = uap.locStorage.val(offlineKey) || '{}';
                        var offdataObj = JSON.parse(offdata);
                        offdataObj[filename] = saveData;
                        uap.locStorage.val(offlineKey, JSON.stringify(offdataObj)); 
                    }  
                }
            }
            if(opts.crypto){
                writeFileParams.key = opts.password;
                writeSecureFile(writeFileParams);
            }else{
                writeFile(writeFileParams);
            }
            
        } catch(e) {
            throw e;
        }
    }
    /*
    将符合IOS8601标准的日期格式转成对应毫秒
    @param String string 需要转换成对应毫秒的IOS8601格式的字符串
    */
    function setISO8601(string) {
        var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" + "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" + "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
        if (string) {
            try{
                var d = string.match(new RegExp(regexp));
                var offset = 0;
                var date = new Date(d[1], 0, 1);

                if (d[3]) {
                    date.setMonth(d[3] - 1);
                }
                if (d[5]) {
                    date.setDate(d[5]);
                }
                if (d[7]) {
                    date.setHours(d[7]);
                }
                if (d[8]) {
                    date.setMinutes(d[8]);
                }
                if (d[10]) {
                    date.setSeconds(d[10]);
                }
                if (d[12]) {
                    date.setMilliseconds(Number("0." + d[12]) * 1000);
                }
                if (d[14]) {
                    offset = (Number(d[16]) * 60) + Number(d[17]);
                    offset *= ((d[15] == '-') ? 1 : -1);
                }
                offset -= date.getTimezoneOffset();
                time = (Number(date) + (offset * 60 * 1000));
                return Number(time);
            }catch(e){
                return 0;
            }
            //this.setTime(Number(time));
        } else {
            return 0;
        }
    }
    /**
    *将日期转换成ISO8601格式字符串
    *@param Date d 需要被转换成IOS8601格式字符串的日期参数
    */
    function ISODateString(d) {
        function pad(n) {
            return n < 10 ? '0' + n : n
        }
        return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z'
    }

    uap.extend(uap.request, {
        ajax : ajax
    });
})();

uap.define('ajax', function($, exports, module){
    module.exports = uap.request.ajax;
});
;;
/*
    author:jiaobingqian
    email:bingqian.jiao@zymobi.com
    descript:构建uap download 模块
    created:2016.03.02
    update:____/____

*/
/*global uap,uexDownloaderMgr*/

uap && uap.define('download',function($,exports,module){

    /*
    获取操作 id
    */
    var getOptionId = uap.getOptionId;
    
    var createDownloaderQueue = {};//创建downloader对象的队列
    var downloadQueue = {};//下载对象的队列

    function processCreateDownloaderQueue(err,data,dataType,optId){
        var callback = null;
        if(createDownloaderQueue['create_call_'+optId]){
            callback = createDownloaderQueue['create_call_'+optId].cb;
        }else if(createDownloaderQueue.length == 1){
            callback = createDownloaderQueue[0].cb;
        }
        if(uap.isFunction(callback)){
            if(dataType == 2){
                callback(null,data,dataType,optId);
            }else{
                callback(new Error('create downloader error'),data,dataType,optId);
            }
        }

        //当调用一次后释放掉
        delete createDownloaderQueue['create_call_'+optId];
    }

    function processDownloadQueue(optId,fileSize,percent,status){

        var downloadCall = null;
        var successCall = null;
        var errorCall = null;
        var cancelCall = null;

        if(downloadQueue['download_call_'+optId]){
            downloadCall = downloadQueue['download_call_'+optId].downloadCall;
            successCall = downloadQueue['download_call_'+optId].successCall;
            errorCall = downloadQueue['download_call_'+optId].errorCall;
            cancelCall = downloadQueue['download_call_'+optId].cancelCall;
        }else if(downloadQueue.length == 1){
            downloadCall = downloadQueue[0].downloadCall;
            successCall = downloadQueue[0].successCall;
            errorCall = downloadQueue[0].errorCall;
            cancelCall = downloadQueue[0].cancelCall;
        }

        if(status == 0){//DownLoading
            downloadCall && uap.isFunction(downloadCall) &&  downloadCall(optId,fileSize,percent,status);
        }else if(status == 1) {// finish download 
            successCall && uap.isFunction(successCall)  && successCall(optId,fileSize,percent,status);
        }else if(status == 2) {// download error
            errorCall && uap.isFunction(errorCall)  && errorCall(optId,fileSize,percent,status);
        }else if(status == 3){// cancel download
            cancelCall && uap.isFunction(cancelCall)  && cancelCall(optId,fileSize,percent,status);
        }

        //当调用一次后释放掉
        //delete createDownloaderQueue['download_call_'+optId];
    }

    function createDownloader(optId,callback){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(optId)){
            argObj = optId;
            optId = argObj['optId'];
            callback = argObj['callback'];
        }
        optId = optId || getOptionId();
        callback = callback || function(){};
        
        if(uap.isFunction(callback)){
            createDownloaderQueue['create_call_'+optId] = {optId:optId,cb:callback};
            uexDownloaderMgr.cbCreateDownloader = function(optId,dataType,data){
                if(dataType != 2){
                    processCreateDownloaderQueue(new Error('create downloader error'),data,dataType,optId);
                    return;
                }
                processCreateDownloaderQueue(null,data,dataType,optId);
            }
        }
        
        uexDownloaderMgr.createDownloader(optId);
        return optId;
    }

    function closeDownloader(optId){
        if(arguments.length === 1 && uap.isPlainObject(optId)){
            optId = optId['optId'];
        }
        if(!optId) return;//throw new Error('optId is undefined');
        uexDownloaderMgr.closeDownloader(optId);
        delete downloadQueue['download_call_'+optId];
    }
    function setHeaders(optId,info){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(optId)){
            argObj = optId;
            optId = argObj['optId'];
            info = argObj['info'];
        }
        if(!optId) throw new Error('optId is undefined!');
        if(!uap.isPlainObject(info)) throw new Error('info is not json object!');
        uexDownloaderMgr.setHeaders && uexDownloaderMgr.setHeaders(optId,JSON.stringify(info));
    }
    function download(optId,url,savePath,breakPoint,downloadCall,successCall,errorCall,cancelCall){
        var argObj = null;
        if(arguments.length === 1 && uap.isPlainObject(optId)){
            argObj = optId;
            optId = argObj['optId'];
            url = argObj['url'];
            savePath = argObj['savePath'];
            breakPoint = argObj['breakPoint'];
        }
        optId = optId || getOptionId();
        if(!url) throw new Error('url is undefined!');
        if(!savePath) throw new Error('savePath is undefined!');
        breakPoint = parseInt(breakPoint,10);
        breakPoint = isNaN(breakPoint)?'0':breakPoint;

        downloadQueue['download_call_'+optId] = {
            optId:optId,
            downloadCall:downloadCall,
            successCall:successCall,
            errorCall:errorCall,
            cancelCall:cancelCall
        };
        //绑定下载状态通知函数
        uexDownloaderMgr.onStatus = processDownloadQueue; 
        uexDownloaderMgr.download(optId,url,savePath,breakPoint);
    }
    
    module.exports = {
        create: createDownloader,
        run: download,
        setHeaders: setHeaders,
        //cancel: cancelDownload,
        close: closeDownloader
    };

});

;/**
 *update:修改run方法扩展全局配置option到run对象/2016.01.29/jiaobingqian
 */
uap.define("icache", function($, exports, module) {
    var opid = 1000;
    var CACHE_PATH = "box://icache/";
    function iCache(option) {
        var self = this;
        uap.extend(this, uap.eventEmitter);
        self.waiting = [];
        self.running = [];
        self.option = $.extend({
            maxtask : 3
        }, option, true);
        uap.file.getRealPath("box://",function(err,data,dataType,optId){
            self.realpath = data;
            self.emit("NEXT_SESSION");
        });
        self.on("NEXT_SESSION", self._next);

    }


    iCache.prototype = {
        _progress : function(data, session) {
            if (session.progress) {
                session.progress(data, session);
            }
        },
        _success : function(fpath, session) {
            var self = this;
            self.off("DLS" + session.id);
            uap.download.close(session.dlId);
            if (session.success) {
                session.success(fpath, session);
            } else if (session.dom && session.dom.length) {
                switch(session.dom[0].tagName.toLowerCase()) {
                case "img":
                    session.dom.attr("src", fpath);
                    break;
                default:
                    session.dom.css("background-image", "url(file://" + fpath + ") !important");
                    break;
                }
            }
            var index = self.running.valueOf(session);
            index != undefined && self.running.splice(index, 1);
            self.emit("NEXT_SESSION");
        },
        _fail : function(session) {
            var self = this;
            self.off("DLS" + session.id);
            uap.download.close(session.dlId);
            var index = self.running.valueOf(session);
            index != undefined && self.running.splice(index, 1);
            if (session.fail) {
                session.fail(session);
            }
            self.emit("NEXT_SESSION");
        },
        _next : function() {
            var self = this;
            if (!self.realpath)
                return;
            if (self.running.length >= self.option.maxtask)
                return;
            var session = self.waiting.shift();
            if (!session)
                return;
            self.running.push(session);
            self._download(session);

        },
        _download : function(session) {
            var self = this;
            var fid = uap.crypto.md5(session.url);
            var fpath = self.realpath + "/icache/" + fid;
            self.on("DLS" + session.id, function(data) {
                switch(parseInt(data.status)) {
                case 0:
                    self._progress(data, session)
                    break;
                case 1:
                    self._success(fpath, session);
                    break;
                default:
                    self._fail(session);
                    break;
                }
            })
            self.once("FS" + session.id, function(data) {
                if (data) {
                    self._success(fpath, session);
                } else {
                    function downloadCB(optId, fileSize, percent, status) {
                        self.emit("DLS" + session.id, self,{
                            fileSize : fileSize,
                            percent : percent,
                            status : status
                        })
                    }
                    session.dlId = uap.download.create(null, function(err, data, dataType, optId) {
                        if (!err) {
                            session.header && uap.download.setHeaders(session.dlId, session.header);
                            uap.download.run(session.dlId, session.url, fpath, '0', downloadCB,downloadCB,downloadCB,downloadCB)
                        } else
                            downloadCB(optId, 0, 0, 4)
                    }); 
                }
            })
            
            
            uap.file.exists(fpath,function(err,data,dataType,optId){
                self.emit("FS" + session.id, self, data);
            })
        },
        run : function(option) {
            var self = this;
            var session = $.extend({
                id : ("" + (opid++)),
                status : 0
            }, option, true);
            self.waiting.push(session);
            self.emit("NEXT_SESSION");
        },
        clearcache:function(){
            uexFileMgr.deleteFileByPath(CACHE_PATH);
        }
    }

    module.exports = function(option) {
        return new iCache(option);
    };
});
;/*
    author:jiaobingqian
    email:bingqian.jiao@zymobi.com
    description:构建uap widget模块
    create:2015.11.26
    update:______/___author___

*/
/*global window,uap,uexWidget*/
window.uap && uap.define('widget',function($,exports,module){
    
    /*
    在当前widget加载一个子widget
    @param String appId 子widget的appId
    @param String animiId 子widget载入时的动画id:
        0：无动画
        1:从左向右推入
        2:从右向左推入
        3:从上向下推入
        4:从下向上推入
        5:淡入淡出
        6:左翻页
        7:右翻页
        8:水波纹
        9:由左向右切入
        10:由右向左切入
        11:由上先下切入
        12:由下向上切入

        13:由左向右切出
        14:由右向左切出
        15:由上向下切出
        16:由下向上切出
    @param String funName 方法名，子widget结束时将String型的任意字符回调给该方法，可为空。 注意：只在主窗口中有效，
    浮动窗口中无效
    @param String info 传给子widget的信息
    @param String animDuration 动画持续时长，单位为毫秒，默认200毫秒
    @param Function callback(err,data,dataType,opId) 回调函数
        err:Error对象，如果为空表示没有错误
        data:回调返回的数据，0-成功 1-失败
        dataType:回调返回的数据类型，默认为2：Int类型
        opId:操作ID，在此函数中不起作用，可忽略

     */
    function startWidget(appId,animId,funName,info,animDuration,callback) {
        var uexObj = null;
        if (arguments.length ===1 && uap.isPlainObject(appId)) {
            uexObj = appId;
            appId = uexObj['appId'];
            animId = uexObj['animId']||0;
            funName = uexObj['funName'];
            info = uexObj['info'];
            animDuration = uexObj['animDuration']||'';
            callback = uexObj['callback']||function(){};
        }
        if(!appId){
            return callback(new Error('appId is empty'));
        }
        animId = animId||0;
        animDuration = animDuration||'';
        callback = callback || function(){};
        
        if(animId){
            animId = parseInt(animId,10);
            if(isNaN(animId) || animId > 16 || animId < 0){
                animId = 0;
            }
        }
        if(animDuration){
            animDuration = parseInt(animDuration,10);
            animDuration = isNaN(animDuration)?'':animDuration;
        }
        uexWidget.cbStartWidget = function(opId,dataType,data){
            callback(null,data,dataType,opId);
        }
        uexWidget.startWidget(appId,animId,funName,info,animDuration);
    }
    /*
    退出一个widget
    @param String resultInfo 此widget结束时，传递给opener的信息
    @param String appId 要结束的widget的appId，为空时退出的是当前的widget
    @param Number isWgtBG 结束此widget的方式，0表示销毁该widget，下次再调 用startWidget时，重新打开；1表示把该widget置于
    后台，下次再调用startWidget时，不重新打开，操作数据 全部保存。不传或为空时，默认为0。注意传该参数时，必须要传appId参数。
     */
    function finishWidget(resultInfo,appId,isWgtBG) {
        var uexObj = null;
        if (arguments.length ===1 && uap.isPlainObject(resultInfo)) {
            uexObj = resultInfo;
            resultInfo = uexObj['resultInfo'];
            appId = uexObj['appId'];
            isWgtBG = uexObj['isWgtBG'];
        }
        if(resultInfo && appId && isWgtBG){
            uexWidget.finishWidget(resultInfo,appId,isWgtBG);
        }else if(resultInfo && appId){
            uexWidget.finishWidget(resultInfo,appId);
        }else{
            uexWidget.finishWidget(resultInfo);
        }

        
    }

    /*
    删除一个widget
    @param String appId  widget的appId，主widget不能被删除
    @param Function callback(err,data,dataType,opId) 回调函数
        err:Error对象，如果为空表示没有错误
        data:回调返回的数据，0-成功 1-失败
        dataType:回调返回的数据类型，默认为2：Int类型
        opId:操作ID，在此函数中不起作用，可忽略
     */
     function removeWidget(appId,callback) {
        var uexObj = null;
        if (arguments.length ===1 && uap.isPlainObject(appId)) {
            uexObj = appId;
            appId = uexObj['appId'];
            callback = uexObj['callback']||function(){};
        }
        uexWidget.cbRemoveWidget = function(opId,dataType,data){
            callback(null,data,dataType,opId);
        }

        uexWidget.removeWidget(appId);
    }
    /*
    检查当前widget是否有更新
    @param Function callback(err,data,dataType,opId) 回调函数
        err:Error对象，如果为空表示没有错误
        data:检查结果0- 需要更新 1- 不需要更新 2- 错误
        dataType:回调返回的数据类型，默认为2：Int类型
        opId:操作ID，在此函数中不起作用，可忽略
     */
    function checkUpdate(callback) {
        var uexObj = null;
        
        if (arguments.length === 1 && uap.isPlainObject(callback)) {
            callback = uexObj['callback']||function(){};
        }
        callback = callback || function(){};
        try{
            uexWidget.cbCheckUpdate = function(opId,dataType,data){
                var res = JSON.parse(data);
                var resData = res.result ||2;
                callback(null,resData,dataType,opId);
            }
        }catch(e){
            callback(new Error("检查失败！"));
        }
        uexWidget.checkUpdate();
    }
    /*
    根据相关信息启动一个第三方应用  IOS版
    @param String appInfo   第三方应用的URLSchemes
     */
    function loadApp(appInfo) {
        var uexObj = null;
        if (arguments.length ===1 && uap.isPlainObject(appInfo)) {
            uexObj = appInfo;
            appInfo = uexObj['appInfo'];
        }
        uexWidget.loadApp(appInfo);
    }
    /*
    根据相关信息启动一个第三方应用  Android版
    @param String startMode 启动方式，0表示通过包名和类名启动，1表示通过Action启动
    @param String optInfo   附加参数，键值对，{key:value}格式多个用英文”,”隔开
    startMode 为0时，如下
    @param String mainInfo  包名
    @param String addInfo   类名，为空时启动应用入口类
    startMode 为1时，如下
    @param String mainInfo  action
    @param String addInfo   category或data，json格式如下
    @param Function callback(info) 启动第三方应用的回调方法，该方法在未成功调用第三方应用时回调。
        info:(String)回调信息内容
    
     */
    function startApp(startMode,mainInfo,addInfo,optInfo,callback) {
        var uexObj = null;
        if (arguments.length ===1 && uap.isPlainObject(startMode)) {
            uexObj = startMode;
            startMode = uexObj["startMode"];
            mainInfo = uexObj['mainInfo'];
            addInfo = uexObj['addInfo'];
            optInfo = uexObj['optInfo'];
            callback = callback || function(){};
        }

        if(uap.isFunction(callback)){
            uexWidget.cbStartApp = function(info){
                callback(info);
            }
        }

        uexWidget.startApp(startMode,mainInfo,addInfo,optInfo);

    }

    /*
    获取打开者传入此widget的相关信息。即调用startWidget时传入的info参数值。
        @param Function callback(err,data,dataType,opId) 回调函数
            err:Error对象，如果为空表示没有错误
            data:返回的数据 本widget的打开者通过startWidget函数打开本widget时传入的info参数值
            dataType:回调返回的数据类型，默认为2：Int类型
            opId:操作ID，在此函数中不起作用，可忽略
     */
    function getOpenerInfo(callback) {
        if (arguments.length === 1 && uap.isPlainObject(callback)) {
            callback = callback['callback'];
        }
        if(!uap.isFunction(callback)){
            return;
        }

        uexWidget.cbGetOpenerInfo = function(opId,dataType,data){
            callback(null,data,dataType,opId);
        };

        uexWidget.getOpenerInfo();
    }
    /*
    根据安装包所在路径安装一个apk(Android方法)
    @param String appPath  apk所在路径
     */
    function installApp(appPath) {
        var uexObj = null;
        if (arguments.length ===1 && uap.isPlainObject(appPath)) {
            uexObj = appPath;
            appPath = uexObj['appPath'];
        }
        uexWidget.installApp(appPath);
    }

    /*
    获取推送消息,上报消息到管理后台
    @param Function callback(err,data,dataType,opId) 回调函数
            err:Error对象，如果为空表示没有错误
            data:返回的数据 ,json格式字符串
            dataType:回调返回的数据类型，默认为2：Int类型
            opId:操作ID，在此函数中不起作用，可忽略
     */
    function  getPushInfo(callback) {
        var uexObj = null;
        if (arguments.length === 1 && uap.isPlainObject(callback)) {
            callback = uexObj['callback'];
        }
        if (!uap.isFunction(callback)) {
            return;
        }
        uexWidget.cbGetPushInfo = function(opId,dataType,data){
            callback(null,data,dataType,opId);
        };
        uexWidget.getPushInfo();
    }

    /*
    如果应用开启了推送功能，那么当有消息推送进来时，平台将调用指定的cbFunction函数通知页面。
    @param String cbFunction 回调函数方法名
     */
    function setPushNotifyCallback(cbFunction) {
        if (arguments.length === 1 && uap.isPlainObject(cbFunction)) {
            cbFunction = cbFunction['cbFunction'];
        }

        uexWidget.setPushNotifyCallback(cbFunction);
    }

    /*
    设置推送用户信息
    @param String uId 用户ID
    @param String uNickName 用户昵称
     */
    function setPushInfo(uId,uNickName) {
        var uexObj = null;
        if (arguments.length ===1 && uap.isPlainObject(uId)) {
            uexObj = uId;
            uId = uexObj['uId'];
            uNickName = uexObj['uNickName'];
        }
        uexWidget.setPushInfo(uId,uNickName);
    }

    /*
    设置推送服务的状态
    @param Number state 推送服务状态0-关闭 1-开启
     */
     function setPushState(state) {
        var uexObj = null;
        if (arguments.length === 1 && uap.isPlainObject(state)) {
            uexObj = state;
            state = uexObj['state'];
        }
        state = parseInt(state,10);
        state = isNaN(state)?0:state;
        state = state!=0?1:state;

        uexWidget.setPushState(state);

     }

     /*
     获取推送服务的状态
     @param Function callback(err,data,dataType,opId) 回调函数
        err:Error对象，如果为空表示没有错误
        data:0-关闭 1-开启
        dataType:参数类型，默认为2,Number类型
        opId:操作ID，在此函数中不起作用，可忽略
      */

     function getPushState(callback){
        var uexObj = null;
        if (arguments.length === 1 && uap.isPlainObject(callback)) {
            callback = uexObj['callback'];
        }
        if (!uap.isFunction(callback)) {
            return;
        }
        uexWidget.cbGetPushState = function (opId,dataType,data){
            callback(null,data,dataType,opId);
        }

        uexWidget.getPushState();

     }

     /*
     是否安装某第三方应用
     @param String appData 
     @param Function callback(err,data,dataType,opId) 回调函数
        err:Error对象，如果为空表示没有错误
        data:返回结果：0-已安装；1-未安装。
        dataType:参数类型，默认为2,Number类型
        opId:操作ID，在此函数中不起作用，可忽略
      */
     function isAppInstalled(appData,callback) {
        var uexObj = {};
        var res = null;
        if(arguments.length === 1 && uap.isPlainObject(appData)){
            uexObj = appData;
            appData = uexObj["appData"];
            callback = uexObj["callback"];
        }

        if(!uap.isFunction(callback)){
            return ;
        }

        uexWidget.cbIsAppInstalled = function(data){
            try{
                var res = JSON.parse(data);
                callback(null,res.installed,2);
            }catch(e){
                callback(new Error('error'));
            }
        };

        var param = {};
        param.appData = appData;
        param = JSON.stringify(param);

        uexWidget.isAppInstalled(param);

    }
    
    var loadByOtherAppCallQueue = [];
    function processLoadByOtherAppCallQueue(jsonData){
         $.each(loadByOtherAppCallQueue,function(i,v){
            if(uap.isFunction(v)){
                v(jsonData);
            }
        })
        
     }
     /*
        默认被第三方应用调起事件
    */
    
    function defaultLoadByOtherApp(){
        var tmpLoadByOtherAppCall = null;
        if(uap.widget.onLoadByOtherApp){
            tmpLoadByOtherAppCall = uap.widget.onLoadByOtherApp;
        }
        uapWidget.emit('loadByOtherApp');
        tmpLoadByOtherAppCall && tmpLoadByOtherAppCall();
    }
        /*
        被第三方应用调起的监听方法;所有的监听方法都得在root页面进行监听
        @param function callback回调函数
         */
     function onLoadByOtherApp(callback) {
        if (arguments.length ===1 && uap.isPlainObject(callback)) {
            callback = callback['callback'];
        }
        
        loadByOtherAppCallQueue.push(callback);
        uexWidget.onLoadByOtherApp = function(data){
            processLoadByOtherAppCallQueue(data);
        }
        return;
     }
        
     var suspendCallQueue = [];
     function processSuspendCallQueue(){
         $.each(suspendCallQueue,function(i,v){
            if(uap.isFunction(v)){
                v();
            }
        })
     }
     /*
        默认程序挂起事件
    */
    
    function defaultSuspend(){
        var tmpSuspendCall = null;
        if(uap.widget.onSuspend){
            tmpSuspendCall = uap.widget.onSuspend;
        }
        uapWidget.emit('suspend');
        tmpSuspendCall && tmpSuspendCall();
    }
     /*
     程序挂起的监听方法
     无参数
      */
     function onSuspend(callback) {
        if(!uap.isFunction(callback)){
            return;
        }
        suspendCallQueue.push(callback);
        uexWidget.onSuspend = processSuspendCallQueue;
        return;
     }


     var resumeCallQueue = [];
     function processResumeCallQueue(){
         $.each(resumeCallQueue,function(i,v){
            if(uap.isFunction(v)){
                v();
            }
        })
     }
     /*
        默认状态改变事件
    */
    
    function defaultResume(){
        var tmpResumeCall = null;
        if(uap.widget.onResume){
            tmpResumeCall = uap.widget.onResume;
        }
        uapWidget.emit('resume');
        tmpResumeCall && tmpResumeCall();
        
        
    }
     /*
     程序恢复的监听方法
     无参数
      */
     function onResume(callback) {
        if(!uap.isFunction(callback)){
            return;
        }
        resumeCallQueue.push(callback);
        uexWidget.onResume = processResumeCallQueue;
        return;
     }
     //默认绑定状态
     uap.ready(function(){
        //绑定默认状态改变事件
        //onLoadByOtherApp(defaultLoadByOtherApp);
        //绑定默认swipe事件
        onSuspend(defaultSuspend);
        //绑定默认swipe事件
        onResume(defaultResume);
     });
    //导出接口
    var uapWidget = module.exports = {
        startWidget:startWidget,
        finishWidget:finishWidget,
        removeWidget:removeWidget,
        checkUpdate:checkUpdate,
        loadApp:loadApp,
        startApp:startApp,
        getOpenerInfo:getOpenerInfo,
        installApp:installApp,
        getPushInfo:getPushInfo,
        setPushNotifyCallback:setPushNotifyCallback,
        setPushInfo:setPushInfo,
        setPushState:setPushState,
        getPushState:getPushState,
        isAppInstalled:isAppInstalled,
        //loadByOtherApp:onLoadByOtherApp,
        suspend:onSuspend,
        resume:onResume 
    };
    
    uap.extend(uapWidget,uap.eventEmitter);

});;/*
    author:zhujinwang
    email:jinwang.zhu@zymobi.com
    description:构建uap widget模块
    create:2015.12.07
    update:2015.12.08/jiaobingqian

*/
/*global window,uap,uexWidgetOne*/
uap.define('widgetOne', function($, exports, module) {
    /*
    获取平台信息,回调中返回获取结果
    @ param Function callback(err,data,dataType,opId)回调方法
        err：当出现错误的时候error，否则为空
        data：返回当前手机平台的类型，0：IOS；1：Android；2：Chrome
        dataType: 返回数据类型，此方法未2，Number类型
        opId:操作ID，在此函数中不起作用，可忽略
     */
    function getPlatform(callback) {
        if (arguments.length === 1 && uap.isPlainObject(callback)) {
            callback = callback['callback'];
        }
        if (!uap.isFunction(callback)) return;

        try {
            uexWidgetOne.cbGetPlatform = function(opId, dataType, data) {
                callback(null, data, dataType, opId);
            }
            uexWidgetOne.getPlatform();
        } catch (e) {
            callback(e);
        }
    }

    /*
        获取系统名称
    */
    function getPlatformName() {
        return uexWidgetOne.platformName;
    }
    /*
        获取系统版本
    */
    function getPlatformVersion() {
        return uexWidgetOne.platformVersion;
    }

    /*
        获取是否为ios7风格
    */
    function isIOS7Style() {
        return uexWidgetOne.iOS7Style || 0;
    }

    /*
        判断是否全屏
    */
    function isFullScreen() {
        return uexWidgetOne.isFullScreen;
    }

    /*
        退出,0不弹否则弹提示框
        @param Number flag：Number类型, 是否弹出关闭提示框，0-不弹，否则弹提示框;如果flag不是number类型则默认flag为0
    */
    function exit(flag) {
        if (arguments.length === 1 && uap.isPlainObject(flag)) {
            flag = flag['flag'];
        }
        //flag是number类型
        flag = isNaN(flag) ? 0 : flag;
        uexWidgetOne.exit(flag);
    }


    /*
    获取当前widget的信息
    @param Function callback(err,data,dataType,opId) 回调方法
        err：当出现错误的时候error，否则为空
        data:返回当前widget相关信息，json数据字符串格式
        dataType:返回数据类型，此方法中正常为1：JSON字符串类型
        opId:操作ID，在此函数中不起作用，可忽略
     */

    function getCurrentWidgetInfo(callback) {
        if (arguments.length === 1 && uap.isPlainObject(callback)) {
            callback = callback['callback'];
        }
        if (!uap.isFunction(callback)) return;
        try {
            uexWidgetOne.cbGetCurrentWidgetInfo = function(opId, dataType, data) {
                callback(null, data, dataType, opId);
            }
            uexWidgetOne.getCurrentWidgetInfo();
        } catch (e) {
            callback(e);
        }
    }

    /*
    清除当前应用的缓存，仅主widget调用此接口有效。
    @param Function callback(err,data,dataType,opId) 回调方法
        err:当出现错误的时候error，否则为空
        data:返回清除缓存结果；0：成功；1：失败
        dataType:回调返回数据类型，此处为2：Number
        opId:操作ID，在此函数中不起作用，可忽略
     */
    function cleanCache(callback) {
        if (arguments.length === 1 && uap.isPlainObject(callback)) {
            callback = callback['callback'];
        }
        if (!uap.isFunction(callback)) return;
        try {
            uexWidgetOne.cbCleanCache = function(opId, dataType, data) {
                callback(null, data, dataType, opId);
            }
            uexWidgetOne.cleanCache();
        } catch (e) {
            callback(e);
        }
    }

    /*
    获取主widget的appId
    @param function(err,data,dataType,opId) callback回调方法
        err：当出现错误的时候error，否则为空
        data：返回主widget的appId
        dataType:返回数据的格式，此处为0:text文本格式
        opId: 操作ID，在此函数中不起作用，可忽略
     */
    function getMainWidgetId(callback) {
        if (arguments.length === 1 && uap.isPlainObject(callback)) {
            callback = callback['callback'];
        }
        if (!uap.isFunction(callback)) return;
        try {
            uexWidgetOne.cbGetMainWidgetId = function(opId, dataType, data) {
                callback(null, data, dataType, opId);
            }
            uexWidgetOne.getMainWidgetId();
        }catch(e){
            callback(e);
        }
    }

    var uapWidgetOne = module.exports = {
        getPlatform: getPlatform,
        getPlatformName: getPlatformName,
        getPlatformVersion: getPlatformVersion,
        isIOS7Style: isIOS7Style,
        isFullScreen: isFullScreen,
        exit: exit,
        getCurrentWidgetInfo: getCurrentWidgetInfo,
        cleanCache: cleanCache,
        getMainWidgetId: getMainWidgetId
    };

    //uap.extend(uapWidgetOne, uap.eventEmitter);
});;
;/*!
 * An jQuery | zepto plugin for lazy loading images.
 * author -> jieyou
 * see https://github.com/jieyou/lazyload
 * use some tuupola's code https://github.com/tuupola/jquery_lazyload (BSD)
 * use component's throttle https://github.com/component/throttle (MIT)
 * use uap.icache
 */
;(function(factory){
    if(typeof define === 'function' && define.amd){ // AMD
        // you may need to change `define([------>'jquery'<------], factory)` 
        // if you use zepto, change it rely name, such as `define(['zepto'], factory)`
        define(['jquery'], factory)
        // define(['zepto'], factory)
    }else{ // Global
        factory(window.jQuery || window.Zepto)
    }
})(function($,undefined){
    var w = window,
        $window = $(w),
        defaultOptions = {
            threshold                   : 0,
            failure_limit               : 0,
            event                       : 'scroll',
            effect                      : 'show',
            effect_params               : null,
            container                   : w,
            data_attribute              : 'original',
            data_srcset_attribute       : 'original-srcset',
            skip_invisible              : true,
            appear                      : emptyFn,
            load                        : emptyFn,
            vertical_only               : false,
            check_appear_throttle_time  : 300,
            url_rewriter_fn             : emptyFn,
            no_fake_img_loader          : false,
            placeholder_data_img        : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC',
            // for IE6\7 that does not support data image
            placeholder_real_img        : 'http://ditu.baidu.cn/yyfm/lazyload/0.0.1/img/placeholder.png'
            // todo : 将某些属性用global来配置，而不是每次在$(selector).lazyload({})内配置
        },
        type; // function

    uap.ready(function(){
        if(!window.lazyICache && !window.isWeb)
        {
            window.lazyICache = uap.icache({maxtask:1});
        }
    })

    function emptyFn(){}
    type = (function(){
        var object_prototype_toString = Object.prototype.toString
        return function(obj){
            // todo: compare the speeds of replace string twice or replace a regExp
            return object_prototype_toString.call(obj).replace('[object ','').replace(']','')
        }
    })()

    function lazyLoadImage(url, dom, sus) {
        if(window.lazyICache && !window.isWeb)
        {
           window.lazyICache.run({url:url,success:(sus?sus:''),dom:dom});
        }
    }
    
    function belowthefold($element, options){
        var fold
        if(options._$container == $window){
            fold = ('innerHeight' in w ? w.innerHeight : $window.height()) + $window.scrollTop()
        }else{
            fold = options._$container.offset().top + options._$container.height()
        }
        return fold <= $element.offset().top - options.threshold
    }

    function rightoffold($element, options){
        var fold
        if(options._$container == $window){
            // Zepto do not support `$window.scrollLeft()` yet.
            fold = $window.width() + ($.fn.scrollLeft?$window.scrollLeft():w.pageXOffset)
        }else{
            fold = options._$container.offset().left + options._$container.width()
        }
        return fold <= $element.offset().left - options.threshold
    }

    function abovethetop($element, options){
        var fold
        if(options._$container == $window){
            fold = $window.scrollTop()
        }else{
            fold = options._$container.offset().top
        }
        // console.log('abovethetop fold '+ fold)
        // console.log('abovethetop $element.height() '+ $element.height())
        return fold >= $element.offset().top + options.threshold  + $element.height()
    }

    function leftofbegin($element, options){
        var fold
        if(options._$container == $window){
            // Zepto do not support `$window.scrollLeft()` yet.
            fold = $.fn.scrollLeft?$window.scrollLeft():w.pageXOffset
        }else{
            fold = options._$container.offset().left
        }
        return fold >= $element.offset().left + options.threshold + $element.width()
    }

    function checkAppear($elements, options){
        var counter = 0
        $elements.each(function(i,e){
            var $element = $elements.eq(i)
            if(($element.width() <= 0 && $element.height() <= 0) || $element.css('display') === 'none'){
                return
            }
            function appear(){
                $element.trigger('_lazyload_appear')
                // if we found an image we'll load, reset the counter 
                counter = 0
            }
            // If vertical_only is set to true, only check the vertical to decide appear or not
            // In most situations, page can only scroll vertically, set vertical_only to true will improve performance
            if(options.vertical_only){
                if(abovethetop($element, options)){
                    // Nothing. 
                }else if(!belowthefold($element, options)){
                    appear()
                }else{
                    if(++counter > options.failure_limit){
                        return false
                    }
                }
            }else{
                if(abovethetop($element, options) || leftofbegin($element, options)){
                    // Nothing. 
                }else if(!belowthefold($element, options) && !rightoffold($element, options)){
                    appear()
                }else{
                    if(++counter > options.failure_limit){
                        return false
                    }
                }
            }
        })
    }

    // Remove image from array so it is not looped next time. 
    function getUnloadElements($elements){
        return $elements.filter(function(i,e){
            return !$elements.eq(i)._lazyload_loadStarted
        })
    }

    // throttle : https://github.com/component/throttle , MIT License
    function throttle (func, wait) {
        var ctx, args, rtn, timeoutID // caching
        var last = 0

        return function throttled () {
            ctx = this
            args = arguments
            var delta = new Date() - last
            if (!timeoutID)
                if (delta >= wait) call()
                else timeoutID = setTimeout(call, wait - delta)
            return rtn
        }

        function call () {
            timeoutID = 0
            last = +new Date()
            rtn = func.apply(ctx, args)
            ctx = null
            args = null
        }
    }

    if(!$.fn.hasOwnProperty('lazyload')){

        $.fn.lazyload = function(options){
            var $elements = this,
                isScrollEvent,
                isScrollTypeEvent,
                throttleCheckAppear

            if(!$.isPlainObject(options)){
                options = {}
            }

            $.each(defaultOptions,function(k,v){
                if($.inArray(k,['threshold','failure_limit','check_appear_throttle_time']) != -1){ // these params can be a string
                    if(type(options[k]) == 'String'){
                        options[k] = parseInt(options[k],10)
                    }else{
                        options[k] = v
                    }
                }else if(k == 'container'){ // options.container can be a seletor string \ dom \ jQuery object
                    if(options.hasOwnProperty(k)){   
                        if(options[k] == w || options[k] == document){
                            options._$container = $window
                        }else{
                            options._$container = $(options[k])
                        }
                    }else{
                        options._$container = $window
                    }
                    delete options.container
                }else if(defaultOptions.hasOwnProperty(k) && (!options.hasOwnProperty(k) || (type(options[k]) != type(defaultOptions[k])))){
                    options[k] = v
                }
            })

            isScrollEvent = options.event == 'scroll'
            throttleCheckAppear = options.check_appear_throttle_time == 0?
                checkAppear
                :throttle(checkAppear,options.check_appear_throttle_time)

            // isScrollTypeEvent cantains custom scrollEvent . Such as 'scrollstart' & 'scrollstop'
            // https://github.com/search?utf8=%E2%9C%93&q=scrollstart
            isScrollTypeEvent = isScrollEvent || options.event == 'scrollstart' || options.event == 'scrollstop'

            $elements.each(function(i,e){
                var element = this,
                    $element = $elements.eq(i),
                    placeholderSrc = $element.attr('src'),
                    originalSrcInAttr = $element.attr('data-'+options.data_attribute), // `data-original` attribute value
                    originalSrc = options.url_rewriter_fn == emptyFn?
                        originalSrcInAttr:
                        options.url_rewriter_fn.call(element,$element,originalSrcInAttr),
                    originalSrcset = $element.attr('data-'+options.data_srcset_attribute),
                    isImg = $element.is('img')

                if($element._lazyload_loadStarted == true || placeholderSrc == originalSrc){
                    $element._lazyload_loadStarted = true
                    $elements = getUnloadElements($elements)
                    return
                }

                $element._lazyload_loadStarted = false

                // If element is an img and no src attribute given, use placeholder. 
                if(isImg && !placeholderSrc){
                    // For browsers that do not support data image.
                    $element.one('error',function(){ // `on` -> `one` : IE6 triggered twice error event sometimes
                        $element.attr('src',options.placeholder_real_img)
                    }).attr('src',options.placeholder_data_img)
                }
                
                // When appear is triggered load original image. 
                $element.one('_lazyload_appear',function(){
                    var effectParamsIsArray = $.isArray(options.effect_params),
                        effectIsNotImmediacyShow
                    function loadFunc(){
                        // In most situations, the effect is immediacy show, at this time there is no need to hide element first
                        // Hide this element may cause css reflow, call it as less as possible
                        if(effectIsNotImmediacyShow){
                            // todo: opacity:0 for fadeIn effect
                            $element.hide()
                        }
                        if(isImg){
                            // attr srcset first
                            if(originalSrcset){
                                if(options.cache)
                                    lazyLoadImage(originalSrcset,$element);
                                else
                                    $element.attr('srcset', originalSrcset)
                            }
                            if(originalSrc){
                                if(options.cache)
                                    lazyLoadImage(originalSrc,$element);
                                else
                                    $element.attr('src', originalSrc)
                            }
                        }else{
                            if(options.cache)
                                lazyLoadImage(originalSrc,$element);
                            else
                                $element.css('background-image','url("' + originalSrc + '")')
                        }
                        if(effectIsNotImmediacyShow){
                            $element[options.effect].apply($element,effectParamsIsArray?options.effect_params:[])
                        }
                        $elements = getUnloadElements($elements)
                    }
                    if(!$element._lazyload_loadStarted){
                        effectIsNotImmediacyShow = (options.effect != 'show' && $.fn[options.effect] && (!options.effect_params || (effectParamsIsArray && options.effect_params.length == 0)))
                        if(options.appear != emptyFn){
                            options.appear.call(element, $element, $elements.length, options)
                        }
                        $element._lazyload_loadStarted = true
                        if(options.no_fake_img_loader || originalSrcset){
                            if(options.load != emptyFn){
                                $element.one('load',function(){
                                    options.load.call(element, $element, $elements.length, options)
                                })
                            }
                            loadFunc()
                        }else{
                            $('<img />').one('load', function(){ // `on` -> `one` : IE6 triggered twice load event sometimes
                                loadFunc()
                                if(options.load != emptyFn){
                                    options.load.call(element, $element, $elements.length, options)
                                }
                            }).attr('src',originalSrc)
                        }
                    }
                })

                // When wanted event is triggered load original image 
                // by triggering appear.                              
                if (!isScrollTypeEvent){
                    $element.on(options.event, function(){
                        if (!$element._lazyload_loadStarted){
                            $element.trigger('_lazyload_appear')
                        }
                    })
                }
            })

            // Fire one scroll event per scroll. Not one scroll event per image. 
            if(isScrollTypeEvent){
                options._$container.on(options.event, function(){
                    throttleCheckAppear($elements, options)
                    if(window.lazyLoadTimeout){
                        clearTimeout(window.lazyLoadTimeout)
                        window.lazyLoadTimeout = null;
                    }
                    window.lazyLoadTimeout = setTimeout(function(){
                       throttleCheckAppear($elements, options)
                    },1200)
                })
            }

            // Check if something appears when window is resized. 
            // Force initial check if images should appear when window is onload. 
            $window.on('resize load', function(){
                throttleCheckAppear($elements, options)
            })

            // Force initial check if images should appear. 
            $(function(){
                throttleCheckAppear($elements, options)
            })
            
            return this
        }
    }
});//mvc模式处理request请求的锁定问题
;(function() {
    'use strict';
    var Service = Backbone.Service = function(options) {
        options || ( options = {});
        this.cid = _.uniqueId('service');
        //if (options.ajaxCall)
        _.extend(this, options);
        this.ajaxCall = options.ajaxCall;
        this.initialize.apply(this, arguments);
        this.lock={};
    };
    _.extend(Service.prototype, Backbone.Events, {
        /**
         *获取请求锁
         * @param {Object} string
         */
        initialize : function() {
        },
        getLockKey : function(string) {
            if (string) {
                //有option对象，把它变成字符串
                string = encodeURI(string);
                //有时候string可能有特殊字符，所以变化转换下，避免md5异常
                var md5 = uap.crypto.md5(string);
                return md5;
            }
        },
        /**
         *封装的请求，可以写入header等通用的信息
         * @param {Object} data
         * @param {Object} options
         */
        _wrap : function(data, options, lockKey) {
            var self = this;
            var success = options.success;
            options.success = function(data) {
                delete self.lock[lockKey];
                if (success)
                    success(data);
            }
            var error = options.error;
            options.error = function(data) {
                delete self.lock[lockKey];
                if (error)
                    error(data);
            }
        },
        request : function(data, options) {
            var self = this;
            var lockKey = self.getLockKey(JSON.stringify(data));
            self._wrap(data, options, lockKey);
            if (self.lock[lockKey]) {
                //如果锁定请求的话，不再提交
                self.trigger("error", "Request alreay running. Please wait");
                options.error({status:-100000,msg:"Request alreay running. Please wait"});
                return;
            }
            //加请求锁
            self.lock[lockKey] = true;
            if (this.ajaxCall)
                this.ajaxCall(data, options);
        }
    });
    Service.extend = Backbone.Model.extend;
})();

// Backbone.Epoxy

// (c) 2015 Greg MacWilliam
// Freely distributed under the MIT license
// For usage and documentation:
// http://epoxyjs.org

(function(root, factory) {

  if (typeof exports !== 'undefined') {
    // Define as CommonJS export:
    module.exports = factory(require("underscore"), require("backbone"));
  } else if (typeof define === 'function' && define.amd) {
    // Define as AMD:
    define(["underscore", "backbone"], factory);
  } else {
    // Just run it:
    factory(root._, root.Backbone);
  }

}(this, function(_, Backbone) {

  // Epoxy namespace:
  var Epoxy = Backbone.Epoxy = {};

  // Object-type utils:
  var array = Array.prototype;
  var isUndefined = _.isUndefined;
  var isFunction = _.isFunction;
  var isObject = _.isObject;
  var isArray = _.isArray;
  var isModel = function(obj) { return obj instanceof Backbone.NestedModel; };
  var isCollection = function(obj) { return obj instanceof Backbone.Collection; };
  var blankMethod = function() {};

  // Static mixins API:
  // added as a static member to Epoxy class objects (Model & View);
  // generates a set of class attributes for mixin with other objects.
  var mixins = {
    mixin: function(extend) {
      extend = extend || {};

      for (var i in this.prototype) {
        // Skip override on pre-defined binding declarations:
        if (i === 'bindings' && extend.bindings) continue;

        // Assimilate non-constructor Epoxy prototype properties onto extended object:
        if (this.prototype.hasOwnProperty(i) && i !== 'constructor') {
          extend[i] = this.prototype[i];
        }
      }
      return extend;
    }
  };

  // Calls method implementations of a super-class object:
  function _super(instance, method, args) {
    return instance._super.prototype[method].apply(instance, args);
  }

  // Epoxy.Model
  // -----------
  var modelMap;
  var modelProps = ['computeds'];

  Epoxy.Model = Backbone.NestedModel.extend({
    _super: Backbone.NestedModel,

    // Backbone.Model constructor override:
    // configures computed model attributes around the underlying native Backbone model.
    constructor: function(attributes, options) {
      _.extend(this, _.pick(options||{}, modelProps));
      _super(this, 'constructor', arguments);
      this.initComputeds(this.attributes, options);
    },

    // Gets a copy of a model attribute value:
    // Array and Object values will return a shallow copy,
    // primitive values will be returned directly.
    getCopy: function(attribute) {
      return _.clone(this.get(attribute));
    },

    // Backbone.Model.get() override:
    // provides access to computed attributes,
    // and maps computed dependency references while establishing bindings.
    get: function(attribute) {

      // Automatically register bindings while building out computed dependency graphs:
      modelMap && modelMap.push(['change:'+attribute, this]);

      // Return a computed property value, if available:
      if (this.hasComputed(attribute)) {
        return this.c()[ attribute ].get();
      }

      // Default to native Backbone.Model get operation:
      return _super(this, 'get', arguments);
    },

    // Backbone.Model.set() override:
    // will process any computed attribute setters,
    // and then pass along all results to the underlying model.
    set: function(key, value, options) {
      var params = key;

      // Convert key/value arguments into {key:value} format:
      if (params && !isObject(params)) {
        params = {};
        params[ key ] = value;
      } else {
        options = value;
      }

      // Default options definition:
      options = options || {};

      // Create store for capturing computed change events:
      var computedEvents = this._setting = [];

      // Attempt to set computed attributes while not unsetting:
      if (!options.unset) {
        // All param properties are tested against computed setters,
        // properties set to computeds will be removed from the params table.
        // Optionally, an computed setter may return key/value pairs to be merged into the set.
        params = deepModelSet(this, params, {}, []);
      }

      // Remove computed change events store:
      delete this._setting;

      // Pass all resulting set params along to the underlying Backbone Model.
      var result = _super(this, 'set', [params, options]);

      // Dispatch all outstanding computed events:
      if (!options.silent) {
        // Make sure computeds get a "change" event:
        if (!this.hasChanged() && computedEvents.length) {
          this.trigger('change', this);
        }

        // Trigger each individual computed attribute change:
        // NOTE: computeds now officially fire AFTER basic "change"...
        // We can't really fire them earlier without duplicating the Backbone "set" method here.
        _.each(computedEvents, function(evt) {
          this.trigger.apply(this, evt);
        }, this);
      }
      return result;
    },

    // Backbone.Model.toJSON() override:
    // adds a 'computed' option, specifying to include computed attributes.
    toJSON: function(options) {
      var json = _super(this, 'toJSON', arguments);

      if (options && options.computed) {
        _.each(this.c(), function(computed, attribute) {
          json[ attribute ] = computed.value;
        });
      }

      return json;
    },

    // Backbone.Model.destroy() override:
    // clears all computed attributes before destroying.
    destroy: function() {
      this.clearComputeds();
      return _super(this, 'destroy', arguments);
    },

    // Computed namespace manager:
    // Allows the model to operate as a mixin.
    c: function() {
      return this._c || (this._c = {});
    },

    // Initializes the Epoxy model:
    // called automatically by the native constructor,
    // or may be called manually when adding Epoxy as a mixin.
    initComputeds: function(attributes, options) {
      this.clearComputeds();

      // Resolve computeds hash, and extend it with any preset attribute keys:
      // TODO: write test.
      var computeds = _.result(this, 'computeds')||{};
      computeds = _.extend(computeds, _.pick(attributes||{}, _.keys(computeds)));

      // Add all computed attributes:
      _.each(computeds, function(params, attribute) {
        params._init = 1;
        this.addComputed(attribute, params);
      }, this);

      // Initialize all computed attributes:
      // all presets have been constructed and may reference each other now.
      _.invoke(this.c(), 'init');
    },

    // Adds a computed attribute to the model:
    // computed attribute will assemble and return customized values.
    // @param attribute (string)
    // @param getter (function) OR params (object)
    // @param [setter (function)]
    // @param [dependencies ...]
    addComputed: function(attribute, getter, setter) {
      this.removeComputed(attribute);

      var params = getter;
      var delayInit = params._init;

      // Test if getter and/or setter are provided:
      if (isFunction(getter)) {
        var depsIndex = 2;

        // Add getter param:
        params = {};
        params._get = getter;

        // Test for setter param:
        if (isFunction(setter)) {
          params._set = setter;
          depsIndex++;
        }

        // Collect all additional arguments as dependency definitions:
        params.deps = array.slice.call(arguments, depsIndex);
      }

      // Create a new computed attribute:
      this.c()[ attribute ] = new EpoxyComputedModel(this, attribute, params, delayInit);
      return this;
    },

    // Tests the model for a computed attribute definition:
    hasComputed: function(attribute) {
      return this.c().hasOwnProperty(attribute);
    },

    // Removes an computed attribute from the model:
    removeComputed: function(attribute) {
      if (this.hasComputed(attribute)) {
        this.c()[ attribute ].dispose();
        delete this.c()[ attribute ];
      }
      return this;
    },

    // Removes all computed attributes:
    clearComputeds: function() {
      for (var attribute in this.c()) {
        this.removeComputed(attribute);
      }
      return this;
    },

    // Internal array value modifier:
    // performs array ops on a stored array value, then fires change.
    // No action is taken if the specified attribute value is not an array.
    modifyArray: function(attribute, method, options) {
      var obj = this.get(attribute);

      if (isArray(obj) && isFunction(array[method])) {
        var args = array.slice.call(arguments, 2);
        var result = array[ method ].apply(obj, args);
        options = options || {};

        if (!options.silent) {
          this.trigger('change:'+attribute+' change', this, array, options);
        }
        return result;
      }
      return null;
    },

    // Internal object value modifier:
    // sets new property values on a stored object value, then fires change.
    // No action is taken if the specified attribute value is not an object.
    modifyObject: function(attribute, property, value, options) {
      var obj = this.get(attribute);
      var change = false;

      // If property is Object:
      if (isObject(obj)) {

        options = options || {};

        // Delete existing property in response to undefined values:
        if (isUndefined(value) && obj.hasOwnProperty(property)) {
          delete obj[property];
          change = true;
        }
        // Set new and/or changed property values:
        else if (obj[ property ] !== value) {
          obj[ property ] = value;
          change = true;
        }

        // Trigger model change:
        if (change && !options.silent) {
          this.trigger('change:'+attribute+' change', this, obj, options);
        }

        // Return the modified object:
        return obj;
      }
      return null;
    }
  }, mixins);

  // Epoxy.Model -> Private
  // ----------------------

  // Model deep-setter:
  // Attempts to set a collection of key/value attribute pairs to computed attributes.
  // Observable setters may digest values, and then return mutated key/value pairs for inclusion into the set operation.
  // Values returned from computed setters will be recursively deep-set, allowing computeds to set other computeds.
  // The final collection of resolved key/value pairs (after setting all computeds) will be returned to the native model.
  // @param model: target Epoxy model on which to operate.
  // @param toSet: an object of key/value pairs to attempt to set within the computed model.
  // @param toReturn: resolved non-ovservable attribute values to be returned back to the native model.
  // @param trace: property stack trace (prevents circular setter loops).
  function deepModelSet(model, toSet, toReturn, stack) {

    // Loop through all setter properties:
    for (var attribute in toSet) {
      if (toSet.hasOwnProperty(attribute)) {

        // Pull each setter value:
        var value = toSet[ attribute ];

        if (model.hasComputed(attribute)) {

          // Has a computed attribute:
          // comfirm attribute does not already exist within the stack trace.
          if (!stack.length || !_.contains(stack, attribute)) {

            // Non-recursive:
            // set and collect value from computed attribute.
            value = model.c()[attribute].set(value);

            // Recursively set new values for a returned params object:
            // creates a new copy of the stack trace for each new search branch.
            if (value && isObject(value)) {
              toReturn = deepModelSet(model, value, toReturn, stack.concat(attribute));
            }

          } else {
            // Recursive:
            // Throw circular reference error.
            throw('Recursive setter: '+stack.join(' > '));
          }

        } else {
          // No computed attribute:
          // set the value to the keeper values.
          toReturn[ attribute ] = value;
        }
      }
    }

    return toReturn;
  }


  // Epoxy.Model -> Computed
  // -----------------------
  // Computed objects store model values independently from the model's attributes table.
  // Computeds define custom getter/setter functions to manage their value.

  function EpoxyComputedModel(model, name, params, delayInit) {
    params = params || {};

    // Rewrite getter param:
    if (params.get && isFunction(params.get)) {
      params._get = params.get;
    }

    // Rewrite setter param:
    if (params.set && isFunction(params.set)) {
      params._set = params.set;
    }

    // Prohibit override of 'get()' and 'set()', then extend:
    delete params.get;
    delete params.set;
    _.extend(this, params);

    // Set model, name, and default dependencies array:
    this.model = model;
    this.name = name;
    this.deps = this.deps || [];

    // Skip init while parent model is initializing:
    // Model will initialize in two passes...
    // the first pass sets up all computed attributes,
    // then the second pass initializes all bindings.
    if (!delayInit) this.init();
  }

  _.extend(EpoxyComputedModel.prototype, Backbone.Events, {

    // Initializes the computed's value and bindings:
    // this method is called independently from the object constructor,
    // allowing computeds to build and initialize in two passes by the parent model.
    init: function() {

      // Configure dependency map, then update the computed's value:
      // All Epoxy.Model attributes accessed while getting the initial value
      // will automatically register themselves within the model bindings map.
      var bindings = {};
      var deps = modelMap = [];
      this.get(true);
      modelMap = null;

      // If the computed has dependencies, then proceed to binding it:
      if (deps.length) {

        // Compile normalized bindings table:
        // Ultimately, we want a table of event types, each with an array of their associated targets:
        // {'change:name':[<model1>], 'change:status':[<model1>,<model2>]}

        // Compile normalized bindings map:
        _.each(deps, function(value) {
          var attribute = value[0];
          var target = value[1];

          // Populate event target arrays:
          if (!bindings[attribute]) {
            bindings[attribute] = [ target ];

          } else if (!_.contains(bindings[attribute], target)) {
            bindings[attribute].push(target);
          }
        });

        // Bind all event declarations to their respective targets:
        _.each(bindings, function(targets, binding) {
          for (var i=0, len=targets.length; i < len; i++) {
            this.listenTo(targets[i], binding, _.bind(this.get, this, true));
          }
        }, this);
      }
    },

    // Gets an attribute value from the parent model.
    val: function(attribute) {
      return this.model.get(attribute);
    },

    // Gets the computed's current value:
    // Computed values flagged as dirty will need to regenerate themselves.
    // Note: 'update' is strongly checked as TRUE to prevent unintended arguments (handler events, etc) from qualifying.
    get: function(update) {
      if (update === true && this._get) {
        var val = this._get.apply(this.model, _.map(this.deps, this.val, this));
        this.change(val);
      }
      return this.value;
    },

    // Sets the computed's current value:
    // computed values (have a custom getter method) require a custom setter.
    // Custom setters should return an object of key/values pairs;
    // key/value pairs returned to the parent model will be merged into its main .set() operation.
    set: function(val) {
      if (this._get) {
        if (this._set) return this._set.apply(this.model, arguments);
        else throw('Cannot set read-only computed attribute.');
      }
      this.change(val);
      return null;
    },

    // Changes the computed's value:
    // new values are cached, then fire an update event.
    change: function(value) {
      if (!_.isEqual(value, this.value)) {
        this.value = value;
        var evt = ['change:'+this.name, this.model, value];

        if (this.model._setting) {
          this.model._setting.push(evt);
        } else {
          evt[0] += ' change';
          this.model.trigger.apply(this.model, evt);
        }
      }
    },

    // Disposal:
    // cleans up events and releases references.
    dispose: function() {
      this.stopListening();
      this.off();
      this.model = this.value = null;
    }
  });


  // Epoxy.binding -> Binding API
  // ----------------------------

  var bindingSettings = {
    optionText: 'label',
    optionValue: 'value'
  };


  // Cache for storing binding parser functions:
  // Cuts down on redundancy when building repetitive binding views.
  var bindingCache = {};


  // Reads value from an accessor:
  // Accessors come in three potential forms:
  // => A function to call for the requested value.
  // => An object with a collection of attribute accessors.
  // => A primitive (string, number, boolean, etc).
  // This function unpacks an accessor and returns its underlying value(s).

  function readAccessor(accessor) {

    if (isFunction(accessor)) {
      // Accessor is function: return invoked value.
      return accessor();
    }
    else if (isObject(accessor)) {
      // Accessor is object/array: return copy with all attributes read.
      accessor = _.clone(accessor);

      _.each(accessor, function(value, key) {
        accessor[ key ] = readAccessor(value);
      });
    }
    // return formatted value, or pass through primitives:
    return accessor;
  }


  // Binding Handlers
  // ----------------
  // Handlers define set/get methods for exchanging data with the DOM.

  // Formatting function for defining new handler objects:
  function makeHandler(handler) {
    return isFunction(handler) ? {set: handler} : handler;
  }

  var bindingHandlers = {
    // Attribute: write-only. Sets element attributes.
    attr: makeHandler(function($element, value) {
      $element.attr(value);
    }),

    // Checked: read-write. Toggles the checked status of a form element.
    checked: makeHandler({
      get: function($element, currentValue, evt) {
        if ($element.length > 1) {
          $element = $element.filter(evt.target);
        }

        var checked = !!$element.prop('checked');
        var value = $element.val();

        if (this.isRadio($element)) {
          // Radio button: return value directly.
          return value;

        } else if (isArray(currentValue)) {
          // Checkbox array: add/remove value from list.
          currentValue = currentValue.slice();
          var index = _.indexOf(currentValue, value);

          if (checked && index < 0) {
            currentValue.push(value);
          } else if (!checked && index > -1) {
            currentValue.splice(index, 1);
          }
          return currentValue;
        }
        // Checkbox: return boolean toggle.
        return checked;
      },
      set: function($element, value) {
        if ($element.length > 1) {
          $element = $element.filter('[value="'+ value +'"]');
        }
        
        // Default as loosely-typed boolean:
        var checked = !!value;

        if (this.isRadio($element)) {
          // Radio button: match checked state to radio value.
          checked = (value == $element.val());

        } else if (isArray(value)) {
          // Checkbox array: match checked state to checkbox value in array contents.
          checked = _.contains(value, $element.val());
        }

        // Set checked property to element:
        $element.prop('checked', checked);
      },
      // Is radio button: avoids '.is(":radio");' check for basic Zepto compatibility.
      isRadio: function($element) {
        return $element.attr('type').toLowerCase() === 'radio';
      }
    }),

    // Class Name: write-only. Toggles a collection of class name definitions.
    classes: makeHandler(function($element, value) {
      _.each(value, function(enabled, className) {
        $element.toggleClass(className, !!enabled);
      });
    }),

    // Collection: write-only. Manages a list of views bound to a Backbone.Collection.
    collection: makeHandler({
      init: function($element, collection, context, bindings) {
        var html = $element.prop("innerHTML");
        $element.empty();
        this.view.itemView = this.view.itemView || MVVM.ViewModel.extend({
                el: html || "li",
                events: this.view.itemEvents || {}
            })
             
        this.i = bindings.itemView ? this.view[bindings.itemView] : this.view.itemView;
        if (!isCollection(collection)) throw('Binding "collection" requires a Collection.');
        if (!isFunction(this.i)) throw('Binding "collection" requires an itemView.');
        this.v = {};
      },
      set: function($element, collection, target) {

        var view;
        var views = this.v;
        var ItemView = this.i;
        var models = collection.models;

        // Cache and reset the current dependency graph state:
        // sub-views may be created (each with their own dependency graph),
        // therefore we need to suspend the working graph map here before making children...
        var mapCache = viewMap;
        viewMap = null;

        // Default target to the bound collection object:
        // during init (or failure), the binding will reset.
        target = target || collection;

        if (isModel(target)) {

          // ADD/REMOVE Event (from a Model):
          // test if view exists within the binding...
          if (!views.hasOwnProperty(target.cid)) {

            // Add new view:
            views[ target.cid ] = view = new ItemView({model: target, collectionView: this.view});
            var index = _.indexOf(models, target);
            var $children = $element.children();

            // Attempt to add at proper index,
            // otherwise just append into the element.
            if (index < $children.length) {
              $children.eq(index).before(view.$el);
            } else {
              $element.append(view.$el);
            }

          } else {

            // Remove existing view:
            views[ target.cid ].remove();
            delete views[ target.cid ];
          }

        } else if (isCollection(target)) {

          // SORT/RESET Event (from a Collection):
          // First test if we're sorting...
          // (number of models has not changed and all their views are present)
          var sort = models.length === _.size(views) && collection.every(function(model) {
            return views.hasOwnProperty(model.cid);
          });

          // Hide element before manipulating:
          $element.children().detach();
          var frag = document.createDocumentFragment();

          if (sort) {
            // Sort existing views:
            collection.each(function(model) {
              frag.appendChild(views[model.cid].el);
            });

          } else {
            // Reset with new views:
            this.clean();
            collection.each(function(model) {
              views[ model.cid ] = view = new ItemView({model: model, collectionView: this.view});
              frag.appendChild(view.el);
            }, this);
          }

          $element.append(frag);
        }

        // Restore cached dependency graph configuration:
        viewMap = mapCache;
      },
      clean: function() {
        for (var id in this.v) {
          if (this.v.hasOwnProperty(id)) {
            this.v[ id ].remove();
            delete this.v[ id ];
          }
        }
      }
    }),

    // CSS: write-only. Sets a collection of CSS styles to an element.
    css: makeHandler(function($element, value) {
      $element.css(value);
    }),

    // Disabled: write-only. Sets the 'disabled' status of a form element (true :: disabled).
    disabled: makeHandler(function($element, value) {
      $element.prop('disabled', !!value);
    }),

    // Enabled: write-only. Sets the 'disabled' status of a form element (true :: !disabled).
    enabled: makeHandler(function($element, value) {
      $element.prop('disabled', !value);
    }),

    // HTML: write-only. Sets the inner HTML value of an element.
    html: makeHandler(function($element, value) {
      $element.html(value);
    }),

    // Options: write-only. Sets option items to a <select> element, then updates the value.
    options: makeHandler({
      init: function($element, value, context, bindings) {
        this.e = bindings.optionsEmpty;
        this.d = bindings.optionsDefault;
        this.v = bindings.value;
      },
      set: function($element, value) {

        // Pre-compile empty and default option values:
        // both values MUST be accessed, for two reasons:
        // 1) we need to need to guarentee that both values are reached for mapping purposes.
        // 2) we'll need their values anyway to determine their defined/undefined status.
        var self = this;
        var optionsEmpty = readAccessor(self.e);
        var optionsDefault = readAccessor(self.d);
        var currentValue = readAccessor(self.v);
        var options = isCollection(value) ? value.models : value;
        var numOptions = options.length;
        var enabled = true;
        var html = '';

        // No options or default, and has an empty options placeholder:
        // display placeholder and disable select menu.
        if (!numOptions && !optionsDefault && optionsEmpty) {

          html += self.opt(optionsEmpty, numOptions);
          enabled = false;

        } else {
          // Try to populate default option and options list:

          // Configure list with a default first option, if defined:
          if (optionsDefault) {
            options = [ optionsDefault ].concat(options);
          }

          // Create all option items:
          _.each(options, function(option, index) {
            html += self.opt(option, numOptions);
          });
        }
        // Set new HTML to the element and toggle disabled status:
        $element.html(html).prop('disabled', !enabled).val(currentValue);

        // Forcibly set default selection:
        if ($element[0].selectedIndex < 0 && $element.children().length) {
          $element[0].selectedIndex = 0;
        }
        
        // Pull revised value with new options selection state:
        var revisedValue = $element.val();

        // Test if the current value was successfully applied:
        // if not, set the new selection state into the model.
        if (self.v && !_.isEqual(currentValue, revisedValue)) {
          self.v(revisedValue);
        }
      },
      opt: function(option, numOptions) {
        // Set both label and value as the raw option object by default:
        var label = option;
        var value = option;
        var textAttr = bindingSettings.optionText;
        var valueAttr = bindingSettings.optionValue;

        // Dig deeper into label/value settings for non-primitive values:
        if (isObject(option)) {
          // Extract a label and value from each object:
          // a model's 'get' method is used to access potential computed values.
          label = isModel(option) ? option.get(textAttr) : option[ textAttr ];
          value = isModel(option) ? option.get(valueAttr) : option[ valueAttr ];
        }

        return ['<option value="', value, '">', label, '</option>'].join('');
      },
      clean: function() {
        this.d = this.e = this.v = 0;
      }
    }),

    // Template: write-only. Renders the bound element with an Underscore template.
    template: makeHandler({
      init: function($element, value, context) {
        var raw = $element.find('script,template');
        this.t = _.template(raw.length ? raw.html() : $element.html());

        // If an array of template attributes was provided,
        // then replace array with a compiled hash of attribute accessors:
        if (isArray(value)) {
          return _.pick(context, value);
        }
      },
      set: function($element, value) {
        value = isModel(value) ? value.toJSON({computed:true}) : value;
        $element.html(this.t(value));
      },
      clean: function() {
        this.t = null;
      }
    }),
    // for: write-only. Renders the bound element with an array template.
    for: makeHandler({
      init: function($element, value, context) {
        var raw = $element;
        this.html = $element.prop("innerHTML");
        $element.empty();
      },
      set: function($element, value) {
        $element.empty();
        for(var i in value)
        {   
            var obj = _.isObject(value[i])?value[i]:{value:value[i]};
            var item = new Backbone.Epoxy.Model(obj);
            var view = new Backbone.Epoxy.View({
              el: this.html,
              model: item
            }); 
            $element.append(view.$el);
        }
      },
      clean: function() {
        this.t = null;
      }
    }),
    // Text: read-write. Gets and sets the text value of an element.
    text: makeHandler({
      get: function($element) {
        return $element.text();
      },
      set: function($element, value) {
        $element.text(value);
      }
    }),

    // Toggle: write-only. Toggles the visibility of an element.
    toggle: makeHandler(function($element, value) {
      $element.toggle(!!value);
    }),

    // Value: read-write. Gets and sets the value of a form element.
    value: makeHandler({
      get: function($element) {
        return $element.val();
      },
      set: function($element, value) {
        try {
          if ($element.val() + '' != value + '') $element.val(value);
        } catch (error) {
          // Error setting value: IGNORE.
          // This occurs in IE6 while attempting to set an undefined multi-select option.
          // unfortuantely, jQuery doesn't gracefully handle this error for us.
          // remove this try/catch block when IE6 is officially deprecated.
        }
      }
    })
  };


  // Binding Filters
  // ---------------
  // Filters are special binding handlers that may be invoked while binding;
  // they will return a wrapper function used to modify how accessors are read.

  // Partial application wrapper for creating binding filters:
  function makeFilter(handler) {
    return function() {
      var params = arguments;
      var read = isFunction(handler) ? handler : handler.get;
      var write = handler.set;
      return function(value) {
        return isUndefined(value) ?
          read.apply(this, _.map(params, readAccessor)) :
          params[0]((write ? write : read).call(this, value));
      };
    };
  }

  var bindingFilters = {
    // Positive collection assessment [read-only]:
    // Tests if all of the provided accessors are truthy (and).
    all: makeFilter(function() {
      var params = arguments;
      for (var i=0, len=params.length; i < len; i++) {
        if (!params[i]) return false;
      }
      return true;
    }),

    // Partial collection assessment [read-only]:
    // tests if any of the provided accessors are truthy (or).
    any: makeFilter(function() {
      var params = arguments;
      for (var i=0, len=params.length; i < len; i++) {
        if (params[i]) return true;
      }
      return false;
    }),

    // Collection length accessor [read-only]:
    // assumes accessor value to be an Array or Collection; defaults to 0.
    length: makeFilter(function(value) {
      return value.length || 0;
    }),

    // Negative collection assessment [read-only]:
    // tests if none of the provided accessors are truthy (and not).
    none: makeFilter(function() {
      var params = arguments;
      for (var i=0, len=params.length; i < len; i++) {
        if (params[i]) return false;
      }
      return true;
    }),

    // Negation [read-only]:
    not: makeFilter(function(value) {
      return !value;
    }),

    // Formats one or more accessors into a text string:
    // ('$1 $2 did $3', firstName, lastName, action)
    format: makeFilter(function(str) {
      var params = arguments;

      for (var i=1, len=params.length; i < len; i++) {
        // TODO: need to make something like this work: (?<!\\)\$1
        str = str.replace(new RegExp('\\$'+i, 'g'), params[i]);
      }
      return str;
    }),

    // Provides one of two values based on a ternary condition:
    // uses first param (a) as condition, and returns either b (truthy) or c (falsey).
    select: makeFilter(function(condition, truthy, falsey) {
      return condition ? truthy : falsey;
    }),

    // CSV array formatting [read-write]:
    csv: makeFilter({
      get: function(value) {
        value = String(value);
        return value ? value.split(',') : [];
      },
      set: function(value) {
        return isArray(value) ? value.join(',') : value;
      }
    }),

    // Integer formatting [read-write]:
    integer: makeFilter(function(value) {
      return value ? parseInt(value, 10) : 0;
    }),

    // Float formatting [read-write]:
    decimal: makeFilter(function(value) {
      return value ? parseFloat(value) : 0;
    })
  };

  // Define allowed binding parameters:
  // These params may be included in binding handlers without throwing errors.
  var allowedParams = {
    events: 1,
    itemView: 1,
    optionsDefault: 1,
    optionsEmpty: 1
  };

  // Define binding API:
  Epoxy.binding = {
    allowedParams: allowedParams,
    addHandler: function(name, handler) {
      bindingHandlers[ name ] = makeHandler(handler);
    },
    addFilter: function(name, handler) {
      bindingFilters[ name ] = makeFilter(handler);
    },
    config: function(settings) {
      _.extend(bindingSettings, settings);
    },
    emptyCache: function() {
      bindingCache = {};
    }
  };


  // Epoxy.View
  // ----------
  var viewMap;
  var viewProps = ['viewModel', 'bindings', 'bindingFilters', 'bindingHandlers', 'bindingSources', 'computeds'];

  Epoxy.View = Backbone.View.extend({
    _super: Backbone.View,

    // Backbone.View constructor override:
    // sets up binding controls around call to super.
    constructor: function(options) {
      _.extend(this, _.pick(options||{}, viewProps));
      _super(this, 'constructor', arguments);
      this.applyBindings();
    },

    // Bindings list accessor:
    b: function() {
      return this._b || (this._b = []);
    },

    // Bindings definition:
    // this setting defines a DOM attribute name used to query for bindings.
    // Alternatively, this be replaced with a hash table of key/value pairs,
    // where 'key' is a DOM query and 'value' is its binding declaration.
    bindings: 'data-bind',

    // Setter options:
    // Defines an optional hashtable of options to be passed to setter operations.
    // Accepts a custom option '{save:true}' that will write to the model via ".save()".
    setterOptions: null,

    // Compiles a model context, then applies bindings to the view:
    // All Model->View relationships will be baked at the time of applying bindings;
    // changes in configuration to source attributes or view bindings will require a complete re-bind.
    applyBindings: function() {
      this.removeBindings();

      var self = this;
      var sources = _.clone(_.result(self, 'bindingSources'));
      var declarations = self.bindings;
      var options = self.setterOptions;
      var handlers = _.clone(bindingHandlers);
      var filters = _.clone(bindingFilters);
      var context = self._c = {};

      // Compile a complete set of binding handlers for the view:
      // mixes all custom handlers into a copy of default handlers.
      // Custom handlers defined as plain functions are registered as read-only setters.
      _.each(_.result(self, 'bindingHandlers')||{}, function(handler, name) {
          handlers[ name ] = makeHandler(handler);
      });

      // Compile a complete set of binding filters for the view:
      // mixes all custom filters into a copy of default filters.
      _.each(_.result(self, 'bindingFilters')||{}, function(filter, name) {
          filters[ name ] = makeFilter(filter);
      });

      // Add native 'model' and 'collection' data sources:
      self.model = addSourceToViewContext(self, context, options, 'model');
      self.viewModel = addSourceToViewContext(self, context, options, 'viewModel');
      self.collection = addSourceToViewContext(self, context, options, 'collection');

      // Support legacy "collection.view" API for rendering list items:
      // **Deprecated: will be removed after next release*.*
      if (self.collection && self.collection.view) {
        self.itemView = self.collection.view;
      }

      // Add all additional data sources:
      if (sources) {
        _.each(sources, function(source, sourceName) {
          sources[ sourceName ] = addSourceToViewContext(sources, context, options, sourceName, sourceName);
        });

        // Reapply resulting sources to view instance.
        self.bindingSources = sources;
      }

      // Add all computed view properties:
      _.each(_.result(self, 'computeds')||{}, function(computed, name) {
        var getter = isFunction(computed) ? computed : computed.get;
        var setter = computed.set;
        var deps = computed.deps;

        context[ name ] = function(value) {
          return (!isUndefined(value) && setter) ?
            setter.call(self, value) :
            getter.apply(self, getDepsFromViewContext(self._c, deps));
        };
      });

      // Create all bindings:
      // bindings are created from an object hash of query/binding declarations,
      // OR based on queried DOM attributes.
      if (isObject(declarations)) {

        // Object declaration method:
        // {'span.my-element': 'text:attribute'}

        _.each(declarations, function(elementDecs, selector) {
          // Get DOM jQuery reference:
          var $element = queryViewForSelector(self, selector);

          // flattern object notated binding declaration
          if (isObject(elementDecs)) {
            elementDecs = flattenBindingDeclaration(elementDecs);
          }

          // Ignore empty DOM queries (without errors):
          if ($element.length) {
            bindElementToView(self, $element, elementDecs, context, handlers, filters);
          }
        });

      } else {

        // DOM attributes declaration method:
        // <span data-bind='text:attribute'></span>

        // Create bindings for each matched element:
        var $elements = queryViewForSelector(self, '['+declarations+']');
        var $scopes = $('[mvvm-scope]',self.$el);
        for(var i=0;i<$scopes.length;i++){
            var $sub = $('['+declarations+']',$scopes[i]);
            $sub.each(function(){
                var index = $elements.indexOf(this);
                if(index >= 0){
                    $elements = $elements.not(this);
                }
            })
        }
        $elements.each(function() {
          var $element = Backbone.$(this);
          bindElementToView(self, $element, $element.attr(declarations), context, handlers, filters);
        });
      }
    },

    // Gets a value from the binding context:
    getBinding: function(attribute) {
      return accessViewContext(this._c, attribute);
    },

    // Sets a value to the binding context:
    setBinding: function(attribute, value) {
      return accessViewContext(this._c, attribute, value);
    },

    // Disposes of all view bindings:
    removeBindings: function() {
      this._c = null;

      if (this._b) {
        while (this._b.length) {
          this._b.pop().dispose();
        }
      }
    },

    // Backbone.View.remove() override:
    // unbinds the view before performing native removal tasks.
    remove: function() {
      this.removeBindings();
      _super(this, 'remove', arguments);
    }

  }, mixins);

  // Epoxy.View -> Private
  // ---------------------

  // Adds a data source to a view:
  // Data sources are Backbone.Model and Backbone.Collection instances.
  // @param source: a source instance, or a function that returns a source.
  // @param context: the working binding context. All bindings in a view share a context.
  function addSourceToViewContext(source, context, options, name, prefix) {

    // Resolve source instance:
    source = _.result(source, name);

    // Ignore missing sources, and invoke non-instances:
    if (!source) return;

    // Add Backbone.Model source instance:
    if (isModel(source)) {

      // Establish source prefix:
      prefix = prefix ? prefix+'_' : '';

      // Create a read-only accessor for the model instance:
      context['$'+name] = function() {
        viewMap && viewMap.push([source, 'change']);
        return source;
      };
	  context["$attr"]=function(key){
        return function(value) {
          return accessViewDataAttribute(source, key, value, options);
        };
      }


      // Compile all model attributes as accessors within the context:
      var modelAttributes = _.extend({}, source.attributes, _.isFunction(source.c) ? source.c() : {});
      _.each(modelAttributes, function(value, attribute) {

        // Create named accessor functions:
        // -> Attributes from 'view.model' use their normal names.
        // -> Attributes from additional sources are named as 'source_attribute'.
        context[prefix+attribute] = function(value) {
          return accessViewDataAttribute(source, attribute, value, options);
        };
      });
    }
    // Add Backbone.Collection source instance:
    else if (isCollection(source)) {

      // Create a read-only accessor for the collection instance:
      context['$'+name] = function() {
        viewMap && viewMap.push([source, 'reset add remove sort update']);
        return source;
      };
    }

    // Return original object, or newly constructed data source:
    return source;
  }

  // Attribute data accessor:
  // exchanges individual attribute values with model sources.
  // This function is separated out from the accessor creation process for performance.
  // @param source: the model data source to interact with.
  // @param attribute: the model attribute to read/write.
  // @param value: the value to set, or 'undefined' to get the current value.
  function accessViewDataAttribute(source, attribute, value, options) {
    // Register the attribute to the bindings map, if enabled:
    viewMap && viewMap.push([source, 'change:'+attribute]);

    // Set attribute value when accessor is invoked with an argument:
    if (!isUndefined(value)) {

      // Set Object (non-null, non-array) hashtable value:
      if (!isObject(value) || isArray(value) || _.isDate(value)) {
        var val = value;
        value = {};
        value[attribute] = val;
      }

      // Set value:
      return options && options.save ? source.save(value, options) : source.set(value, options);
    }

    // Get the attribute value by default:
    return source.get(attribute);
  }

  // Queries element selectors within a view:
  // matches elements within the view, and the view's container element.
  function queryViewForSelector(view, selector) {
    if (selector === ':el' || selector === ':scope') return view.$el;
    var $elements = view.$(selector);

    // Include top-level view in bindings search:
    if (view.$el.is(selector)) {
      $elements = $elements.add(view.$el);
    }

    return $elements;
  }

  // Binds an element into a view:
  // The element's declarations are parsed, then a binding is created for each declared handler.
  // @param view: the parent View to bind into.
  // @param $element: the target element (as jQuery) to bind.
  // @param declarations: the string of binding declarations provided for the element.
  // @param context: a compiled binding context with all availabe view data.
  // @param handlers: a compiled handlers table with all native/custom handlers.
  function bindElementToView(view, $element, declarations, context, handlers, filters) {

    // Parse localized binding context:
    // parsing function is invoked with 'filters' and 'context' properties made available,
    // yeilds a native context object with element-specific bindings defined.
    try {
      if(context.$model)
      {
          var parserFunct = bindingCache[declarations] || (bindingCache[declarations] = new Function('$m','$f','$c','with($m){with($f){with($c){return{'+ declarations +'}}}}'));
          var bindings = parserFunct(view.model,filters, context);
      }
      else
      {
          var parserFunct = bindingCache[declarations] || (bindingCache[declarations] = new Function('$f','$c','with($f){with($c){return{'+ declarations +'}}}'));
          var bindings = parserFunct(filters, context);
      }
    } catch (error) {
      console.log('Error parsing bindings: "'+declarations +'"\n>> '+error);
      return;
    }

    // Format the 'events' option:
    // include events from the binding declaration along with a default 'change' trigger,
    // then format all event names with a '.epoxy' namespace.
    var events = _.map(_.union(bindings.events || [], ['change']), function(name) {
      return name+'.epoxy';
    }).join(' ');

    // Apply bindings from native context:
    _.each(bindings, function(accessor, handlerName) {

      // Validate that each defined handler method exists before binding:
      if (handlers.hasOwnProperty(handlerName)) {
        // Create and add binding to the view's list of handlers:
        view.b().push(new EpoxyBinding(view, $element, handlers[handlerName], accessor, events, context, bindings));
      } else if (!allowedParams.hasOwnProperty(handlerName)) {
        throw('binding handler "'+ handlerName +'" is not defined.');
      }
    });
  }

  // Gets and sets view context data attributes:
  // used by the implementations of "getBinding" and "setBinding".
  function accessViewContext(context, attribute, value) {
    if (context && context.hasOwnProperty(attribute)) {
      return isUndefined(value) ? readAccessor(context[attribute]) : context[attribute](value);
    }
  }

  // Accesses an array of dependency properties from a view context:
  // used for mapping view dependencies by manual declaration.
  function getDepsFromViewContext(context, attributes) {
    var values = [];
    if (attributes && context) {
      for (var i=0, len=attributes.length; i < len; i++) {
        values.push(attributes[i] in context ? context[ attributes[i] ]() : null);
      }
    }
    return values;
  }

  var identifierRegex = /^[a-z_$][a-z0-9_$]*$/i;
  var quotedStringRegex = /^\s*(["']).*\1\s*$/;

  // Converts a binding declaration object into a flattened string.
  // Input: {text: 'firstName', attr: {title: '"hello"'}}
  // Output: 'text:firstName,attr:{title:"hello"}'
  function flattenBindingDeclaration(declaration) {
    var result = [];

    for (var key in declaration) {
      var value = declaration[key];

      if (isObject(value)) {
        value = '{'+ flattenBindingDeclaration(value) +'}';
      }

      // non-identifier keys that aren't already quoted need to be quoted
      if (!identifierRegex.test(key) && !quotedStringRegex.test(key)) {
        key = '"' + key + '"';
      }

      result.push(key +':'+ value);
    }

    return result.join(',');
  }


  // Epoxy.View -> Binding
  // ---------------------
  // The binding object connects an element to a bound handler.
  // @param view: the view object this binding is attached to.
  // @param $element: the target element (as jQuery) to bind.
  // @param handler: the handler object to apply (include all handler methods).
  // @param accessor: an accessor method from the binding context that exchanges data with the model.
  // @param events:
  // @param context:
  // @param bindings:
  function EpoxyBinding(view, $element, handler, accessor, events, context, bindings) {

    var self = this;
    var tag = ($element[0].tagName).toLowerCase();
    var changable = (tag == 'input' || tag == 'select' || tag == 'textarea' || $element.prop('contenteditable') == 'true');
    var triggers = [];
    var reset = function(target) {
      self.$el && self.set(self.$el, readAccessor(accessor), target);
    };

    self.view = view;
    self.$el = $element;
    self.evt = events;
    _.extend(self, handler);

    // Initialize the binding:
    // allow the initializer to redefine/modify the attribute accessor if needed.
    accessor = self.init(self.$el, readAccessor(accessor), context, bindings) || accessor;

    // Set default binding, then initialize & map bindings:
    // each binding handler is invoked to populate its initial value.
    // While running a handler, all accessed attributes will be added to the handler's dependency map.
    viewMap = triggers;
    reset();
    viewMap = null;

    // Configure READ/GET-able binding. Requires:
    // => Form element.
    // => Binding handler has a getter method.
    // => Value accessor is a function.
    if (changable && handler.get && isFunction(accessor)) {
      self.$el.on(events, function(evt) {
        accessor(self.get(self.$el, readAccessor(accessor), evt));
      });
    }

    // Configure WRITE/SET-able binding. Requires:
    // => One or more events triggers.
    if (triggers.length) {
      for (var i=0, len=triggers.length; i < len; i++) {
        self.listenTo(triggers[i][0], triggers[i][1], reset);
      }
    }
  }

  _.extend(EpoxyBinding.prototype, Backbone.Events, {

    // Pass-through binding methods:
    // for override by actual implementations.
    init: blankMethod,
    get: blankMethod,
    set: blankMethod,
    clean: blankMethod,

    // Destroys the binding:
    // all events and managed sub-views are killed.
    dispose: function() {
      this.clean();
      this.stopListening();
      this.$el.off(this.evt);
      this.$el = this.view = null;
    }
  });

  return Epoxy;
}));

var MVVM = {
    ViewModel:Backbone.Epoxy.View,
    Model:Backbone.Epoxy.Model,
    Collection:Backbone.Collection,
    Service:Backbone.Service,
    Binding:Backbone.Epoxy.binding
};
MVVM.Model.prototype.echarts = function(attr,lab){
    if(lab)
    {
        return [{value:this.get(attr),name:this.get(lab)}]
    }
    return this.get(attr);
}


MVVM.Collection.prototype.echarts = function(attr, lab) {
    var tdata = this.pluck(attr);
    var tlab = this.pluck(lab);
    if (tlab.length > 0) {
        var arr = [];
        for (var i = 0; i < tdata.length; i++) {
            arr.push({
                value : tdata[i],
                name : tlab[i]
            })
        }
        return arr;
    }
    return [];
}
