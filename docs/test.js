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
    }, function(e) { console.error(e) })
});
