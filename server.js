console.log("server starting .....");


const fs = require('fs');
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const request = require('request');


let app = express();


//one random word http://www.desiquintans.com/noungenerator?count=1
//text file : http://www.desiquintans.com/downloads/nounlist/nounlist.txt
// request("http://www.desiquintans.com/noungenerator?count=1",function(error,response,body){
//
//   console.log(body);
// });
let correct = "";
let words = [];
let clientList = [];
let turns = {};
let paired = {};
let pairs = {};
let server = app.listen(6677);
let io = socket(server);

//read the file containing the words
let content = fs.readFileSync("nouns.txt", 'utf8');


words = content.toString().split('\n');
//console.log(words[words.length - 2]);


app.use(express.static('public'));

//detect a new client
io.sockets.on('connection', newConnection);



function hookUp(socket, socketId) {
  let madeUp = false;
  for (let id of Object.keys(paired)) {
    if (id == socketId)
      continue;
    else {
      if (paired[id] == false) {
        paired[id] = true;
        paired[socketId] = true;
        pairs[socketId] = id;
        pairs[id] = socketId;
        madeUp = true;
        console.log("[+] HOOK UP SUCCESSFUL : " + socketId + " hooked up with " +
          id);

        //at first set turns randomly
        turns[socketId] = "draw";
        turns[pairs[socketId]] = "guess";
        //choose a random word from list
        correct = words[Math.ceil(Math.random() * (words.length - 2))].replace(
          ' ', '');
        correct = String(correct);
        correct = correct.slice(0, correct.length - 1)

        //clear your screen when u have been connected to  a new player

        socket.broadcast.to(pairs[socketId]).emit('clearInstruction',
          'clear your screen dood');


        socket.emit('clearInstruction',
          'clear your screen dood');

        socket.broadcast.to(pairs[socketId]).emit('guesser', turns[pairs[
          socketId]]);
        socket.emit('drawer', "draw");
        let flag = 0;
        let ok = socket.emit("wordToDraw", [turns[socketId], correct], success);
        //checking if its not the same client
        function success(data) {
          flag = 1;
        }
        if (flag === 0) {
          socket.broadcast.to(socketId).emit('drawer',
            "draw");
          socket.broadcast.to(socketId).emit('clearInstruction',
            'clear your screen dood');
          socket.broadcast.to(socketId).emit("wordToDraw", [turns[
            socketId], correct]);
        }
        socket.broadcast.to(pairs[socketId]).emit("wordToDraw", [turns[pairs[
          socketId]], "your turn to guess"]);


      }

    }
  }
  if (madeUp == false)
    console.log("[-] waiting for a hookup. No other players found online :(");


}



function newConnection(socket) {
  let pair;
  clientList.push(socket.id); //keep  track of all the clients currently connected to the server
  paired[socket.id] = false;
  pairs[socket.id] = undefined;
  console.log("[+] new client connected with id :" + socket.id);

  // this is where I 'hookup' different clients

  hookUp(socket, socket.id);
  // for (let one of Object.keys(pairs)) {
  //   if (turns[one] == "draw") {
  //     socket.broadcast.to(one).emit("showText", correct);
  //
  //   } else if (turns[pairs[one]] == "guess") {
  //
  //     socket.broadcast.to(pairs[one]).emit("showText", correct);
  //
  //   }
  //
  // }



  //  console.log(socket.id + turns[socket.id]);

  //receive location data from one client
  socket.on('positionData', getData);
  socket.on('guess', checkGuess);
  //  socket.on('WhatIsMyRole', checkRole);

  function checkRole(data) {
    socket.broadcast.to(socket.id).emit('role', turns[socket.id].toString());
  }

  function getData(data) {
    // send location data to a selected client only using my hookup mechanism

    if (pairs[socket.id] != undefined) {
      socket.broadcast.to(pairs[socket.id]).emit('positionData', data);
    } else
      console.log("[-] waiting for a hookup. No other players found online :(");
  }

  function checkGuess(guess) {
    console.log(correct);
    //check if the guess is correct !
    if (guess.replace(" ", "") == correct.replace(" ", "") && turns[socket.id] ==
      "guess") {
      console.log("correct");
    }
    //check if the guess is the right word or is a related word
    //and keep changing turns :)
    console.log(socket.id + turns[socket.id]);

  }


  // detect a leaving client
  socket.on('disconnect', function() {
    console.log("[-] client disconnected with id :" + socket.id);
    let indexToRemove = clientList.indexOf(socket.id);
    paired[pairs[socket.id]] = false;
    pairs[pairs[socket.id]] = undefined;
    pair = pairs[socket.id];
    pairs[socket.id] = undefined;
    turns[socket.id] = undefined;
    turns[pair] = undefined;
    hookUp(socket, pair)
    clientList.splice(indexToRemove, 1);
    remainingClients();
  });

}



function remainingClients() {

  console.log("\n**********REMAINING CLIENTS***********\n");
  for (let sid of clientList) {
    console.log(sid + '\n');
  }

}
