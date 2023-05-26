# Three.js Journey

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

  // let currentAnimation = 'rotation';

    // let initialAction = actions[currentAnimation];
    // initialAction.setLoop(THREE.LoopRepeat);
    // initialAction.play();

    // const animationController = gui.add(
    //     { animation: currentAnimation },
    //     'animation',
    //     ['rotation', 'zoom', 'enter']
    // );

    // let timeToChange = 0;
    // animationController.onChange((value) => {
    //     const nextAction = actions[value];
    //     if (nextAction !== initialAction) {
    //         nextAction.reset();
    //         nextAction.play();

    //         if (nextAction === actions.enter) {
    //             timeToChange = 2;
    //         } else {
    //             timeToChange = 1;
    //         }

    //         initialAction.crossFadeTo(nextAction, timeToChange);

    //         initialAction = nextAction;
    //     }
    // });


// let currentAnimationProgress = 0;

// // add event listener to switch between animations if i click on the screen
// window.addEventListener('click', () => {
//     const nextAnimation = currentAnimation === 'rotation' ? 'zoom' : 'rotation';
//     const nextAction = actions[nextAnimation];

//     // Set the starting time for the new animation to match the progress of the current animation
//     const nextAnimationStartTime = (currentAnimationProgress % nextAction._clip.duration);

//     // fade out the current animation and fade in the new one
//     actions[currentAnimation].crossFadeTo(nextAction, 1);
//     nextAction.setEffectiveTimeScale(1);
//     nextAction.time = nextAnimationStartTime;
//     nextAction.play();

//     // update the current animation and progress
//     currentAnimation = nextAnimation;
//     currentAnimationProgress = (actions[currentAnimation].time * actions[currentAnimation].getEffectiveTimeScale()) % actions[currentAnimation]._clip.duration;
// });








var camera, sceneGl, rendererGl;
var sceneCss, rendererCss;
var controls;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(200, 200, 200);

    // controls = new TrackballControls(camera);

    sceneGl = new THREE.Scene();
    sceneCss = new THREE.Scene();

    var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.0,
        side: THREE.DoubleSide
    });

    var xpos = [50, -10, 30, 70, 110];
    var ypos = [60, -40, 0, 40, 80];
    var zpos = [-30, -50, 0, 50, 100];

    for (var i = 0; i < 5; i++) {

        var element = document.createElement('div');
        element.style.width = '100px';
        element.style.height = '100px';
        element.style.opacity = 1.0;
        element.style.background = new THREE.Color(Math.random() * 0xff0000).getStyle();

        var object = new CSS3DObject(element);
        object.position.x = xpos[i];
        object.position.y = ypos[i];
        object.position.z = zpos[i];
        object.rotation.x = Math.PI / (i + 5);
        object.rotation.y = Math.PI / (21 - 2 * i);
        object.rotation.z = Math.PI / (3 * i + 25);
        object.scale.x = i / 12 + 0.5;
        object.scale.y = 1 / (12 - i) + 0.5;
        sceneCss.add(object);


        var geometry = new THREE.PlaneGeometry(100, 100);
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(object.position);
        mesh.rotation.copy(object.rotation);
        mesh.scale.copy(object.scale);
        sceneGl.add(mesh);

    }


    var boxGeom = new THREE.BoxGeometry(60, 60, 60);

    var cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x05009A,
        shading: THREE.FlatShading,
        side: THREE.DoubleSide
    });

    var cube = new THREE.Mesh(boxGeom, cubeMaterial);
    cube.position.copy(new THREE.Vector3(100, 75, 50));
    cube.rotation.copy(Math.PI / 6);

    sceneGl.add(cube);


    rendererCss = new CSS3DRenderer();
    rendererCss.setSize(window.innerWidth, window.innerHeight);
    rendererCss.domElement.style.position = 'absolute';
    rendererCss.domElement.style.top = 0;

    rendererGl = new THREE.WebGLRenderer({ alpha: true });
    rendererGl.setClearColor(0x00ff00, 0.0);

    rendererGl.setSize(window.innerWidth, window.innerHeight);

    rendererGl.domElement.style.position = 'absolute';
    rendererGl.domElement.style.zIndex = 1;
    rendererGl.domElement.style.top = 0;
    rendererCss.domElement.appendChild(rendererGl.domElement);

    document.body.appendChild(rendererCss.domElement);

}

function animate() {

    requestAnimationFrame(animate);

    // controls.update();

    rendererGl.render(sceneGl, camera);
    rendererCss.render(sceneCss, camera);

}


// const visited = new Set();

    // function traverseScene(child) {
    //     if (visited.has(child.uuid)) {
    //         return;
    //     }

    //     visited.add(child.uuid);

    //     if (child.name.startsWith('Compu') || child.isGroup) {
    //         child.material = computer;
    //         console.log('found');
    //     } else if (child.name.startsWith('G-R')) {
    //         child.material = bakedGuitarRoomMaterial;
    //     } else if (child.isMesh) {
    //         child.material = bakedMaterial;
    //     }

    //     if (child.uuid === '83BFAEA4-C33D-42D0-AE9A-50232EBA3EE4' || child.name === 'Computer') {
    //         child.traverse((item) => {
    //             if (visited.has(item.uuid)) {
    //                 return;
    //             }

    //             visited.add(item.uuid);

    //             item.material = computer;
    //         });
    //     }

    //     if (child.name === 'G-RCube042') {

    //         child.traverse((item) => {
    //             if (visited.has(item.uuid)) {
    //                 return;
    //             }

    //             visited.add(item.uuid);

    //             item.material = bakedGuitarRoomMaterial;
    //         });
    //     }
    // }

    // gltf.scene.traverse(traverseScene);
    // Create a new AnimationMixer instance

















    
        // get the time elapsed in the current animation
        // const elapsed = currentAction.time % currentAction._clip.duration;

        // // set the time scale of the current animation to 0 to pause it
        // currentAction.timeScale = 0;

        // // set the time of the next animation to the elapsed time of the current animation
        // nextAction.time = elapsed;

        // // set the time scale of the next animation to 1 to resume it
        // nextAction.timeScale = 1;
