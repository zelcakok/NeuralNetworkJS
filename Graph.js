const Matrix = require("./Matrix");
const Calc = require("./Calc");

var LEARNING_RATE = 0.03;

class Graph {
  constructor() {
    this.layers = new Object();
    this.trainDataSet = null;
  }

  static restore(obj){
    var graph = new Graph();
    if(!obj) return graph;
    Object.keys(obj.layers).map((layer)=>{
      graph.layers[layer] = Matrix.restore(obj.layers[layer]);
    })
    graph.trainDataSet = obj.trainDataSet;
    return graph;
  }

  dataSet(dataSet, multiplier=100){
    this.inputLayer(dataSet.inputSize);
    this.outputLayer(dataSet.outputSize);
    this.hiddenLayer();
    this.trainDataSet = dataSet;
    this.trainDataSet.dataSet = this.dataSetExpand(multiplier);
    return this;
  }

  dataSetExpand(multiplier){
    var dataSet = this.trainDataSet.dataSet, expand = [];
    for(var i=0; i<dataSet.length * multiplier; i++)
      expand.push(this.pickDataSet())
    return expand;
  }

  trainConfig(trainData){
    var m = new Matrix(trainData.input.length, 1);
    for(var i in trainData.input) m.add(trainData.input[i])
    return m;
  }

  trainAnswer(trainData, row, col){
    var slot = this.trainDataSet.answers.indexOf(trainData.answer);
    var a = new Matrix(1, 1).fill(0).updateSlot(slot, 0, 1);
    return a
  }

  sigmoid(matrix){
    matrix.customOpt((data,row,col)=>{
      data = Calc.sigmoid(data);
      return data;
    })
    return matrix;
  }

  dSigmoid(matrix){
    matrix.customOpt((data,row,col)=>{
      data = Calc.dSigmoid(data);
      return data;
    })
    return matrix;
  }

  parseOutput(output, testAnswer, answers){
    var answer = [];
    output.traverse((data, row, col)=>{
        answer.push([data, row])
    })
    answer.sort((a, b)=>{return b[0] - a[0];})
    for(var i=0; i<answer.length; i++)
      console.log("Rank: " + i + ", Answer: ".padStart(5) + answers[answer[i][1]].toString().padEnd(10) + "Rate: " + answer[i][0]);
    var label = this.trainDataSet.answers[parseInt(answer[0][1])];
    console.log("Result is ", label === testAnswer ? "Match" : "Not Match");
  }

  test(testData){
    var output = this.feedForward(testData);
    return output.outputMatrix;
  }

  pickDataSet(){
    var size = this.trainDataSet.dataSet.length;
    var pick = Math.floor(Math.random() * size);
    return this.trainDataSet.dataSet[pick];
  }

  train(iteration=1, verbose=false){
    var total = iteration;
    while(iteration-- > 0) {
      if(!verbose) console.log("Training, please wait...", Math.round((total-iteration) / total * 100) + "%");
      this._train(iteration, verbose);
      console.clear();
    }
  }

  _train(iteration, verbose){
    for(var i in this.trainDataSet.dataSet){
      var dataSet = this.trainDataSet.dataSet[i];
      if(verbose) console.log("-------- Train input: " + dataSet.input + ", answer: " + dataSet.answer + ", Iteration remain: "+ iteration +" --------");
      var intermediate = this.feedForward(dataSet);

      var outputs = intermediate.outputMatrix;
      var input = intermediate.inputMatrix;
      var hidden = intermediate.hiddenMatrix;
      // var answer = this.trainAnswer(dataSet, outputs.row, outputs.col);
      var answer = new Matrix(1,1).fill(dataSet.answer);
      //Output errors ==> Target - Output
      var outputErrs = answer.optMinusMatrix(outputs)

      //Try
      // LEARNING_RATE *= 0.8;

      if(verbose) {
        console.log("Error");
        outputErrs.print();
      }
      var hoGradients = this.dSigmoid(outputs)
                            .optSpecialMultiply(outputErrs)
                            .optMultiplyConst(LEARNING_RATE)
      var hoDeltaWeight = hoGradients.optMultiplyMatrix(hidden.transpose())
      if(verbose){
        console.log("H-O weight delta");
        hoDeltaWeight.print();
      }
      this.layers["H-O"] = this.layers["H-O"].optAddMatrix(hoDeltaWeight)
      this.layers["Output"] = this.layers["Output"].optAddMatrix(hoGradients)

      //Hidden errors
      var hoEdges = this.layers["H-O"].clone();
      var hiddenErrs = hoEdges.transpose().optMultiplyMatrix(outputErrs)
      var ihGradients = this.dSigmoid(hidden)
                            .optSpecialMultiply(hiddenErrs)
                            .optMultiplyConst(LEARNING_RATE)

      var ihDeltaWeight = ihGradients.optMultiplyMatrix(input.transpose());
      if(verbose){
        console.log("I-H weight delta");
        ihDeltaWeight.print();
      }
      this.layers["I-H"] = this.layers["I-H"].optAddMatrix(ihDeltaWeight);
      this.layers["Hidden"] = this.layers["Hidden"].optAddMatrix(ihGradients);
      if(verbose) console.log("---------------- End ----------------");
    }
  }

  //Calculate once from input layer to output layer
  feedForward(dataSet){
    var iMatrix = this.layers["Input"]
    var ihEdges = this.layers["I-H"]
    var hMatrix = this.layers["Hidden"]
    var hoEdges = this.layers["H-O"]
    var oMatrix = this.layers["Output"]
    var intermediate = new Object();
    var matrix = this.trainConfig(dataSet)
    intermediate.inputMatrix = matrix.clone()
    matrix = ihEdges.optMultiplyMatrix(matrix)
    matrix = matrix.optAddMatrix(hMatrix)
    matrix = this.sigmoid(matrix)
    intermediate.hiddenMatrix = matrix.clone()
    matrix = hoEdges.optMultiplyMatrix(matrix)
    matrix = matrix.optAddMatrix(oMatrix)
    matrix = this.sigmoid(matrix)
    intermediate.outputMatrix = matrix.clone()
    return intermediate;
  }

  inputLayer(length){
    this.layers["Input"] = new Matrix(length,1).fill(0);
    return this;
  }

  outputLayer(length){
    var m = new Matrix(length, 1);
    for(var i=0; i<length; i++) m.add(Calc.randomWeight());
    this.layers["Output"] = m;
    return this;
  }

  hiddenLayer(){
    var length = Object.keys(this.layers["Input"]).length * 2/3 +
                        Object.keys(this.layers["Output"]).length;
    var h = new Matrix(length, 1);
    for(var i=0; i<length; i++) h.add(Calc.randomWeight());
    this.layers["Hidden"] = h;
    this.edges("I-H", h.size(), this.getLayerSize("Input"));
    this.edges("H-O", this.getLayerSize("Output"), h.size());
    return this;
  }

  edges(name, row, col){
    var e = new Matrix(row, col);
    for(var i=0; i<row*col; i++) e.add(Calc.randomWeight());
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
