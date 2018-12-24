const Matrix = require("./Matrix");
const Graph = require("./Graph");
const Zetabase = require("./Zetabase");

function convert(inputs){
  var output = [];
  for(var i=0; i<inputs.length; i++)
    output[inputs[i]] = i / (inputs.length - 1);
  return output;
}

function revert(converted, expected, output, threshold){
  var error = Math.abs(converted[expected] - output);
  var result = {
    testCase: expected,
    expected: converted[expected],
    actual: output,
    error: error,
    isAccepted: error <= threshold
  }
  console.log(JSON.stringify(result, null, ' '));
}

function trainData(converted, inputSize, outputSize){
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

async function train(trainData, converted=null){
  var graph = new Graph(), classifier, testResult;
  graph.dataSet(trainData, 100)
  graph.train(100, false);
  console.log(converted);
  testResult = graph.test({input: [-15,-Math.sqrt(15*15 + 40*40),-15,-Math.sqrt(15*15 + 40*40)]})
  revert(converted, "A", testResult.read(0,0), 0.5);

  // testResult = graph.test({input: [-40,-0,-50,-30]})
  // revert(converted, "B", testResult.read(0,0), 0.1);
  //
  // testResult = graph.test({input: [-30,-50,-0,-40]})
  // revert(converted, "C", testResult.read(0,0), 0.1);
  //
  // testResult = graph.test({input: [-50,-30,-40,-0]})
  // revert(converted, "D", testResult.read(0,0), 0.1);

  // Zetabase.save(graph);
  // Object.keys(converted).map((classifier)=>{
  //   testResult = graph.test({input: [converted[classifier]]});
  //   revert(converted, classifier, testResult.read(0,0), 0.1);
  // })
}

async function classify(classifier){
  var converted = convert(classifier);
  var graph = Graph.restore(await Zetabase.restore());
  Object.keys(converted).map((classifier)=>{
    testResult = graph.test({input: [converted[classifier]]});
    revert(converted, classifier, testResult.read(0,0), 0.1);
  })
}

console.clear();
var classifier = ["A", "B", "C", "D"];
var converted = convert(classifier);
var trainData = {
    inputSize: 4,
    outputSize: 1,
    dataSet: [
      {input: [-0,-40,-30,-50], answer:converted["A"]},
      {input: [-40,-0,-50,-30], answer:converted["B"]},
      {input: [-30,-50,-0,-40], answer:converted["C"]},
      {input: [-50,-30,-40,-0], answer:converted["D"]}
    ]
}
train(trainData, converted);

// classify(["1","2","3","4","5"]);
