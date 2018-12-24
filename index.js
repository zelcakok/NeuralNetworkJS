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
    threshold: threshold,
    isAccepted: error <= threshold,
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

async function train(trainData, testCases=null, converted=null, verbose=false){
  var graph = Graph.restore(await Zetabase.restore());
  var classifier, testResult;
  graph.dataSet(trainData, 500)
  graph.train(100, verbose);
  Zetabase.save(graph);
  if(!testCases) return;
  console.log("Classifiers");
  console.log(converted);
  console.log();
  for(var i=0; i<testCases.length; i++){
    var testCase = testCases[i];
    testResult = graph.test({input: testCase.input})
    revert(converted, testCase.answer, testResult.read(0,0), testCase.threshold);
  }
}

async function classify(testCases, classifiers){
  var converted = convert(classifiers);
  console.log("Classifiers");
  console.log(converted);
  console.log();
  var graph = Graph.restore(await Zetabase.restore());
  for(var i=0; i<testCases.length; i++){
    var testCase = testCases[i];
    testResult = graph.test({input: testCase.input})
    revert(converted, testCase.answer, testResult.read(0,0), testCase.threshold);
  }
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
var testData = [
  {input: [-5,-38,-33,-57], answer:"A", threshold: 0.25},
  {input: [-40,-6,-53,-35], answer:"B", threshold: 0.25},
  {input: [-18,-45,-1,-42], answer:"C", threshold: 0.25},
  {input: [-53,-26,-36,-9], answer:"D", threshold: 0.25}
]
train(trainData, testData, converted);
// classify(testData, classifier);
