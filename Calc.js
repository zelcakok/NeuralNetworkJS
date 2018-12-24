/*
  A class for handling all the calculations
  that required.
  e.g. Activiation function, backward propagation.
*/
// const Report = require('./Report');
const Crypto = require('./Crypto');

var LEARNING_RATE = 0.3;
var MOMENTUM = 0.3;
var CHANGES_RECORD = new Object();

class Calc {
  static randomWeight(min=-1000, max=2000){
    return Math.round(Math.random() * max + min) / 1000;
  }

  static sigmoid(val){
    return 1 / (1 + Math.exp(-val));
  }

  static dSigmoid(val){
    return val * (1 - val);
  }
}
module.exports = Calc;
