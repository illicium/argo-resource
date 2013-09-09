var path = require('path');
var url = require('url');

var Products = module.exports = function(products) {
  this.products = products || [];
};

Products.prototype.init = function(config) {
  config
    .path('/store/products')
    .get(this.list)
    .post(this.insert)
    .get('/{id}', this.show)
    .bind(this);
};

Products.prototype.list = function(env, next) {
  env.response.body = this.products;
  next(env);
};

Products.prototype.show = function(env, next) {
  var key = parseInt(env.request.params.id);

  var filtered = this.products.filter(function(p) {
    return p.id === key;
  });

  if (filtered.length) {
    env.response.body = filtered[0];
  } else {
    env.response.statusCode = 404;
  }

  next(env);
};

Products.prototype.insert = function(env, next) {
  var self = this;
  env.request.getBody(function(err, body) {
    var obj = JSON.parse(body.toString());
    self.products.push(obj);
    
    var parsed = url.parse(env.argo.uri());
    parsed.pathname = path.join(parsed.pathname, obj.id.toString());
    parsed.search = parsed.hash = parsed.auth = '';
    
    var location = url.format(parsed);

    env.response.statusCode = 201;
    env.response.setHeader('Location', location);

    next(env);
  });
};
