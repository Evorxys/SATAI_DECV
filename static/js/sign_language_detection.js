let webcamElement = null;
let canvasElement = null;
let inputElement = null;

export async function initializeSignLanguageDetection(webcam, canvas, input) {
    webcamElement = webcam;
    canvasElement = canvas;
    inputElement = input;

    const net = await handpose.load();
    setInterval(() => {
        detect(net);
    }, 1000);
}

async function detect(net) {
    if (webcamElement && webcamElement.readyState === 4) {
        const video = webcamElement;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        video.width = videoWidth;
        video.height = videoHeight;
        canvasElement.width = videoWidth;
        canvasElement.height = videoHeight;

        const hands = await net.estimateHands(video);

        if (hands.length > 0) {
            const GE = new fp.GestureEstimator([
                Handsigns.aSign,
                Handsigns.bSign,
                Handsigns.cSign,
                Handsigns.dSign,
                Handsigns.eSign,
                Handsigns.fSign,
                Handsigns.gSign,
                Handsigns.hSign,
                Handsigns.iSign,
                Handsigns.jSign,
                Handsigns.kSign,
                Handsigns.lSign,
                Handsigns.mSign,
                Handsigns.nSign,
                Handsigns.oSign,
                Handsigns.pSign,
                Handsigns.qSign,
                Handsigns.rSign,
                Handsigns.sSign,
                Handsigns.tSign,
                Handsigns.uSign,
                Handsigns.vSign,
                Handsigns.wSign,
                Handsigns.xSign,
                Handsigns.ySign,
                Handsigns.zSign,
            ]);

            const estimatedGestures = await GE.estimate(hands[0].landmarks, 6.5);

            if (estimatedGestures.gestures.length > 0) {
                const maxConfidenceGesture = estimatedGestures.gestures.reduce(
                    (prev, current) => (prev.score > current.score ? prev : current),
                    estimatedGestures.gestures[0]
                );

                if (maxConfidenceGesture && maxConfidenceGesture.name) {
                    inputElement.value += maxConfidenceGesture.name;
                }
            }
        }

        const ctx = canvasElement.getContext("2d");
        drawHand(hands, ctx);
    }
}

function drawHand(prediction, ctx) {
    if (prediction.length > 0) {
        prediction.forEach((prediction) => {
            const landmarks = prediction.landmarks;

            for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
                let finger = Object.keys(fingerJoints)[j];
                for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
                    const firstJointIndex = fingerJoints[finger][k];
                    const secondJointIndex = fingerJoints[finger][k + 1];

                    ctx.beginPath();
                    ctx.moveTo(
                        landmarks[firstJointIndex][0],
                        landmarks[firstJointIndex][1]
                    );
                    ctx.lineTo(
                        landmarks[secondJointIndex][0],
                        landmarks[secondJointIndex][1]
                    );
                    ctx.strokeStyle = "gold";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            for (let i = 0; i < landmarks.length; i++) {
                const x = landmarks[i][0];
                const y = landmarks[i][1];

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 3 * Math.PI);
                ctx.fillStyle = "navy";
                ctx.fill();
            }
        });
    }
}

const fingerJoints = {
    thumb: [0, 1, 2, 3, 4],
    index: [0, 5, 6, 7, 8],
    mid: [0, 9, 10, 11, 12],
    ring: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
};
