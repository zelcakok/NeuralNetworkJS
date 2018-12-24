const Zetabase = require("./Zetabase");
const Graph = require("./Graph");
class NeuralNetwork {
  constructor(trainData, testData) {
    this.trainData = trainData;
    this.testData = testData;
  }

  static convert(inputs){
    var output = [];
    for(var i=0; i<inputs.length; i++)
      output[inputs[i]] = i / (inputs.length - 1);
    return output;
  }

  revert(converted, expected, output, threshold){
    var error = Math.abs(converted[expected] - output);
    var result = {
      testCase: expected,
      expected: converted[expected],
      actual: output,
      error: error,
      threshold: threshold,
      isAccepted: error <= threshold,
    }
    console.log(JSON.stringify(result, null, ' '));
  }

  trainData(converted, inputSize, outputSize){
    var train = {
      inputSize: inputSize,
      outputSize: outputSize,
      dataSet: []
    }
    Object.keys(converted).map((classifier)=>{
      train.dataSet.push({
        input: [converted[classifier]],
        answer: converted[classifier]
      })
    })
    return train;
  }

  async train(testCases=null, converted=null, verbose=false){
    var graph = Graph.restore(await Zetabase.restore());
    var classifier, testResult;
    graph.dataSet(this.trainData, 500)
    graph.train(100, verbose);
    Zetabase.save(graph);
    if(!testCases) return;
    console.log("Classifiers");
    console.log(converted);
    console.log();
    for(var i=0; i<testCases.length; i++){
      var testCase = testCases[i];
      testResult = graph.test({input: testCase.input})
      this.revert(converted, testCase.answer, testResult.read(0,0), testCase.threshold);
    }
  }

  async classify(testCases, classifiers){
    var converted = NeuralNetwork.convert(classifiers);
    console.log("Classifiers");
    console.log(converted);
    console.log();
    var graph = Graph.restore(await Zetabase.restore());
    for(var i=0; i<testCases.length; i++){
      var testCase = testCases[i];
      var testResult = graph.test({input: testCase.input})
      this.revert(converted, testCase.answer, testResult.read(0,0), testCase.threshold);
    }
  }
}
module.exports = NeuralNetwork;
