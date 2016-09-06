var express = require('express');
var mongoose = require('mongoose');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

mongoose.connect("mongodb://localhost/drawing");
var Message = mongoose.model("Message", new mongoose.Schema({
  text: String
}));

var Image = mongoose.model("Image", new mongoose.Schema({
  imgBase64: String
}));

app.use("/assets", express.static("public"));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get("/api/messages", function (req, res) {
  Message.find({}).lean().exec().then(function (messages) {
    res.json(messages);
  })
})

app.get("/api/images", function (req, res) {
  Image.find({}).lean().exec().then(function (images) {
    res.json(images);
  })
})

io.on('connection', function(socket){
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
    if (msg) Message.create({text: msg});
  });
  socket.on('image', function(img) {
    io.emit('image', img);
    if (img) Image.create({imgBase64: img});
  });
  socket.on('delete message', function(msg) {
    io.emit('delete message', msg);
    Message.findOneAndRemove({ _id: msg._id }).then(function() {
    });
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});