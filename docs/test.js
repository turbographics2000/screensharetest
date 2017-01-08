btnScreenShare.onclick = _ => chrome.runtime.sendMessage('ophefhhmblpnpplgcaeihbobllolhpnl', ["screen", "window", "tab"], srcId => {
    navigator.mediaDevices.getUserMedia({
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: srcId,
            }
        },
        audio: false
    }).then(stream => {
        selfScreen.srcObject = stream;
    }).catch(e => console.error(e));
});
