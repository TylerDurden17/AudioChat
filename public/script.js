//get a reference to socket, pass in the path that you need to call
const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container')
const person = prompt("Please enter your name");
const connectedUsers = document.getElementById('connected-users');

const zeroUsers = document.createElement('div');

if(videoGrid.innerHTML==="") {
    zeroUsers.innerText = 'Wait until people join or add you'
    videoGrid.append(zeroUsers)
}

var myPeer = new Peer();
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, person);
})

const myVideo = document.createElement('video')
myVideo.muted = true;
//myVideo.style.border = '1px solid red'
const personName = document.createElement('div');
const personNameInside = document.createElement('div');
const nextPerson = document.createElement('div');
const nextPersonInside = document.createElement('div');

myPeer.on('call', async call => {
    const answerCall = document.createElement('button');
    answerCall.innerText = 'answer call';
    answerCall.classList.add("button-5");
    document.getElementById('joinAudioCallButton').append(answerCall);

    const videoContainer = document.createElement('div');
    videoContainer.setAttribute("id", "videoContainer");
    personNameInside.innerText = `${call.metadata.name} 🔊`
    personName.append(personNameInside)

    answerCall.addEventListener('click', () => {
        let audioTrack = null;
        toggleMute.addEventListener('click', () => {
            audioTrack.enabled = !audioTrack.enabled;
            toggleMute.innerText = audioTrack.enabled ? 'Mute Mic' : 'Unmute Mic';
        })
        navigator.mediaDevices.getUserMedia({
            video:false,
            audio:true
        }).then(stream => {
            //mute unmute botton
            audioTrack = stream.getAudioTracks()[0];
            //addVideoStream(myVideo, stream);
            //answer their call, and send my stream
            call.answer(stream);
            //addVideoStream(myVideo, stream, videoContainer, personName);
            //addMyVideo();

            //every userId is directly linked to every call we make
            peers[call.peer] = call;
        });
        answerCall.remove();
    })
    const videoo = document.createElement('video');
    // const rub = document.createElement('div')
    // connectedUsers.append(rub)
    //videoo.muted = true;
    await call.on('stream', userVideoStream => {
      addVideoStream(videoo, userVideoStream, videoContainer, personName)
      //rub.append(personName)
        if(videoGrid.innerHTML!="") {
            zeroUsers.remove()
        }
    })
    //when someone closes their video
    call.on('close', () => {
        videoContainer.remove();
        // Remove the reference to the call from your peers object
        delete peers[call.peer];
        personName.innerText = "";
        call.metadata.name = "";
        console.log('some');
    });
})
const toggleMute = document.getElementById("toggleMute");

//to allow ourselves to be connected to other users
socket.on('user-connected', (userId, connectedPerson) => {
    appendMessage(`${connectedPerson} connected`);
    const myName = person;
    console.log(myName);
    const addMe = document.createElement('button');
    addMe.classList.add("button-5");
    addMe.innerText=`add ${connectedPerson}`
    document.getElementById('joinAudioCallButton').append(addMe);

    let audioTrack = null;
    toggleMute.addEventListener('click', () => {
        audioTrack.enabled = !audioTrack.enabled;
        toggleMute.innerText = audioTrack.enabled ? 'Mute Mic' : 'Unmute Mic';
    })
    addMe.addEventListener('click', () => {

        navigator.mediaDevices.getUserMedia({
            video:false,
            audio:true
        }).then(stream => {
            //to mute mic
            audioTrack = stream.getAudioTracks()[0];
            //to allow ourselves to be connected to other users
            connectToNewUser(userId, stream, connectedPerson, myName);
            //addMyVideo();
            addMe.remove();
        });
    })
});

messageForm.addEventListener('submit', e => {
    //to stop our form from submitting also from posting it the server.
    e.preventDefault()
    const message = messageInput.value;
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', message)
    messageInput.value = ''
    sendButton.disabled = true;
})

socket.on('chat-message', data => {
    appendMessage(`${data.connectedPerson}: ${data.message}`)
})

socket.on('user-disconnected', (userId, connectedPerson) => {
    appendMessage(`${connectedPerson} disconnected`);
    if (peers[userId]) {
        peers[userId].close()
        delete peers[call.peer];
        personName.innerText = ""
        nextPerson.innerText = ""
    }
})

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
//peers is going to be an empty object
const peers = {}
//const people = {person:userId}
//make calls
async function connectToNewUser(userId, stream, connectedPerson, myName) {
    const options = {metadata: {"name": myName}}
    //to call a user we call this with a destination id and our stream
    const call = myPeer.call(userId, await stream, options);

    const video = document.createElement('video')
    //const rubb = document.createElement('div')
    const videoContainer = document.createElement('div');
    videoContainer.setAttribute("id", "videoContainer");
    nextPersonInside.innerText = `${connectedPerson} 🔊`
    nextPerson.append(nextPersonInside)
    //connectedUsers.append(rubb)
    //video.muted = true
    //when they send us back their stream
    //why is this code running twice
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, videoContainer, nextPerson);
        if(videoGrid.innerHTML!="") {
            zeroUsers.remove()
        }
    })

    //when someone closes their video
    call.on('close', () => { 
        videoContainer.remove();
        //rubb.remove();
        delete peers[userId];
    });

    //every userId is directly linked to every call we make
    peers[userId] = call;
}

function addVideoStream(video, stream, videoContainer, nextPerson) {
    video.srcObject = stream
    //once the stream is loaded play
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(videoContainer)
    videoContainer.append(video)
    videoContainer.append(nextPerson)
}

function addMyVideoStream(video, stream) {
    const videoContainer = document.createElement('div');
    videoContainer.setAttribute("id", "videoContainer");
    video.srcObject = stream
    //once the stream is loaded play
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    videoGrid.append(videoContainer)
    videoContainer.append(video);

    const you = document.createElement('div')
    const youInside = document.createElement('div');
    youInside.innerText='You'
    videoContainer.append(you);
    you.append(youInside)
}

//closure so this function runs only once when called
// const addMyVideo = ( () => {
//     var executed = false;
//     return () => {
//       if(!executed) {
//         executed = true;
//         navigator.mediaDevices.getUserMedia({
//             video:false,
//             audio:false
//         }).then(stream => {
//             addMyVideoStream(myVideo, stream);
//         });
//       }
//     }
// })();

//disable send message button when input is empty
const messageContent = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

messageContent.addEventListener("input", () => {
    sendButton.disabled = messageContent.value.trim() === ""
});

//==============================================================================
// const disconnectBtn = document.createElement('button');
// disconnectBtn.innerText="disconnect"
// document.getElementById('joinAudioCallButton').append(disconnectBtn);

// disconnectBtn.addEventListener('click', () => {
//     socket.emit('disconnect-user');
// });

socket.on('disconnect', () => {
    console.log('You have been disconnected');
    alert('You have been disconnected.');
});