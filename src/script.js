
import './style.css'
// import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { gsap } from 'gsap'


let sceneReady = false;
// Set up variables
const loadingManager = new THREE.LoadingManager();
// Loading 
let loadingMessages = '';
const loaderElement = document.querySelector('.intro-loader');
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = Math.floor((itemsLoaded / itemsTotal) * 100); // Calculate the progress percentage
    const message = 'Loading file: ' + url + '<br>Loaded... ' + itemsLoaded + ' of ' + itemsTotal + ' files (' + progress + '%)';
    loadingMessages += message + '<br>'; // Append the new loading message

    loaderElement.innerHTML = loadingMessages; // Update the HTML content with all the loading messages
};
// Loaded
loadingManager.onLoad = () => {

    setTimeout(() => {

        gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 0.1, value: 0, delay: 1 });
        loaderElement.remove();
        CameraActions[currentCameraAnimation].play();
        setTimeout(() => {
            switchCameraAnimation('rotation');
        }, 3000);
        setTimeout(() => {
            sceneReady = true;
        }, 3500);

    }, 500);
};


/**
 * Base
 */

// Debug
const debugObject = {}
// const gui = new dat.GUI()


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// Camera
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100)
scene.add(camera)


const textureLoader = new THREE.TextureLoader(loadingManager)


// Loading screen
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

// Audio
const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader(loadingManager);

// Computer Fan Audio
const computerFanAudio = new THREE.PositionalAudio(listener);
audioLoader.load('background1.mp3', function (buffer) {
    computerFanAudio.setBuffer(buffer);
    computerFanAudio.setLoop(true);
    computerFanAudio.setVolume(2);
    computerFanAudio.setRefDistance(0.05);
    computerFanAudio.play();
});
computerFanAudio.position.set(-0.060315653681755066, 0.8590562343597412, -0.10443098098039627);
scene.add(computerFanAudio);

// Door Open Audio
const doorOpenAudio = new THREE.PositionalAudio(listener);
audioLoader.load('door4.mp3', function (buffer) {
    doorOpenAudio.setBuffer(buffer);
    doorOpenAudio.setLoop(false);
    doorOpenAudio.setVolume(0.4);
    doorOpenAudio.setRefDistance(8);
});
doorOpenAudio.position.set(-0.53, -0.05865, -1.34297);
scene.add(doorOpenAudio);


// Model


const stringMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        amplitude: { value: 0.0001 },
        frequency: { value: 0 },
    },
    vertexShader: `
        uniform float time;
        uniform float amplitude;
        uniform float frequency;
        

        void main() {
          
            vec3 newPosition = position;
            float yAmplitude = 1.0 - abs(newPosition.y);
            newPosition.z += amplitude * yAmplitude * sin(time * frequency + position.z);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
       

        void main() {
            gl_FragColor = vec4(1.0,1.0,1.0, 1.0);
        }
    `,
});


function createMaterialWithTexture(texturePath) {
    const texture = textureLoader.load(texturePath);
    texture.flipY = false;
    return new THREE.MeshBasicMaterial({ map: texture });
}

const islandTreeMaterial = createMaterialWithTexture('GroundTree.jpg');
const guitarOutsideMaterial = createMaterialWithTexture('GuitarOutside.jpg');
const sceneObjectsMaterial = createMaterialWithTexture('SceneObjects.jpg');
const floorMaterial = createMaterialWithTexture('Floor.jpg');
const woodMaterial = createMaterialWithTexture('GuitarWood.jpg');
const guitarInsideMaterial = createMaterialWithTexture('GuitarInside.jpg');


const point_3 = document.querySelector('.point-3')

let cameraMixer;
let CameraActions;
let sceneMixer;
let currentCameraAnimation = 'intro';



gltfLoader.load('fullModel.glb', (gltf) => {


    scene.add(gltf.scene);
    console.log(gltf)
    gltf.scene.traverse((child) => {
        switch (true) {
            case child.name.startsWith("TreeIsland"):
                child.traverse((grandChild) => {
                    grandChild.material = islandTreeMaterial;
                });
                break;
            case child.name.startsWith("GuitarOutside"):
                child.traverse((grandChild) => {
                    grandChild.material = guitarOutsideMaterial;
                });
                break;
            case child.name.startsWith("RandomObjects"):
                child.material = sceneObjectsMaterial;
                break;
            case child.name.startsWith("Floor"):
                child.material = floorMaterial;
                break;
            case child.name.startsWith("123"):
                child.material = stringMaterial;
                break;
            case child.name.startsWith("just"):
                child.material = woodMaterial;
                break;
            case child.name.startsWith("inside"):
                child.material = guitarInsideMaterial;
                child.traverse((grandChild) => {
                    grandChild.material = guitarInsideMaterial;
                });
                break;
            default:
                break;
        }
    });


    cameraMixer = new THREE.AnimationMixer(camera);
    sceneMixer = new THREE.AnimationMixer(gltf.scene)

    const doorOpenAnimation = sceneMixer.clipAction(gltf.animations.find((clip) => clip.name === 'DoorOpenAnimation'))
    doorOpenAnimation.setLoop(THREE.LoopOnce);
    doorOpenAnimation.clampWhenFinished = true;


    // find by name please
    const cameraRotationAnimation = cameraMixer.clipAction(gltf.animations.find((clip) => clip.name === 'CameraRotation'));
    const cameraGetIn = cameraMixer.clipAction(gltf.animations.find((clip) => clip.name === 'CameraGetIn'));
    const cameraComputerRoom = cameraMixer.clipAction(gltf.animations.find((clip) => clip.name === 'CameraComputerRoom'));
    const cameraMusicRoom = cameraMixer.clipAction(gltf.animations.find((clip) => clip.name === 'CameraMusicRoom'));
    const cameraBedroom = cameraMixer.clipAction(gltf.animations.find((clip) => clip.name === 'CameraBedRoom'));
    const cameraCredits = cameraMixer.clipAction(gltf.animations.find((clip) => clip.name === 'CameraCredits'));
    const cameraProjects = cameraMixer.clipAction(gltf.animations.find((clip) => clip.name === 'cameraProjects'));
    const cameraIntro = cameraMixer.clipAction(gltf.animations.find((clip) => clip.name === 'cameraInitFromOutside'));

    cameraGetIn.setLoop(THREE.LoopOnce);
    cameraComputerRoom.setLoop(THREE.LoopOnce);
    cameraMusicRoom.setLoop(THREE.LoopOnce);
    cameraBedroom.setLoop(THREE.LoopOnce);
    cameraCredits.setLoop(THREE.LoopOnce);
    cameraProjects.setLoop(THREE.LoopOnce);
    cameraIntro.setLoop(THREE.LoopOnce);

    cameraGetIn.clampWhenFinished = true;
    cameraComputerRoom.clampWhenFinished = true;
    cameraMusicRoom.clampWhenFinished = true;
    cameraBedroom.clampWhenFinished = true;
    cameraCredits.clampWhenFinished = true;
    cameraProjects.clampWhenFinished = true;
    cameraIntro.clampWhenFinished = true;

    cameraIntro.timeScale = 1.2;


    CameraActions = {
        rotation: cameraRotationAnimation,
        getIn: cameraGetIn,
        computerRoom: cameraComputerRoom,
        musicRoom: cameraMusicRoom,
        bedroom: cameraBedroom,
        credits: cameraCredits,
        projects: cameraProjects,
        intro: cameraIntro

    };

    // set initial camera animation
    CameraActions[currentCameraAnimation].enabled = true;


    // const animationController = gui.add(
    //     { animation: 'rotation' },
    //     'animation',
    //     Object.keys(CameraActions)

    // );

    // animationController.onChange((value) => {
    //     switchCameraAnimation(value);
    // });

    point_3.addEventListener('click', () => {

        point_3.classList.remove('visible')
        point_3.classList.add('hidden')
        cameraController.classList.add('visible')
        doorOpenAnimation.play();
        doorOpenAudio.play();

        setTimeout(() => {
            switchCameraAnimation('getIn');
            cameraController.classList.remove('disabled')
        }, 1000);


    }, { once: true });

});


// gui.add({ logCameraPosition: () => console.log(`{${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}}`) }, 'logCameraPosition').name('log camera position');

// gui.add({ logCameraRotation: () => console.log(`{${camera.rotation.x.toFixed(2)}, ${camera.rotation.y.toFixed(2)}, ${camera.rotation.z.toFixed(2)}}`) }, 'logCameraRotation').name('log camera rotation');



// Switch camera animation function
const switchCameraAnimation = (animationName) => {
    if (currentCameraAnimation === animationName) return; // Do nothing if the animation is already playing

    if (controls) {
        if (controls.enabled) {
            controls.enabled = false;

        }

    }

    const nextAction = CameraActions[animationName];
    nextAction.reset();
    nextAction.play();

    const currentAction = CameraActions[currentCameraAnimation];
    currentAction.crossFadeTo(nextAction, 1.5); // crossfade to the next animation
    currentCameraAnimation = animationName; // update current camera animation



    if (currentCameraAnimation === "getIn" || currentCameraAnimation === "rotation" || currentCameraAnimation === "projects") {
        sceneReady = true;
    } else {
        sceneReady = false;
        for (const point of points) {
            point.element.classList.remove('visible')
        }
    }


    classlistaddremove()
};


const cameraController = document.querySelector('#controller')

const projects = document.querySelector('#projects');
projects.addEventListener('click', () => {
    console.log('projects');
    switchCameraAnimation('projects');
});


const computer = document.querySelector('#computer');
computer.addEventListener('click', () => {
    switchCameraAnimation('computerRoom');
});

const music = document.querySelector('#music');
music.addEventListener('click', () => {
    switchCameraAnimation('musicRoom');
});

const bedroom = document.querySelector('#bedroom');
bedroom.addEventListener('click', () => {
    switchCameraAnimation('bedroom');
});

const credits = document.querySelector('#credits');
credits.addEventListener('click', () => {
    switchCameraAnimation('credits');
});

// const outside = document.querySelector('#outside');
// outside.addEventListener('click', () => {
//     switchCameraAnimation('rotation');

// });

point_3.addEventListener('click', () => {
    switchCameraAnimation('getIn');
});


function classlistaddremove() {
    console.log(CameraActions[currentCameraAnimation]._clip.duration)
    const duration = CameraActions[currentCameraAnimation]._clip.duration

    cameraController.classList.add('disabled')

    setTimeout(() => {
        cameraController.classList.remove('disabled')
    }, duration * 1000 - 1000);

}

const freeRoam = document.querySelector('#freeRoam');
freeRoam.addEventListener('click', () => {

    // stop all animations and enable controls
    for (const animation of Object.values(CameraActions)) {
        animation.stop();
    }
    camera.position.set(-0.73, 5.16, 8.81);
    camera.rotation.set(-0.40, -0.01, -0.00);


    controls.enabled = true
    controls.enablePan = true
    // controls.enableZoom = false
    // controls.enableRotate = false
    controls.enableDamping = true

});




// const ambientLight = new THREE.AmbientLight(
//     0xffffff,
//     0.9
// )
// scene.add(ambientLight)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update CSS renderer
    rendererCss.setSize(window.innerWidth, window.innerHeight);

})


// const ambientLight = new THREE.AmbientLight(0xffffff, 2);
// scene.add(ambientLight);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
// renderer.outputEncoding = THREE.LinearEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
debugObject.clearColor = '#201919'
// enable srgb encoding
// renderer.outputEncoding = THREE.sRGBEncoding

// gui.addColor(debugObject, 'clearColor').onChange(() => {
//     renderer.setClearColor(debugObject.clearColor)
// })

renderer.setClearColor(debugObject.clearColor)



// css renderer

var material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0,
    blending: THREE.NoBlending,

});

var element = document.createElement('div');
element.innerHTML = `
    <div class='computer-outer'>
        <iframe class='computer' src="http://localhost:5050/"></iframe>
    </div>
    <div class="computer-dirt"></div>
    <div class="computer-screen-reflection"></div>
`


element.style.width = '500px';

element.style.height = '500px';
element.style.opacity = 1;

// element.style.scale = '0.96';

// element.style.background = new THREE.Color(0xff0000).getStyle();


var object = new CSS3DObject(element);
object.scale.set(0.000052, 0.000052, 0.000052)

scene.add(object);

var geometry = new THREE.PlaneGeometry(50, 50);


geometry.scale(0.00052, 0.00052, 0.00052)

var mesh = new THREE.Mesh(geometry, material);


scene.add(mesh);


const rendererCss = new CSS3DRenderer();
rendererCss.setSize(window.innerWidth, window.innerHeight);

rendererCss.domElement.style.position = 'absolute';
rendererCss.domElement.style.top = 0;


object.position.set(-0.0865, 0.86189, -0.0431);
object.rotation.set(0, -1.58, 0)


mesh.position.copy(object.position)
mesh.rotation.copy(object.rotation)

// const screenFolder = gui.addFolder('screen')

// screenFolder.add(mesh.position, 'x').min(-5).max(5).step(0.01).name('x').onFinishChange(() => {
//     // object.position.x = mesh.position.x
// })
// screenFolder.add(mesh.position, 'y').min(-5).max(5).step(0.01).name('y').onFinishChange(() => {
//     // object.position.y = mesh.position.y
// })
// screenFolder.add(mesh.position, 'z').min(-5).max(5).step(0.01).name('z').onFinishChange(() => {
//     // object.position.z = mesh.position.z
// })
// // add rotation
// screenFolder.add(mesh.rotation, 'x').min(-5).max(5).step(0.01).name('x').onFinishChange(() => {
//     object.rotation.x = mesh.rotation.x
// })
// screenFolder.add(mesh.rotation, 'y').min(-5).max(5).step(0.01).name('y').onFinishChange(() => {
//     object.rotation.y = mesh.rotation.y
// })
// screenFolder.add(mesh.rotation, 'z').min(-5).max(5).step(0.01).name('z').onFinishChange(() => {
//     object.rotation.z = mesh.rotation.z
// })


document.body.appendChild(rendererCss.domElement);

rendererCss.domElement.appendChild(renderer.domElement);
rendererCss.domElement.style.pointerEvents = 'all';


// element.addEventListener('mouseenter', () => {
//     console.log('controles disabled')
//     controls.enabled = false;
//     window.body.style.cursor = 'pointer'
// })
// element.addEventListener('mouseleave', () => {
//     console.log('controles enabled')
//     controls.enabled = true;
// })



renderer.domElement.style.pointerEvents = 'none';


// controls.enableDamping = true


// Guitar sounds

// create gsap tween to change uniform frequency on the stringMaterial.uniforms.frequency.value from 5 to 0 

function animateStrings() {
    stringMaterial.uniforms.frequency.value = 50;
    gsap.to(stringMaterial.uniforms.frequency, {
        value: 0,
        duration: 5,
        ease: "easeOut",
        onUpdate: () => {
            stringMaterial.uniforms.frequency.needsUpdate = true;
            console.log(stringMaterial.uniforms.frequency.value)
        },
    });
}

// Set the initial value of frequency to 5


// load audio file the normal js way

const audio2 = new Audio('EString.mp3');


// make fog and add it to the scene
const fog = new THREE.Fog('#201919', 20, 44)
scene.fog = fog




// Start the animation


// add gui button to fire the tween

const guitarOneAudio = new THREE.PositionalAudio(listener);

// Load the first sound file
audioLoader.load('EString.mp3', function (buffer) {
    guitarOneAudio.setBuffer(buffer);
    guitarOneAudio.setLoop(false);
    guitarOneAudio.setVolume(0.4);
    // guitarOneAudio.setRefDistance(8);
});
guitarOneAudio.position.set(-0.53, -0.05865, -1.34297);
scene.add(guitarOneAudio);

// ray caster on click and console log first object 
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const onClick = (event) => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position

    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray

    const intersects = raycaster.intersectObjects(scene.children);



    // console.log(intersects[0].object.name)
    if (intersects[0].object.name.startsWith("Librarystring") || intersects[0].object.name.startsWith("123")) {
        console.log(intersects[0].object.name)
        // play audio


        if (guitarOneAudio.isPlaying) {
            guitarOneAudio.stop();
        }

        guitarOneAudio.play();
        if (!audio2.paused) {
            audio2.pause();
            audio2.currentTime = 0;
            audio2.play();
        } else {
            audio2.play();
        }

        animateStrings()

    } else if (intersects[0].object.name.startsWith("piano")) {
        console.log('play piano sound')
    }

}

window.addEventListener('click', onClick)



let posX;
let posY;

window.addEventListener('mousemove', (event) => {

    posX = (event.clientX / window.innerWidth) * 2 - 1;
    posY = -(event.clientY / window.innerHeight) * 2 + 1;



})


const points = [
    {
        position: new THREE.Vector3(-0.09, 1.06, -0.13),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(-0.09, 1.02, -0.07),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(-0.09, 0.95, -0.13),
        element: document.querySelector('.point-2')
    },
    {
        position: new THREE.Vector3(-0.77, 2.13, 0.29),
        element: document.querySelector('.point-3')
    }

]

// add gui to the position of points above 
// const pointFolder = gui.addFolder('points')
// points.forEach((point, index) => {
//     pointFolder.add(point.position, 'x').min(-5).max(5).step(0.01).name(`point-${index} x`).onFinishChange(() => {
//         point.element.style.transform = `translate(-50%, -50%) translate(${point.position.x * 100}px, ${point.position.y * 100}px)`
//     })
//     pointFolder.add(point.position, 'y').min(-5).max(5).step(0.01).name(`point-${index} y`).onFinishChange(() => {
//         point.element.style.transform = `translate(-50%, -50%) translate(${point.position.x * 100}px, ${point.position.y * 100}px)`
//     })
//     pointFolder.add(point.position, 'z').min(-5).max(5).step(0.01).name(`point-${index} z`).onFinishChange(() => {
//         point.element.style.transform = `translate(-50%, -50%) translate(${point.position.x * 100}px, ${point.position.y * 100}px)`
//     })
// })


// camera.position.set(-0.24, 0.90, -0.04)

// camera.rotation.set(
//     -1.62, -1.30, -1.62
// )

const sceneFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20,),
    new THREE.MeshStandardMaterial({
        color: '#201919',
        side: THREE.DoubleSide,


    })
)
sceneFloor.rotation.x = Math.PI * -.5
sceneFloor.position.y = -0.01
scene.add(sceneFloor)

const controls = new OrbitControls(camera, rendererCss.domElement)
controls.enabled = false
const tick = () => {

    if (cameraMixer) {
        cameraMixer.update(0.0167);
        sceneMixer.update(0.0167);
    }


    if (controls) {
        if (controls.enabled) {
            controls.update(controls)
        }
    }

    // console.log(camera.position, camera.rotation)

    // camera group subtle movement along mouse position
    // cameraGroup.position.x = posX * 0.005
    // cameraGroup.position.y = posY * 0.005


    stringMaterial.uniforms.time.value += .05;

    renderer.render(scene, camera)
    rendererCss.render(scene, camera)



    // console.log(camera.position)
    if (sceneReady) {
        // Go through each point
        for (const point of points) {
            // Get 2D screen position
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            // Set the raycaster
            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)

            // No intersect found
            if (intersects.length === 0) {
                // Show
                point.element.classList.add('visible')
            }

            // Intersect found
            else {
                // Get the distance of the intersection and the distance of the point
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)

                // Intersection is close than the point
                if (intersectionDistance < pointDistance) {
                    // Hide
                    point.element.classList.remove('visible')
                }
                // Intersection is further than the point
                else {
                    // Show
                    point.element.classList.add('visible')
                }
            }

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
    }

    window.requestAnimationFrame(tick)
}

tick()