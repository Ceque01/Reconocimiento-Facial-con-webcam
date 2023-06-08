const elVideo = document.getElementById('video')
navigator.getMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia);

    const cargarCamera = () => {

        navigator.getMedia (

            // Restricciones (contraints) *Requerido
            {
            video: true,
            audio: false
            },
            
            stream=> elVideo.srcObject= stream,
            console.error
            
            );
    }

    Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.ageGenderNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),

    ]).then(cargarCamera)


    elVideo.addEventListener('play', async()=>{
        //se crea el canvas con los elementos del face api
        const canvas = faceapi.createCanvasFromMedia(elVideo)
        // se añade al body
        document.body.append(canvas)

        // tamaño del canvas
        const displaySize = { width: elVideo.width, height: elVideo.height }
        faceapi.matchDimensions(canvas, displaySize)

        setInterval(async()=>{
            // hace las detecciones
            const detections = await faceapi.detectAllFaces(elVideo)
            .withFaceLandmarks()//marcas
            .withFaceExpressions()//expresiones
            .withAgeAndGender()//edad y genero
            .withFaceDescriptors()//descripcion

            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            //se limpia el canvas
            canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)

            //dibuja las lineas
            faceapi.draw.drawDetections(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

            resizedDetections.forEach(detection =>{
                const box = detection.detection.box
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: Math.round(detection.age) + ' años ' + detection.gender
                })
                //se dibuja
                drawBox.draw(canvas)
            })

        })

    })