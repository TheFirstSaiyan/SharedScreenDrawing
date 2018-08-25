console.log("server starting .....");


const http=require('http');
const fs=require('fs');
const express=require('express');
const socket =require('socket.io');

let clientList=[];
let paired={};
let pairs={};
let app=express();
let server=app.listen(6677);
let io=socket(server);

app.use(express.static('public'));

//detect a new client
io.sockets.on('connection',newConnection);


function newConnection(socket)
{
  let pair;
  clientList.push(socket.id);         //keep  track of all the clients currently connected to the server
  paired[socket.id]=false;
  pairs[socket.id]=undefined;
  console.log("[+] new client connected with id :" + socket.id);

  // this is where i 'hookup' different clients
  let madeUp = false;
  for(let id of Object.keys(paired))
  {
  if(id==socket.id)
      continue;
  else
  {
      if(paired[id]==false)
      {
        paired[id]=true;
        paired[socket.id]=true;
        pairs[socket.id]=id;
        pairs[id]=socket.id;
        madeUp=true;
        console.log( "[+] HOOK UP SUCCESSFUL : " +socket.id +" hooked up with " + id);
        //clear your screen when u have been connected to  a new player
        socket.broadcast.to(pairs[socket.id]).emit('clearInstruction','clear your screen dood');

      }

  }
  }
  if(madeUp==false)
        console.log("[-] waiting for a hookup. No other players found online :(");




  //receive location data from one client
  socket.on('positionData',getData);


  function getData(data)
  {


//    //socket.broadcast.emit('positionData',data);   //b4 when i planned to send to all machines/clients

    // send location data to a selected client only using my hookup mechanism

    if(pairs[socket.id]!=undefined)
    {
      socket.broadcast.to(pairs[socket.id]).emit('positionData',data);
    }
    else
      console.log("waiting for a hookup. No other players found online :(");
  }

  // detect a leaving client
  socket.on('disconnect',function (){
    console.log("[-] client disconnected with id :" + socket.id);
    let indexToRemove=clientList.indexOf(socket.id);
    paired[pairs[socket.id]]=false;
    pairs[pairs[socket.id]]=undefined;

    pairs[socket.id]=undefined;
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
