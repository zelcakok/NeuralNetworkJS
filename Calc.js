/*
  A class for handling all the calculations
  that required.
  e.g. Activiation function, backward propagation.
*/
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
