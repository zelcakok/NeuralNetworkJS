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

async function train(trainData, testCases=null, converted=null){
  var graph = new Graph(), classifier, testResult;
  graph.dataSet(trainData, 500)
  graph.train(100, true);
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
var testData = [
  {input: [-0,-40,-30,-50], answer:"A", threshold: 0.2},
  {input: [-40,-0,-50,-30], answer:"B", threshold: 0.2},
  {input: [-30,-50,-0,-40], answer:"C", threshold: 0.2},
  {input: [-50,-30,-40,-0], answer:"D", threshold: 0.2}
]
train(trainData, testData, converted);

// classify(["1","2","3","4","5"]);
