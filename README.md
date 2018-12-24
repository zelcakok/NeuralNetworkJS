# Neural Network JS

## Objective

#### To resolve the RSSI value inconsistency in various mobile devices.

## How to test the project

1.  git clone https://gitlab.com/koktszhozelca/neuralnetworkjs.git
2.  cd neuralnetworkjs
3.  node index.js
    
## Sample output

```javascript
    Classifiers
    [ A: 0, B: 0.3333333333333333, C: 0.6666666666666666, D: 1 ]
    
    {
     "testCase": "A",
     "expected": 0,
     "actual": 0.019288308116581186,
     "error": 0.019288308116581186,
     "threshold": 0.25,
     "isAccepted": true
    }
    {
     "testCase": "B",
     "expected": 0.3333333333333333,
     "actual": 0.33326499415469285,
     "error": 0.00006833917864046413,
     "threshold": 0.25,
     "isAccepted": true
    }
    {
     "testCase": "C",
     "expected": 0.6666666666666666,
     "actual": 0.6563089728449829,
     "error": 0.010357693821683722,
     "threshold": 0.25,
     "isAccepted": true
    }
    {
     "testCase": "D",
     "expected": 1,
     "actual": 0.9807180651103524,
     "error": 0.01928193488964758,
     "threshold": 0.25,
     "isAccepted": true
    }
```
    
