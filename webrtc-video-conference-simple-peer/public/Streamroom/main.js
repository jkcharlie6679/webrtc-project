/**
 * Socket.io socket
 */
let socket;
/**
 * The stream object used to send media
 */
let localStream = null;
/**
 * All peer connections
 */
let peers = {}
let roomID
let send
let userName = window.sessionStorage.getItem("Username");


const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');


const Closeroom = document.getElementById('Close_room')
const Leaveroom = document.getElementById('Leave_room')
const Closestream = document.getElementById('Close_stream')
const Leavestream = document.getElementById('Leave_stream')

const chatmessages = document.getElementById('chat-messages')

const carContainer = document.getElementById('car');
const arrowContainer = document.getElementById('arrow');
const diamondContainer = document.getElementById('diamond');
const doveContainer = document.getElementById('dove');
const giftContainer = document.getElementById('gift');
const microphoneContainer = document.getElementById('microphone');
const rocketContainer = document.getElementById('rocket');
const teddyContainer = document.getElementById('teddy');
const treatureContainer = document.getElementById('treature');
const universeContainer = document.getElementById('universe');
const rewardContainer = document.getElementById('reward');
const GiftMessageContainer = document.getElementById('GiftMessage');
const sengiftContainer = document.getElementById('sengift');




document.getElementById("logo_title").innerHTML = window.sessionStorage.getItem("identity") + "'s Room " ;
// redirect if not https
// if(location.href.substr(0,5) !== 'https')
    // location.href = 'https' + location.href.substr(4, location.href.length - 4)


//////////// CONFIGURATION //////////////////

/**
 * RTCPeerConnection configuration
 */
const configuration = {
    "iceServers": [{
            "urls": "stun:stun.l.google.com:19302"
        },
        // public turn server from https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b
        // set your own servers here
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        }
    ]
}

/**
 * UserMedia constraints
 */
let constraints = {
    audio: true,
    video: {
        width: 300,
        height: 300
    }
}

/////////////////////////////////////////////////////////

constraints.video.facingMode = {
    ideal: "user"
}

// enabling the camera at startup


function start(){
    joinRoom()
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        console.log('Received local stream');

        localVideo.srcObject = stream;
        localStream = stream;

        init()

    }).catch(e => alert(`getusermedia error ${e.name}`))
}

function joinRoom() {
    roomId = window.sessionStorage.getItem("roomid");
}

/**
 * initialize the socket connections
 */



socket = io('https://140.118.121.100:3012')
start()

function init() {

    
    socket.emit('join', roomId)

    socket.on('initReceive', socket_id => {
        console.log('INIT RECEIVE ' + socket_id)
        addPeer(socket_id, false)

        socket.emit('initSend', socket_id)
    })

    socket.on('initSend', socket_id => {
        console.log('INIT SEND ' + socket_id)
        addPeer(socket_id, true)
    })

    socket.on('removePeer', socket_id => {
        console.log('removing peer ' + socket_id)
        removePeer(socket_id)
    })

    socket.on('disconnect', () => {
        console.log('GOT DISCONNECTED')
        for (let socket_id in peers) {
            removePeer(socket_id)
        }
    })

    socket.on('signal', data => {
        peers[data.socket_id].signal(data.signal)
    })
}

/**
 * Remove a peer with given socket_id. 
 * Removes the video element and deletes the connection
 * @param {String} socket_id 
 */
function removePeer(socket_id) {

    let videoEl = document.getElementById(socket_id)
    if (videoEl) {

        const tracks = videoEl.srcObject.getTracks();

        tracks.forEach(function (track) {
            track.stop()
        })

        videoEl.srcObject = null
        videoEl.parentNode.removeChild(videoEl)
    }
    if (peers[socket_id]) peers[socket_id].destroy()
    delete peers[socket_id]
}

/**
 * Creates a new peer connection and sets the event listeners
 * @param {String} socket_id
 *                 ID of the peer
 * @param {Boolean} am_initiator
 *                  Set to true if the peer initiates the connection process.
 *                  Set to false if the peer receives the connection.
 */
function addPeer(socket_id, am_initiator) {
    peers[socket_id] = new SimplePeer({
        initiator: am_initiator,
        stream: localStream,
        config: configuration
    })

    peers[socket_id].on('signal', data => {
        socket.emit('signal', {
            signal: data,
            socket_id: socket_id
            //data: send
        })
        //console.log(send)
    })

    peers[socket_id].on('stream', stream => {
        let newVid = document.createElement('video')
        newVid.srcObject = stream
        newVid.id = socket_id
        newVid.playsinline = false
        newVid.autoplay = true
        newVid.className = "vid"
        newVid.onclick = () => openPictureMode(newVid)
        newVid.ontouchstart = (e) => openPictureMode(newVid)
        videos.appendChild(newVid)
    })
}

/**
 * Opens an element in Picture-in-Picture mode
 * @param {HTMLVideoElement} el video element to put in pip mode
 */
function openPictureMode(el) {
    console.log('opening pip')
    el.requestPictureInPicture()
}

/**
 * Switches the camera between user and environment. It will just enable the camera 2 cameras not supported.
 */
function switchMedia() {
    if (constraints.video.facingMode.ideal === 'user') {
        constraints.video.facingMode.ideal = 'environment'
    } else {
        constraints.video.facingMode.ideal = 'user'
    }

    const tracks = localStream.getTracks();

    tracks.forEach(function (track) {
        track.stop()
    })

    localVideo.srcObject = null
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {

        for (let socket_id in peers) {
            for (let index in peers[socket_id].streams[0].getTracks()) {
                for (let index2 in stream.getTracks()) {
                    if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                        peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                        break;
                    }
                }
            }
        }

        localStream = stream
        localVideo.srcObject = stream

        updateButtons()
    })
    console.log("ddd")
}

/**
 * Enable screen share
 */
function setScreen() {
    navigator.mediaDevices.getDisplayMedia().then(stream => {
        for (let socket_id in peers) {
            for (let index in peers[socket_id].streams[0].getTracks()) {
                for (let index2 in stream.getTracks()) {
                    if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                        peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                        break;
                    }
                }
            }
        }
        localStream = stream

        localVideo.srcObject = localStream
        socket.emit('removeUpdatePeer', '')
    })
    updateButtons()
}

/**
 * Disables and removes the local stream and all the connections to other peers.
 */
function removeLocalStream() {
    if (localStream) {
        const tracks = localStream.getTracks();

        tracks.forEach(function (track) {
            track.stop()
        })

        localVideo.srcObject = null
    }

    for (let socket_id in peers) {
        removePeer(socket_id)
    }
}

/**
 * Enable/disable microphone
 */
function toggleMute() {
    for (let index in localStream.getAudioTracks()) {
        localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    }
    console.log("aaa")
}
/**
 * Enable/disable video
 */
function toggleVid() {
    for (let index in localStream.getVideoTracks()) {
        localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
    console.log("ddd")
}

/**
 * updating text of buttons
 */
function updateButtons() {
    for (let index in localStream.getVideoTracks()) {
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
    for (let index in localStream.getAudioTracks()) {
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    }
}

socket.on('message', message=>{
    console.log(message);
    outputMessage(message);
});


socket.on('sent_close', () =>{
    document.getElementById("logo_title").innerHTML = " The room is close ! See you next time";
});


chatForm.addEventListener('submit',(e) =>{
    e.preventDefault();
    const msg = new Date().Format("hh:mm") + ' ' + userName + ' :' + e.target.elements.msg.value;
    e.target.elements.msg.value = ''
    socket.emit('chatMessage', msg);
});

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class="text">
      ${message}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
    chatmessages.scrollTop = chatmessages.scrollHeight;
}
setTimeout(function(){
    msg_send(userName + ' join the room')}
    ,2000);

function msg_send(msg){
    socket.emit('chatMessage', msg);
}

// socket.emit('chatMessage', 'asd');
roomidentity()
function roomidentity(){
    let identity  = window.sessionStorage.getItem("people");

    if(identity == 'customer'){
        Closeroom.style = 'display: none'
        Leaveroom.style = 'display: block'
    }
    else if(identity == 'streamer'){
        Closeroom.style = 'display: block'
        Leaveroom.style = 'display: none'
    }
}

Closestream.addEventListener('submit', function (e) {
    e.preventDefault();
    let account = window.sessionStorage.getItem("Account");

    let param = "https://140.118.121.100:5000/account/close?S_Account="+account;
    console.log(param);
    fetch(param,{
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain',
          'Content-Type': 'application/json'
        }
      }).then(response => {
        return response.json()
      }) 
      .then( (data) =>{
        close(data)
      })
})

function close(data){
    swal("Success", "Room has already closed", "success", {timer: 2000
        ,showConfirmButton: false});
    setTimeout(function(){
      window.location.href="../index.html"}
      ,2000);
    socket.emit('close');
}


Leavestream.addEventListener('submit', function (e) {
    msg_send(userName + ' leave the room')
    e.preventDefault();
    swal("Success", "See you next time", "success", {timer: 2000
        ,showConfirmButton: false});
    setTimeout(function(){
      window.location.href="../index.html"}
      ,2000);

})

Date.prototype.Format = function (fmt) { 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}



/*========gift-------------*/



sendgift()
function sendgift(){
    let identity  = window.sessionStorage.getItem("people");
    carContainer.style = 'display:none';
    arrowContainer.style = 'display:none';
    diamondContainer.style = 'display:none';
    doveContainer.style = 'display:none';
    giftContainer.style = 'display:none';
    microphoneContainer.style = 'display:none';
    rocketContainer.style = 'display:none';
    teddyContainer.style = 'display:none';
    treatureContainer.style = 'display:none';
    universeContainer.style = 'display:none';
    GiftMessageContainer.style = 'display:none';
    rewardContainer.style = 'display:none;';

    if(identity == 'customer'){
        sengiftContainer.style = 'display:block;';
    }
    else if(identity == 'streamer'){
        sengiftContainer.style = 'display:none'
    }
}

var status = 0;
function showreward(){
    if(status == 0){
        rewardContainer.style = 'display:none';
        status = 1;
    }
    else if (status ==1){
        rewardContainer.style = 'display:block';
        status = 0;
    }
}

socket.on('sent_reward', (message)=>{
    // console.log(message);
    if(message === 'car'){
        carContainer.style='display:block';
        setTimeout(function(){
            carContainer.style='display:none';
        },5000)
    }
    if(message === 'arrow'){
        arrowContainer.style='display:block';
        setTimeout(function(){
            arrowContainer.style='display:none';
        },5000)
    }
    if(message === 'diamond'){
        diamondContainer.style='display:block';
        setTimeout(function(){
            diamondContainer.style='display:none';
        },5000)
    }
    if(message === 'dove'){
        doveContainer.style='display:block';
        setTimeout(function(){
            doveContainer.style='display:none';
        },5000)
    }
    if(message === 'gift'){
        giftContainer.style='display:block';
        setTimeout(function(){
            giftContainer.style='display:none';
        },5000)
    }
    if(message === 'microphone'){
        microphoneContainer.style='display:block';
        setTimeout(function(){
            microphoneContainer.style='display:none';
        },5000)
    }
    if(message === 'rocket'){
        rocketContainer.style='display:block';
        setTimeout(function(){
            rocketContainer.style='display:none';
        },5000)
    }
    if(message === 'teddy'){
        teddyContainer.style='display:block';
        setTimeout(function(){
            teddyContainer.style='display:none';
        },5000)
    }
    if(message === 'treature'){
        treatureContainer.style='display:block';
        setTimeout(function(){
            treatureContainer.style='display:none';
        },5000)
    }
    if(message === 'universe'){
        universeContainer.style='display:block';
        setTimeout(function(){
            universeContainer.style='display:none';
        },5000)
    }
});
socket.on('sent_reward_word', (message)=>{
    // console.log(message);
    GiftMessageContainer.style = 'display:block;';
    document.getElementById("GiftMessage").innerHTML = message;
    setTimeout(function(){
        GiftMessageContainer.style = 'display:none;';
    },5000)
    
    
});

function changecar(){
    socket.emit('reward', 'car');
    socket.emit('reward_word', userName + ' send a car to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a car to ' + window.sessionStorage.getItem("identity"));
}
function changearrow(){
    socket.emit('reward', 'arrow');
    socket.emit('reward_word', userName + ' send a arrow to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a arrow to ' + window.sessionStorage.getItem("identity"));
}
function changediamond(){
    socket.emit('reward', 'diamond');
    socket.emit('reward_word', userName + ' send a diamond to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a diamond to ' + window.sessionStorage.getItem("identity"));
}
function changedove(){
    socket.emit('reward', 'dove');
    socket.emit('reward_word', userName + ' send a dove to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a dove to ' + window.sessionStorage.getItem("identity"));
}
function changegift(){
    socket.emit('reward', 'gift');
    socket.emit('reward_word', userName + ' send a gift to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a gift to ' + window.sessionStorage.getItem("identity"));
}
function changemicrophone(){
    socket.emit('reward', 'microphone');
    socket.emit('reward_word', userName + ' send a microphone to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a microphone to ' + window.sessionStorage.getItem("identity"));
}
function changerocket(){
    socket.emit('reward', 'rocket');
    socket.emit('reward_word', userName + ' send a rocket to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a rocket to ' + window.sessionStorage.getItem("identity"));
}
function changeteddy(){
    socket.emit('reward', 'teddy');
    socket.emit('reward_word', userName + ' send a teddy to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a teddy to ' + window.sessionStorage.getItem("identity"));
}
function changetreature(){
    socket.emit('reward', 'treature');
    socket.emit('reward_word', userName + ' send a treature to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a treature to ' + window.sessionStorage.getItem("identity"));
}
function changeuniverse(){
    socket.emit('reward', 'universe');
    socket.emit('reward_word', userName + ' send a universe to ' + window.sessionStorage.getItem("identity"));
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a universe to ' + window.sessionStorage.getItem("identity"));
}