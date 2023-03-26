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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var topic = '';
var main_transcript = [];

app.get('/', (req, res) => {
  res.render('index')
});

app.post('/chatBot', async function(req,res){ 

  var sentText = req.body.testInput; 
  var gptOutput = await textGen(sentText, main_transcript, 256, 1);

  res.send(gptOutput);

});

app.post('/chatReset', function(req,res) {
  let systemMessage = 'The following is a conversation between a human and an advanced AI assistant. The assistant facillitates creative collaboration and likes new ideas. This assistant also asks lots of questions to get the human to reflect on their work. The human is attempting to brainstorm for a project in the field of ';
  systemMessage = systemMessage + topic + ".";
  main_transcript = [];
  main_transcript = addToTranscript("system", systemMessage, main_transcript);
});

app.post('/topicSelect', async function(req,res) {
  // const promptBP1 = 'The following is a conversation between a human designer and an advanced AI assistant. The AI facillitates creative collaboration and likes new ideas. The human is attempting to brainstorm for a project in the field of ';
  // const promptBP2 = '.\nHuman: Hi, how are you?\nAI: I\'m well, thanks. How can I help?\nHuman:';

  let systemMessage = 'The following is a conversation between a human and an advanced AI assistant. The assistant facillitates creative collaboration and likes new ideas. This assistant also asks lots of questions to get the human to reflect on their work. The human is attempting to brainstorm for a project in the field of ';
  
  let sentTopic = req.body.topicSelectText;
  topic = sentTopic;
  systemMessage = systemMessage + topic + ".";
  main_transcript = addToTranscript("system", systemMessage, main_transcript);
  
  let starterQ = 'What is 1 provocative question in the field of ' + topic + '?';
  let topicStarter = await textGen(starterQ, [], 24, 1);
  
  res.send(topicStarter);

});

app.post('/tldr', async function(req,res){

  var temp_main_transcipt = main_transcript;
  var tldrPrompt = "Succintly summarize our conversation up until this point. Don't use 'you' or 'me', just summarize the information exchanged between us." 
  var tldr = await textGen(tldrPrompt, temp_main_transcipt, 256, 1);
  res.send(tldr);

});

app.post('/keywordGen', async function(req,res){
  var num = Math.random();
  var chanceThreshold = 0.5;
  if (num >= chanceThreshold){
    var str = 'List 1 keyword in the field of ';
  } else {
    var str = 'List 1 researcher or author in the field of ';
  }
  var keyword = await textGen(str + topic + '.', [], 24, 1);
  res.send(keyword);
});

app.post('/ideaSourceSummary', async function(req, res){
  var sentText = req.body.ideaSourceText;
  var cmd = 'Briefly summaraize ';
  var summary = await textGen(cmd + sentText + '.', [], 128, 0.5);
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

// functions

function addToTranscript(role, content, transcript) {
  let new_message =  {role: role, content: content};
  transcript.push(new_message);
  return transcript;
}

async function textGen(prompt, transcript, tokenLimit, temp) {
  
  transcript = addToTranscript("user", prompt, transcript);
  console.log(transcript);
  const url = 'https://api.openai.com/v1/chat/completions'; //check api to get right url

  const params = {
    "model": "gpt-3.5-turbo",
    "messages": transcript,
    "max_tokens": tokenLimit,
    "temperature": temp,
    "stop": ["AI Collaborator:", "Human:", "AI:"]
  }; 

  const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_SECRET_KEY}`,
  };

  try {
    const response = await got.post(url, {json: params, headers: headers}).json();
    var output_message_content = `${response.choices[0].message.content}`;
    var output_message = response.choices[0].message;
    transcript.push(output_message);
  } catch (err) {
    console.log(err);
  }

  return output_message_content;
}
