console.log("server starting .....");


const http=require('http');
const fs=require('fs');
const express=require('express');
const socket =require('socket.io');
const request=require('request');
//one random word http://www.desiquintans.com/noungenerator?count=1
//text file : http://www.desiquintans.com/downloads/nounlist/nounlist.txt
// request("http://www.desiquintans.com/noungenerator?count=1",function(error,response,body){
//
//   console.log(body);
// });

let clientList=[];
let turns={};
let paired={};
let pairs={};
let app=express();
let server=app.listen(6677);
let io=socket(server);

app.use(express.static('public'));

//detect a new client
io.sockets.on('connection',newConnection);



function hookUp(socket,socketId)
{
  let madeUp = false;
  for(let id of Object.keys(paired))
  {
  if(id==socketId)
      continue;
  else
  {
      if(paired[id]==false)
      {
        paired[id]=true;
        paired[socketId]=true;
        pairs[socketId]=id;
        pairs[id]=socketId;
        madeUp=true;
        console.log( "[+] HOOK UP SUCCESSFUL : " +socketId +" hooked up with " + id);

        //at first set turns randomly
        turns[socketId]="draw";
        turns[pairs[socketId]]="guess";

        //clear your screen when u have been connected to  a new player
        socket.broadcast.to(pairs[socketId]).emit('clearInstruction','clear your screen dood');
        socket.broadcast.to(socketId).emit('clearInstruction','clear your screen dood');

      }

  }
  }
  if(madeUp==false)
        console.log("[-] waiting for a hookup. No other players found online :(");


}

function newConnection(socket)
{
  let pair;
  clientList.push(socket.id);         //keep  track of all the clients currently connected to the server
  paired[socket.id]=false;
  pairs[socket.id]=undefined;
  console.log("[+] new client connected with id :" + socket.id);

  // this is where i 'hookup' different clients

    hookUp(socket,socket.id);

console.log(socket.id + turns[socket.id]);

  //receive location data from one client
  socket.on('positionData',getData);
  socket.on('guess',checkGuess);

  function getData(data)
  {
    // send location data to a selected client only using my hookup mechanism

    if(pairs[socket.id]!=undefined)
    {
      socket.broadcast.to(pairs[socket.id]).emit('positionData',data);
    }
    else
      console.log("[-] waiting for a hookup. No other players found online :(");
  }

  function checkGuess(guess)
  {
    console.log(guess);
    //check if the guess is the right word or is a related word
    //and keep changing turns :)
    console.log(socket.id + turns[socket.id]);

  }


  // detect a leaving client
    socket.on('disconnect',function (){
    console.log("[-] client disconnected with id :" + socket.id);
    let indexToRemove=clientList.indexOf(socket.id);
    paired[pairs[socket.id]]=false;
    pairs[pairs[socket.id]]=undefined;
    pair=pairs[socket.id];
    pairs[socket.id]=undefined;
    turns[socket.id]=undefined;
    turns[pair]=undefined;
    hookUp(socket,pair)
    clientList.splice(indexToRemove,1);
    remainingClients();
  });

}



function remainingClients()
{

  console.log("\n**********REMAINING CLIENTS***********\n");
  for(let sid of clientList)
  {
    console.log(sid+'\n');
  }

}
