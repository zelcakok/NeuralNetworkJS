const Calc = require("./Calc");

class Matrix {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.data = new Object();
  }

  static restore(obj){
    var m = new Matrix(obj.row, obj.col);
    m.data = obj.data;
    return m;
  }

  round(val){
    return Math.round(val*1000)/1000;
  }

  print(){
    var cur = 0, row, col;
    this.traverse((data, row, col)=>{
      if(row !== cur) {
        this.out("\n")
        cur = row;
      }
      var data = this.round(data);
      var str = JSON.stringify(data);
      this.out(str.padEnd(str.length+Math.abs(18-str.length)));
    })
    this.out("\n");
    return this;
  }

  out(msg){
    process.stdout.write(msg);
  }

  traverse(callback){
    var curRow = 0, row, col;
    Object.keys(this.data).map((key)=>{
      [row, col] = this.parseKey(key);
      callback(this.data[key], row, col);
    })
  }

  transpose(){
    var m = new Matrix(this.col, this.row);
    var col = 0, key;
    do{
      key = this.genKey(0, col);
      do {
        m.add(this.readSlot(key));
        key = this.getNextRowKey(key);
      } while(key)
    } while(++col < this.col);
    return m;
  }

  genKey(row, col){
    return row+"_"+col;
  }

  parseKey(key){
    return key.split("_");
  }

  getNextRowKey(key){
    var [row, col] = this.parseKey(key);
    if(parseInt(row) >= parseInt(this.row)-1) return false;
    return this.genKey(parseInt(row)+parseInt(1), col);
  }

  getNextSlot(){
    var size = this.size();
    var col = size % this.col;
    var row = Math.floor(size / this.col);
    return this.genKey(row, col);
  }

  readRow(row){
    var data = [];
    for(var i=0; i<this.col; i++)
      data.push(this.data[this.genKey(row, i)])
    return data;
  }

  readSlot(key){
    return this.data[key];
  }

  read(row, col){
    var val = this.data[this.genKey(row, col)];
    return val ? val : 0;
  }

  updateSlot(row, col, data){
    this.data[this.genKey(row,col)] = data;
    return this;
  }

  customOpt(custAction){
    this.traverse((data, row, col)=>{
      this.data[this.genKey(row,col)] = custAction(data, row, col);
    })
    return this;
  }

  fill(val){
    for(var i=0; i<this.row*this.col; i++)
      this.add(val);
    return this;
  }

  reset(callback){
    this.traverse((data, row, col)=>{
      this.data[this.genKey(row,col)] = callback ? callback(this.data[this.genKey(row,col)]) : 0;
    })
    return this;
  }

  add(data){
    if(this.validate(this).full)
      throw "Error: It's already fulled.";
    this.data[this.getNextSlot()] = data;
    return this;
  }

  addAll(...data){
    for(var i in data) this.add(data[i]);
    return this;
  }

  optAddMatrix(matrix){
    if(!this.validate(matrix).add)
      throw "Error: Dimension do not match.";
    var m = new Matrix(this.row, this.col);
    this.traverse((data, row, col)=>{
      m.add(data + matrix.read(row,col));
    })
    return m;
  }

  optAddConst(val){
    this.traverse((data, row, col)=>
      this.updateSlot(this.genKey(row,col), data + val))
    return this;
  }

  optMinusMatrix(matrix){
    if(!this.validate(matrix).add)
      throw "Error: Dimension do not match.";
    var m = new Matrix(this.row, this.col);
    this.traverse((data, row, col)=>{
      m.add(data - matrix.read(row,col));
    })
    return m;
  }

  optMinusConst(val){
    this.traverse((data, row, col)=>
      this.updateSlot(row,col, data - val));
    return this;
  }

  optMultiplyMatrix(matrix){
    var validate = this.validate(matrix), thisMatrix = this;
    // if(!validate.multiply && !validate.multiplyT)
    if(!validate.multiply)
      throw "Error: Dimension do not match.";
    // if(validate.multiplyT) thisMatrix = this.transpose();
    var m = new Matrix(thisMatrix.row, matrix.col), sum = 0;
    var matrixT = matrix.transpose();
    for(var i=0; i<thisMatrix.row; i++)
      for(var j=0; j<matrixT.row; j++)
        m.add(this.optDotProduct(thisMatrix.readRow(i), matrixT.readRow(j)));
    return m;
  }

  optMultiplyMatrixT(matrix){
    if(!this.validate(matrix).multiply)
      throw "Error: Dimension do not match.";
    var m = new Matrix(this.row, matrix.col), sum = 0;
    var matrixT = matrix.transpose();
    for(var i=0; i<this.row; i++)
      for(var j=0; j<matrixT.row; j++)
        m.add(this.optDotProduct(this.readRow(i), matrixT.readRow(j)));
    return m;
  }

  optDotProduct(vecA, vecB){
    var sum = 0;
    for(var i=0; i<Math.min(vecA.length, vecB.length); i++)
      sum += vecA[i] * vecB[i];
    return sum;
  }

  optSpecialMultiply(matrix){
    if(!this.validate(matrix).add)
      throw "Error: Dimension do not match.";
    var m = new Matrix(this.row, this.col);
    this.traverse((data, row, col)=>{
      m.add(data * matrix.read(row,col));
    })
    return m;
  }

  optMultiplyConst(val){
    this.traverse((data, row, col)=>{
      this.data[this.genKey(row, col)] = data * val;
    })
    return this;
  }

  clone(){
    return new Matrix(this.row, this.col).addAll(...JSON.parse(JSON.stringify(Object.values(this.data))));
  }

  validate(matrix=null){
    return {
      multiply: matrix ? this.col === matrix.row : false,
      multiplyT: matrix ? this.row === matrix.row : false,
      add: matrix ? this.row === matrix.row && this.col === matrix.col : false,
      full: this.size() === this.row * this.col
    }
  }

  space(){
    return this.row * this.col;
  }

  size(){
    return Object.keys(this.data).length;
  }
}
module.exports = Matrix;
