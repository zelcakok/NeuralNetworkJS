const fs = require("fs");

class Zetabase {
  static save(graph){
    fs.writeFileSync("./Graph.json", JSON.stringify(graph), (error)=>{
      if(error) console.log(error);
    })
  }

  static restore(){
    return new Promise((resolve, reject)=>{
      fs.readFile("./Graph.json", (err, json)=>{
        if(err) throw err;
        var graph = JSON.parse(json);
        resolve(graph);
      })
    });
  }
}
module.exports = Zetabase;
