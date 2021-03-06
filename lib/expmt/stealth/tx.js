var Tx = require('../../tx');
var Pubkey = require('../../pubkey');

var STx = function STx(tx, sa, sk) {
  if (!(this instanceof STx))
    return new STx(tx, sa, sk);
  if (tx instanceof Tx) {
    this.tx = tx;
    this.sa = sa;
    this.sk = sk;
  } else if (tx) {
    var obj = tx;
    this.set(obj);
  }
};

STx.prototype.set = function(obj) {
  this.sk = obj.sk || this.sk;
  this.sa = obj.sa || this.sa;
  this.tx = obj.tx || this.tx;
  return this;
};

STx.prototype.isForMe = function() {
  if (!this.notMine())
    return true;
  else
    return false;
};

STx.prototype.notMine = function() {
  var err;
  if (err = this.notStealth())
    return "Not stealth: " + err;
  var txopbuf = this.tx.txouts[0].script.chunks[1].buf;
  var parsed = STx.parseOpReturnData(txopbuf);
  var pubkey = parsed.pubkey;
  var pubkeyhashbuf = this.tx.txouts[1].script.chunks[2].buf;
  var sk = this.sk;
  if (sk.isForMe(pubkey, pubkeyhashbuf)) {
    return false;
  } else {
    return "STx not mine";
  }
};

//For now, we only support a very limited variety of stealth tx
STx.prototype.notStealth = function() {
  var txouts = this.tx.txouts;
  if (!(txouts.length >= 2))
    return "Not enough txouts";
  if (!txouts[0].script.isOpReturn())
    return "First txout is not OP_RETURN";
  if (!txouts[1].script.isPubkeyhashOut())
    return "Second txout is not pubkeyhash";
  return false;
};

STx.parseOpReturnData = function(buf) {
  var parsed = {};
  parsed.version = buf[0];
  parsed.noncebuf = buf.slice(1, 5);
  parsed.pubkey = Pubkey().fromBuffer(buf.slice(5, 5 + 33));
  return parsed;
};

module.exports = STx;
