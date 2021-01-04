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
const Music = document.getElementById('audio')
const musictext = document.getElementById('musictext')


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

// var time = 
// console.log(new Data())

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
         width: {exact:1280},
         height: {exact:720}
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
}
/**
 * Enable/disable video
 */
function toggleVid() {
    for (let index in localStream.getVideoTracks()) {
        localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
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
    // console.log(message);
    if(message[0] == window.sessionStorage.getItem("roomid")){
        outputMessage(message[1]);
    }
});


socket.on('sent_close', (msg) =>{
    if(msg ==  window.sessionStorage.getItem("roomid")){
        document.getElementById("logo_title").innerHTML = " The room has closed ! See you next time";
    }
});


chatForm.addEventListener('submit',(e) =>{
    e.preventDefault();
    const msg = '<img src="../images/checked.png">' +new Date().Format("hh:mm") + ' ' + userName + ' :<br>' + e.target.elements.msg.value;
    e.target.elements.msg.value = ''
    idmsg = [window.sessionStorage.getItem("roomid"), msg]
    console.log(idmsg[1])
    socket.emit('chatMessage', idmsg);
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
    idmsg = [window.sessionStorage.getItem("roomid"), msg]
    socket.emit('chatMessage', idmsg);
}

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

    let param = "https://140.118.121.100:6789/account/close?S_Account="+account;
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
    idmsg = window.sessionStorage.getItem("roomid")
    socket.emit('close', idmsg);
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
    Music.style = 'display:none;';
    musictext.style = 'display:none;'

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
    if(message[0] == window.sessionStorage.getItem("roomid")){
        if(message[1] === 'car'){
            carContainer.style='display:block';
            setTimeout(function(){
                carContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'arrow'){
            arrowContainer.style='display:block';
            setTimeout(function(){
                arrowContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'diamond'){
            diamondContainer.style='display:block';
            setTimeout(function(){
                diamondContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'dove'){
            doveContainer.style='display:block';
            setTimeout(function(){
                doveContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'gift'){
            giftContainer.style='display:block';
            setTimeout(function(){
                giftContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'microphone'){
            microphoneContainer.style='display:block';
            setTimeout(function(){
                microphoneContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'rocket'){
            rocketContainer.style='display:block';
            setTimeout(function(){
                rocketContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'teddy'){
            teddyContainer.style='display:block';
            setTimeout(function(){
                teddyContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'treature'){
            treatureContainer.style='display:block';
            setTimeout(function(){
                treatureContainer.style='display:none';
            },5000)
        }
        if(message[1] === 'universe'){
            universeContainer.style='display:block';
            setTimeout(function(){
                universeContainer.style='display:none';
            },5000)
        }
    }
});
socket.on('sent_reward_word', (message)=>{
    // console.log(message);
    if(message[0] == window.sessionStorage.getItem("roomid")){
        GiftMessageContainer.style = 'display:block;';
        document.getElementById("GiftMessage").innerHTML = message[1];
        setTimeout(function(){
            GiftMessageContainer.style = 'display:none;';
        },5000)
    }
    
});

function changecar(){
    idcar = [window.sessionStorage.getItem("roomid"), 'car']
    socket.emit('reward', idcar);
    idmsg = [window.sessionStorage.getItem("roomid"), userName + ' send a car to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a car to ' + window.sessionStorage.getItem("identity"));
}
function changearrow(){
    idarrow = [window.sessionStorage.getItem("roomid"), 'arrow']
    socket.emit('reward', idarrow);
    idmsg = [window.sessionStorage.getItem("roomid"), userName + ' send a arrow to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a arrow to ' + window.sessionStorage.getItem("identity"));
}
function changediamond(){
    iddiamond = [window.sessionStorage.getItem("roomid"), 'diamond']
    socket.emit('reward', iddiamond);
    idmsg = [window.sessionStorage.getItem("roomid"), userName + ' send a diamond to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a diamond to ' + window.sessionStorage.getItem("identity"));
}
function changedove(){
    iddove = [window.sessionStorage.getItem("roomid"), 'dove']
    socket.emit('reward', iddove);
    idmsg = [window.sessionStorage.getItem("roomid"), userName + ' send a dove to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a dove to ' + window.sessionStorage.getItem("identity"));
}
function changegift(){
    idgift = [window.sessionStorage.getItem("roomid"), 'gist']
    socket.emit('reward', idgift);
    idmsg = [window.sessionStorage.getItem("roomid"), userName + ' send a gift to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a gift to ' + window.sessionStorage.getItem("identity"));
}
function changemicrophone(){
    idmicrophone = [window.sessionStorage.getItem("roomid"), 'microphone']
    socket.emit('reward', idmicrophone);
    idmsg = [window.sessionStorage.getItem("roomid"),  userName + ' send a microphone to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a microphone to ' + window.sessionStorage.getItem("identity"));
}
function changerocket(){
    idrocket = [window.sessionStorage.getItem("roomid"), 'rocket']
    socket.emit('reward', idrocket);
    idmsg = [window.sessionStorage.getItem("roomid"), userName + ' send a rocket to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a rocket to ' + window.sessionStorage.getItem("identity"));
}
function changeteddy(){
    idteddy = [window.sessionStorage.getItem("roomid"), 'teddy']
    socket.emit('reward', idteddy);
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a teddy to ' + window.sessionStorage.getItem("identity"));
}
function changetreature(){
    idtreature = [window.sessionStorage.getItem("roomid"), 'treature']
    socket.emit('reward', idtreature);
    idmsg = [window.sessionStorage.getItem("roomid"), userName + ' send a treature to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word', idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a treature to ' + window.sessionStorage.getItem("identity"));
}
function changeuniverse(){
    iduniverse = [window.sessionStorage.getItem("roomid"), 'universe']
    socket.emit('reward', iduniverse);
    idmsg = [window.sessionStorage.getItem("roomid"), userName + ' send a universe to ' + window.sessionStorage.getItem("identity")]
    socket.emit('reward_word',idmsg);
    msg_send(new Date().Format("hh:mm") + ' ' + userName + ' send a universe to ' + window.sessionStorage.getItem("identity"));
}
// musictext.style = 'display:block;'
// setInterval(function(){
//     document.getElementById("musictext").innerHTML = Date.now()
// },1)
function PlayMusic(){
    idmusic = window.sessionStorage.getItem("roomid")
    socket.emit('music', idmusic);
}
socket.on('play_music', (message)=>{
    if(message == window.sessionStorage.getItem("roomid")){
        console.log('play_music');
        document.getElementById("audio").innerHTML = '<audio src="../images/Music/rootsound.mp3" autoplay controls></audio>'
        setTimeout(function(){
            musictext.style = 'display:block;'
        },27430)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>半夜睡不著覺 把心情哼成歌</p><br>"
        },29430)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>只好到屋頂找另一個夢境</p><br>"
        },35340)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>睡夢中被敲醒　我還是不確定</p><br>"
        },46060)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>怎會有動人旋律在對面的屋頂</p><br>"
        },51620)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>我悄悄關上門　帶著希望上去</p><br>"
        },57180)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>原來是我夢裡常出現的那個人</p><br>"
        },62520)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>那個人不就是我夢裡那模糊的人</p><br>"
        },67750)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>我們有同樣的默契　用天線</p><br>"
        },72400)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>用天線　排成愛你的形狀 Ho ~ Ho ~</p><br>"
        },78360)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>在屋頂唱著你的歌</p><br>"
        },87030)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>在屋頂和我愛的人</p><br>"
        },90000)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>讓星星點綴成 最浪漫的夜晚</p><br>"
        },92610)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>擁抱這時刻　這一分一秒全都停止</p><br>"
        },98660)

        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>愛開始糾結</p><br>"
        },106990)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>在屋頂唱著你的歌</p><br>"
        },108670)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>在屋頂和我愛的人</p><br>"
        },111700)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>將泛黃的夜獻 給最孤獨的月</p><br>"
        },114400)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>擁抱這時刻　這一分一秒全都停止</p><br>"
        },120230)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>愛開始糾結 夢有你而美</p><br>"
        },128800)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p><間奏請稍後></p>"
        },138800)
        
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>半夜睡不著覺　把心情哼成歌</p><br>"
        },168690)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>只好到屋頂找另一個夢境</p><br>"
        },174360)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>睡夢中被敲醒　我還是不確定</p><br>"
        },185210)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>怎會有動人旋律在對面的屋頂</p><br>"
        },190050)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>我悄悄關上門　帶著希望上去</p><br>"
        },195560)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>原來是我夢裡常出現的那個人</p><br>"
        },200990)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>那個人不就是我夢裡那模糊的人</p><br>"
        },206920)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>我們有同樣的默契　用天線</p><br>"
        },210450)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>用天線　排成愛你的形狀 Ho ~ Ho ~ </p><br>"
        },217790)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>在屋頂唱著你的歌</p><br>"
        },226870)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>在屋頂和我愛的人</p><br>"
        },229800)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>讓星星點綴成 最浪漫的夜晚</p><br>"
        },232340)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>擁抱這時刻　這一分一秒全都停止</p><br>"
        },238410)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>愛開始糾結</p><br>"
        },246930)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>在屋頂唱著你的歌</p><br>"
        },248940)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>在屋頂和我愛的人</p><br>"
        },251620)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>將泛黃的夜獻 給最孤獨的月</p><br>"
        },254270)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>擁抱這時刻　這一分一秒全都停止</p><br>"
        },260230)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>愛開始糾結 夢有你而美</p><br>"
        },268490)


        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>讓我愛你是誰 是我</p><br>"
        },283690)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>讓你愛我是誰 是妳</p><br>"
        },286230)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>怎會有 動人旋律環繞在我倆的身邊</p><br>"
        },288750)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>讓我愛你是誰 是我</p><br>"
        },294650)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>讓你愛我是誰 是妳</p><br>"
        },297450)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p>原來是 這屋頂有美麗的邂逅</p><br>"
        },300250)
        setTimeout(function(){
            document.getElementById("musictext").innerHTML = "<p class='happytext'>歡樂歌聲盡在 Swagger</p>"
        },305550)
        setTimeout(function(){
            musictext.style = 'display:none;'
        },315550)
    }
});
