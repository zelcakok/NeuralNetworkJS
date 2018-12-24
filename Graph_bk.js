const Matrix = require("./Matrix");
const Calc = require("./Calc");

var LEARNING_RATE = 0.3;

class Graph {
  constructor() {
    this.layers = new Object();
    this.trainDataSet = null;
    this.customOpt()
  }

  customOpt(){
    Matrix.setCustomAddition((mA, mB)=>{
      mA.value += mB.value;
      return mA;
    }).setCustomSubtraction((mA, mB)=>{
      mA.value -= mB.value;
      return mA;
    }).setCustomMultiply((mA, mB)=>{
      return mA.value * mB.value;
    }).setCustomMultiplyConst((mA, val)=>{
      mA.value *= val;
      return mA;
    }).setCustomWrapper((value)=>{
      return {value: value};
    }).setCustomRound((obj)=>{
      // obj.value = Math.round(obj.value*1000)/1000;
      return obj;
    })
  }

  dataSet(dataSet){
    this.inputLayer(dataSet.inputs, Object.keys(dataSet.inputs).length);
    this.outputLayer(dataSet.answers, Object.keys(dataSet.answers));
    this.hiddenLayer();
    this.trainDataSet = dataSet;
    return this;
  }

  trainConfig(matrix, trainData){
    var tMatrix = new Matrix(matrix.row, matrix.col).fill({value:0});
    tMatrix.updateSlot(tMatrix.genKey(0, trainData.input), {value:1});
    matrix = matrix.optAddMatrix(tMatrix);
    return matrix;
  }

  sigmoid(matrix){
    matrix.customOpt((data,row,col)=>{
      data.value = Calc.sigmoid(data.value);
      return data;
    })
    return matrix;
  }

  dsigmoid(x){
    return x * (1 - x);
  }

  /*
    adjustedWeight = curWeight - LEARNING_RATE * delta
  */
  adjustedWeight(curWeight, errorMeasure){
    var weightDelta = this.weightDelta(curWeight)
  }


  /*
    totalError / curWeight =
        (Part 1) -(target - output) +
        (Part 2) output * (1 - output) +
        (Part 3)
        e.g. Calculating W5, return Out_h1
          Out_h1 ---W5---> Output_1
          Out_h2 ---W6---> Output_1
  */
  // errorFunc(optState, answer){
  //   var hoEdges = this.layers["H-O"];
  //   var oMatrix = optState["outputOutValue"].clone(), matrix = oMatrix.clone();
  //
  //   var ansMatrix = new Matrix(matrix.row, matrix.col).fill({value:0});
  //   ansMatrix.updateSlot(ansMatrix.genKey(0, answer), {value:1});
  //
  //   var ratioOut2Ans = ansMatrix.optMinusMatrix(matrix).optMultiplyConst(-1);
  //   var ratioNet2Out = oMatrix.clone().customOpt((data, row, col)=>{
  //     data.value *= (1 - data.value);
  //     return data;
  //   })
  //   var ratioWeight2Net = optState["outputNetValue"].clone();
  //
  //   //Chain rule
  //   var deltaWeight = new Matrix(hoEdges.row, hoEdges.col);
  //   deltaWeight = Matrix.optSpecialMultiply(deltaWeight, ratioOut2Ans, ratioNet2Out, ratioWeight2Net);
  //
  //   hoEdges.customOpt((data, row, col)=>{
  //     data.value = data.value - LEARNING_RATE * deltaWeight.read(row,col).value;
  //     return data;
  //   })
  //
  //   // return 1 / (2*matrix.read(0,0).value);
  // }

  _backPropagationOH(outValues, netValues, edges, answer){
    var oMatrix = outValues.clone(), matrix = oMatrix.clone();

    var ansMatrix = new Matrix(matrix.row, matrix.col).fill({value:0});
    ansMatrix.updateSlot(ansMatrix.genKey(0, answer), {value:1});

    var ratioOut2Ans = ansMatrix.optMinusMatrix(matrix).optMultiplyConst(-1);
    var ratioNet2Out = oMatrix.clone().customOpt((data, row, col)=>{
      data.value *= (1 - data.value);
      return data;
    })
    var ratioWeight2Net = netValues.clone();

    //Chain rule
    var deltaWeight = new Matrix(edges.row, edges.col);
    deltaWeight = Matrix.optSpecialMultiply(deltaWeight, ratioOut2Ans, ratioNet2Out, ratioWeight2Net);

    edges.customOpt((data, row, col)=>{
      data.value = data.value - LEARNING_RATE * deltaWeight.read(row,col).value;
      return data;
    })

    return {ratioOut2Ans, ratioNet2Out};
  }

  _backPropagationHI(outValues, netValues, ihEdges, hoEdges, intermediate){
    var prevOutValue = intermediate.ratioOut2Ans.clone();
    var prevNetValue = intermediate.ratioNet2Out.clone();

    prevOutValue.customOpt((data, row, col)=>{
      data.value *= prevNetValue.read(row,col).value *
    })

    // outValues.customOpt((data, row, col)=>{
    //   data.value *= netValues.read(row, col).value;
    //   return data;
    // })
  }

  backPropagation(optState, answer){
    var intermediate;
    var hoEdges = this.layers["H-O"].clone();
    var ihEdges = this.layers["I-H"].clone();

    //Output layer to Hidden layer
    intermediate = this._backPropagationOH(
      optState["outputOutValue"],
      optState["outputNetValue"],
      hoEdges, answer);

    //Hidden layer to Input layer
    this._backPropagationHI(
      optState["inputOutValue"],
      optState["inputNetValue"],
      ihEdges, hoEdges, intermediate);
  }

  train(){
    for(var i in this.trainDataSet.dataSet){
      var iMatrix = this.layers["Input"];
      var ihEdges = this.layers["I-H"];
      var hMatrix = this.layers["Hidden"];
      var hoEdges = this.layers["H-O"];
      var oMatrix = this.layers["Output"];
      var matrix, optState = new Object();
      var trainData = this.trainDataSet.dataSet[i];
      console.log("-------- Train data: " + trainData.answer + " --------");
      //Config inNodes
      matrix = this.trainConfig(iMatrix, trainData);
      //Sum(inNode * I-H_edgeWeight) ==> inNode * Weight ==> [iW]
      matrix = matrix.optMultiplyMatrix(ihEdges);
      //iW + bias_hNode ==> [inputs net value]
      matrix = matrix.optAddMatrix(hMatrix);
      optState["inputNetValue"] = matrix.clone();
      //Activiation function ==> [inputs out value]
      matrix = this.sigmoid(matrix);
      optState["inputOutValue"] = matrix.clone();
      //Sum(outValue * H-O_edgeWeight) ==> outValue * Weight ==> hW
      matrix = matrix.optMultiplyMatrix(hoEdges);
      //hW + bias_oNode ==> [outputs net value]
      matrix = matrix.optAddMatrix(oMatrix);
      optState["outputNetValue"] = matrix.clone();
      //Activiation function ==> [outputs out value]
      matrix = this.sigmoid(matrix);
      optState["outputOutValue"] = matrix.clone();

      //Error measurement
      this.backPropagation(optState, trainData.answer);

      //Back propagation, the hardest part.
      //Step 1 (Easier), back to hidden.
      //Step 2 (Harder), back to input.

      console.log("---------------- End ----------------");
    }
    // iMatrix.print();
    // eMatrix.print();
    // var result = iMatrix.optAddMatrix(new Matrix(1, 2).addAll(1,0), (nA, val)=>{
    //     nA.value += val;
    //     return nA;
    // })
    // result = iMatrix.optMultiplyMatrix(eMatrix, (inNode, edge)=>{
    //   return inNode.value * edge.weight;
    // })
    // result.print();
  }

  //Calculate once from input layer to output layer
  feedForward(){
    
  }

  inputLayer(inputs, length){
    for(var i in inputs) inputs[i].value = 0;
    this.layers["Input"] = new Matrix(1, length).addAll(...inputs);
    return this;
  }

  outputLayer(outputs){
    for(var i in outputs) outputs[i].value = Calc.randomWeight();
    this.layers["Output"] = new Matrix(1, outputs.length).addAll(...outputs);
    return this;
  }

  hiddenLayer(){
    // var length = Object.keys(this.layers["Input"]).length * 2/3 +
                        // Object.keys(this.layers["Output"]).length;
    var length = Object.keys(this.layers["Input"]).length;
    var h = new Matrix(1, length);
    for(var i=0; i<length; i++) h.add({value:Calc.randomWeight()});
    this.layers["Hidden"] = h;
    this.edges("I-H", this.getLayerSize("Input"),  h.size());
    this.edges("H-O", h.size(), this.getLayerSize("Output"));
    return this;
  }

  edges(name, row, col){
    var e = new Matrix(row, col);
    for(var i=0; i<row*col; i++) e.add({value:Calc.randomWeight()});
    this.layers[name] = e;
    return this;
  }

  getLayerSize(layer){
    return this.layers[layer].size();
  }

  print(){
    Object.keys(this.layers).map((layer)=>{
      console.log(layer);
      this.layers[layer].print();
      console.log();
    })
  }
}
module.exports = Graph;
