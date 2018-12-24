const moment = require("moment");
const crypto = require("crypto");

class Crypto {
  static genId(){
    return crypto.createHash("md5").update(moment().valueOf()+"_"+Math.random()).digest("hex");
  }

  static combine(a, b){
    return crypto.createHash("md5").update(a+b).digest("hex");
  }
}
module.exports = Crypto;
