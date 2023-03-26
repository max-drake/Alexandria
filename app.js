var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fetch = require('node-fetch');
const got = require('got');
const bodyParser = require('body-parser');
var fsp = require('fs').promises;
var fs = require('fs');
const tr = require('hookable-tree'); //tree library
// const ant = require('treantjs'); //better tree library?

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var topic = '';

const promptBP1 = 'The following is a conversation between a human designer and an advanced AI. The AI facillitates creative collaboration and likes new ideas. The human is attempting to brainstorm for a project in the field of '
const promptBP2 = '.\nHuman: Hi, how are you?\nAI: I\'m well, thanks. How can I help?\nHuman:'

// view engine setup
app.set('views', './views');
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.render('index')
});

app.post('/chatBot', async function(req,res){ 

  var sentText = req.body.testInput;
  var textToAppend = ' ' + sentText + '\n' + 'AI Collaborator:'
  
  fs.appendFileSync('./public/gptPrompts/chatLogTemp.txt', textToAppend, function (err) {
    if (err) throw err;
  });

  var textForGPT = await loadTempPrompt('./public/gptPrompts/chatLogTemp.txt');
  //console.log(textForGPT);
  var gptOutput = await textGen(textForGPT, 128, 1);

  fs.appendFile('./public/gptPrompts/chatLogTemp.txt', gptOutput + '\n' + 'Human:', function (err) {
    if (err) throw err;
  });
  //console.log(gptOutput);
  res.send(gptOutput);

});

app.post('/loadBP', function(req,res){

  fs.readFile('./public/gptPrompts/promptBoilerplate.txt', 'utf8', function(err, data) {
    if (err) throw err;
    // console.log(data);
    saveTempFile(data);
    res.send(data);
  });
  
});

app.post('/topicSelect', async function(req,res){
  var sentTopic = req.body.topicSelectText;
  topic = sentTopic;
  //console.log("topic is " + topic)
  var filledInTopicBP = promptBP1 + sentTopic + promptBP2;
  // console.log(filledInTopicBP);
  saveTempFile(filledInTopicBP);
  var starterQ = 'What is 1 provocative question in the field of '
  var topicStarter = await textGen(starterQ + topic + '?', 24, 1);
  
  res.send(topicStarter);

});

app.post('/tldr', async function(req,res){

  var tempLogString = './public/gptPrompts/chatLogTemp.txt';

  fs.appendFile(tempLogString, '\n' + 'TL;DR:', async function (err) {
    if (err) throw err;
    var tldrPrompt = await loadTempPrompt(tempLogString);
    var tldrAnswer = await textGen(tldrPrompt, 128, 1);//, 'tldr');
    res.send(tldrAnswer);
  });

});

app.post('/keywordGen', async function(req,res){
  var num = Math.random();
  var chanceThreshold = 0.5;
  if (num >= chanceThreshold){
    var str = 'List 1 keyword in the field of ';
  } else {
    var str = 'List 1 researcher or author in the field of ';
  }
  var keyword = await textGen(str + topic + '.', 12, 1);
  console.log(keyword);
  res.send(keyword);
});

app.post('/ideaSourceSummary', async function(req, res){
  var sentText = req.body.ideaSourceText;
  var cmd = 'Briefly summaraize ';
  // console.log(cmd+sentText);
  var summary = await textGen(cmd + sentText + '.', 60, 0.5);
  res.send(summary);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

///// TREE TESTING


var convoTree = tr.tree({children: [
  {
    name: 'start'
  }]});
var convoRoot = convoTree.find('/start');
convoRoot.append(tr.tree({name:'Hi how are you?'}));
var children = convoTree.find('/start').children();

//console.log(children[0].name());

///// END TREE TESTING

// the following are my functions

function saveTempFile(data){
  fs.writeFile('./public/gptPrompts/chatLogTemp.txt', data, err => {
    if (err) {
      console.error(err);
    }    
  });
}

async function loadTempPrompt(promptPath) {
  const data = await fsp.readFile(promptPath,'utf8');
  return data;
}

async function textGen(prompt, tokenLimit, temp) {

  const url = 'https://api.openai.com/v1/chat/completions'; //check api to get right url

  const params = {
    "model": "gpt-3.5-turbo",
    "messages": [{"role":"user", "content": prompt}],
    "max_tokens": tokenLimit,
    "temperature": temp,
    // "frequency_penalty": .5,
    "stop": ["AI Collaborator:", "Human:", "AI:"]
  }; 

  const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_SECRET_KEY}`,
  };

  try {
    const response = await got.post(url, {json: params, headers: headers}).json();
    output = `${response.choices[0].message.content}`;
  } catch (err) {
    console.log(err);
  }

  return output;
}
