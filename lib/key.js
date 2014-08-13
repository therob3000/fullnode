var Privkey = require('./privkey');
var Pubkey = require('./pubkey');
var Random = require('./random');
var Bn = require('./bn');
var point = require('./point');

function Key(privkey, pubkey) {
  this.privkey = privkey;
  this.pubkey = pubkey;
};

Key.prototype.fromRandom = function() {
  do {
    var privbuf = Random.getRandomBuffer(32);
    this.privkey = new Privkey(Bn(privbuf));
    var condition = this.privkey.bn.lt(point.getN());
  } while (!condition);
  this.privkey2pubkey();
  return this;
};

Key.prototype.fromString = function(str) {
  var obj = JSON.parse(str);
  if (obj.privkey) {
    this.privkey = new Privkey();
    this.privkey.fromString(obj.privkey);
  }
  if (obj.pubkey) {
    this.pubkey = new Pubkey();
    this.pubkey.fromString(obj.pubkey);
  }
};

Key.prototype.privkey2pubkey = function() {
  this.pubkey = new Pubkey(point.getG().mul(this.privkey.bn));
};

Key.prototype.toString = function() {
  var obj = {};
  if (this.privkey)
    obj.privkey = this.privkey.toString();
  if (this.pubkey)
    obj.pubkey = this.pubkey.toString();
  return JSON.stringify(obj);
};

module.exports = Key;