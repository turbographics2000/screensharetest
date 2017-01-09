window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
let apiKey = '21b4b0a5-f810-4b30-ac5e-a98b24a1be87';
let token = Math.random().toString(36).substr(2);
let pc, socket, dstId, extId = 'ophefhhmblpnpplgcaeihbobllolhpnl', o2j = JSON.stringify, j2o = JSON.parse;
let selfTypes = {}, remoteTypes = {};
let gum = constraints => navigator.mediaDevices.getUserMedia(constraints);
console.clear();
btnStart.onclick = _ => start(dstId = callTo.value);
btnScreenShare.onclick = _ => chrome.runtime.sendMessage(extId, ["screen", "window", "tab"], srcId => {
	navigator.mediaDevices.getUserMedia({
  	video:{
      mandatory: {
        chromeMediaSource: 'desktop', 
        chromeMediaSourceId: srcId,
         maxWidth: 1920,
        maxHeight: 1080
      }
    },
    audio: false
  }, function (st){
  	selfTypes[st.id] = 'screen';
    selfScreen.srcObject = st;
  	pc.addTrack ? st.getTracks().map(trk => pc.addTrack(trk, st)) : pc.addStream(st);
  }, function(e) { console.error(e)})
});

fetch(`https://skyway.io/${apiKey}/id?ts=${Date.now()}${Math.random()}`)
  .then(res => res.text()).then(myId => {
  	myIdDisp.textContent = myId;
    socket = new WebSocket(`wss://skyway.io/peerjs?key=${apiKey}&id=${myId}&token=${token}`);
    socket.onmessage = evt => {
      const msg = j2o(evt.data);
      if(!['OPEN', 'PING'].includes(msg.type) && !pc) start(dstId = msg.src);
      msg.ans && pc.setRemoteDescription(new RTCSessionDescription(msg.ans));
      msg.ofr && pc.setRemoteDescription(new RTCSessionDescription(msg.ofr))
      		.then(_ => Object.assign(remoteTypes, msg.mTypes))
          .then(_ => pc.createAnswer())
          .then(answer => pc.setLocalDescription(answer))
          .then(_ => socket.send(o2j({type: 'ANSWER', ans: pc.localDescription, dst: msg.src})))
          .catch(e => console.log('set remote offer error', e));
      msg.cnd && pc.addIceCandidate(new RTCIceCandidate(msg.cnd));
      msg.type === 'PING' && socket.send(o2j({type: 'PONG'}));
    };
    socket.onclose = evt => console.log(`socket close: code=${evt.code}`);
  });

function start() {
  pc = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.skyway.io:3478'}]});
  pc.onicecandidate = evt => socket.send(o2j({type: 'CANDIDATE', cnd: evt.candidate, dst: dstId}));
  pc.onnegotiationneeded = evt => {
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(_ => {
      	console.log('-----------------------------');
      	console.log(JSON.stringify(pc.localDescription).replace(/\\r\\n/g, '\r\n'));
      	socket.send(o2j({type:'OFFER', ofr: pc.localDescription, dst: dstId, mTypes: selfTypes}));
    	})
      .catch(e => console.log('create offer error', e));
  }
  gum({video: true}).then(stream => {
      selfTypes[stream.id] = 'media';
      selfView.srcObject = stream;
      pc.addTrack ? stream.getTracks().map(trk => pc.addTrack(trk, stream)) : pc.addStream(stream);
  }).catch(e => console.log(`${e.name}: ${e.message}`));
  pc.onaddstream = evt => {
  	console.log('mType', remoteTypes[evt.stream.id]);
    if(remoteTypes[evt.stream.id] === 'screen') {
    	remoteScreen.srcObject = evt.stream;
    } else {
	  	remoteView.srcObject = evt.stream;
    }
  }
}
