
// simple_chart_config = {
// 	chart: {
// 		container: "#tree-simple"
// 	},

// 	nodeStructure: {
// 		text: { name: "Question" },
// 		children: [
// 		{
// 			text: { name: "Answer 1" }
// 		},
// 		{
// 			text: { name: "Answer 2" }
// 		}
// 		]
// 	}
// };


var simple_chart_config = {
	chart: {
		container: "#tree-simple"
	},

	nodeStructure: {
		text: { name: "Question" },
		children: [
		{
			text: { name: "Answer 1" }
			
		}
		]
	}
};

// var my_chart = new Treant(simple_chart_config);
// var chart = new Treant(simple_chart_config, function() { alert( 'Tree Loaded' ) }, $ );
var chart = new Treant(simple_chart_config, null, $ );
document.getElementById("demo").innerHTML = simple_chart_config.nodeStructure.text.name;


function myFunction(){
	// document.getElementById("changeNode").innerHTML = "Hello World";
	// var myString = '{"text": { "name": "Parent nodexxx" },"children": [{"text": { "name": "First childxx" }},{"text": { "name": "Second childxx" }}]}';

	// var newQ = {text:{name:'new question 1'}};
	// simple_chart_config.nodeStructure.children[0]['children'] = newQ;

	
	// var newAns =  {text: {name:'new answer'}};
	// simple_chart_config.nodeStructure.children.push(newAns); //this is how to add a child when there already is a child

	// var subQstr = '{"children": [{"text": { "name": "First childxx" }}]}'
	// var subQstr = '{"text": { "name": "First childxx" }}'
	// var subQ = JSON.parse(subQstr);
	simple_chart_config.nodeStructure.children[0].children = [{text: { name: "Question 2" }}]; //this worksssss

	// var obj = JSON.parse(myString);

	// simple_chart_config.nodeStructure = obj; 
	chart.destroy()
	chart = new Treant(simple_chart_config, null, $);
	var str = JSON.stringify(simple_chart_config.nodeStructure.children[0], null, 2);
	// console.log(str);
	var depth = getDepth(simple_chart_config.nodeStructure);
	console.log(depth);
	// console.log(simple_chart_config.nodeStructure.children[0].children.depth);
}


function createDialogNode(){ //arg should be text
/* this funciton wants to create essentially a node in a graph
 there should be a a child button that adds a new node as a 
 child to this, and some kind of visual link between the two
 this should maybe be a JS class or object then?  */

 var dNode = document.createElement('dNode');
	// dNode.class = 'dialogNode';
	var btn = document.createTextNode('click me');
	
	btn.class = 'dBoxAddChildButton';
	dNode.appendChild(btn);
	// dNodeID++;
}

class dBox{
	constructor(text){
		this.text = text;
	}

	update(){

	}
}

// gets the max depth of a node (need simple_chart_config.nodeStructure, not simple_chart_config)
getDepth = function (obj) {
	var depth = 0;
	if (obj.children) {
		obj.children.forEach(function (d) {
			var tmpDepth = getDepth(d)
			if (tmpDepth > depth) {
				depth = tmpDepth
			}
		})
	}
	return 1 + depth
}

function addChild(obj,child){
	if (obj.children){

	} else {
		obj.children
	}
}


