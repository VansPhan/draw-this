var express = require('express');
var mongoose = require('mongoose');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

mongoose.connect("mongodb://localhost/drawing");
var Message = mongoose.model("Message", new mongoose.Schema({
  text: String
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

io.on('connection', function(socket){
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
    if (msg) Message.create({text: msg});
  });
  socket.on('delete message', function(msg) {
    io.emit('delete message', msg);
    Message.findOneAndRemove({ _id: msg._id }).then(function() {
      console.log("Deleted")
    });
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});