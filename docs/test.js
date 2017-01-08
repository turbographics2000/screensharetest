btnScreenShare.onclick = _ => chrome.runtime.sendMessage('ophefhhmblpnpplgcaeihbobllolhpnl', ["screen", "window", "tab"], srcId => {
    navigator.mediaDevices.getUserMedia({
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: srcId,
            }
        },
        audio: false
    }, function(st) {
        selfTypes[st.id] = 'screen';
        selfScreen.srcObject = st;
        pc.addTrack ? st.getTracks().map(trk => pc.addTrack(trk, st)) : pc.addStream(st);
    }, function(e) { console.error(e) })
});
