let importmap = document.createElement('script');
importmap.type = "importmap";
importmap.innerHTML = '{"imports": {"three": "https://cdn.jsdelivr.net/npm/three/build/three.module.js","three/addons/": "https://cdn.jsdelivr.net/npm/three/examples/jsm/"}}';
document.body.appendChild(importmap);

let threejs = document.createElement('script')
threejs.type = "module";
threejs.innerHTML = "import * as THREE from 'three';";
threejs.innerHTML += "import * as GLTFLoader from 'three/addons/loaders/GLTFLoader.js';";
threejs.innerHTML += "window.initTHREE(THREE,GLTFLoader.GLTFLoader);";
document.body.appendChild(threejs);

let renderer = null;
let moveArm = null;
let camera = null;
let braccio = null;

window.initTHREE = (THREE,GLTFLoader)=>{
  const loader = new GLTFLoader();
  let clock = new THREE.Clock();
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  braccio = new THREE.Group();
  scene.add(braccio);

  loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Braccio%20fisso.glb",(GLTF)=>{
    braccio.add(GLTF.scene);
  })
  loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Braccio1.glb",(GLTF)=>{
    GLTF.scene.rotateX(Math.PI*.5);
    GLTF.scene.position.set(0.02018,.11657,-0.01306)
    braccio.add(GLTF.scene);
  })
  loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Braccio3.glb",(GLTF)=>{
    GLTF.scene.rotateX(Math.PI*.5);
    GLTF.scene.rotateZ(Math.PI);  
    GLTF.scene.position.set(-0.27,.11657,0)
    braccio.add(GLTF.scene);
  })
  loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Ring%20esterno.glb",(GLTF)=>{
    GLTF.scene.rotateX(Math.PI*.5);
    GLTF.scene.position.set(-0.15,.11657,0)
    braccio.add(GLTF.scene);
  })
  loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Tavola%20rotante.glb",(GLTF)=>{
    GLTF.scene.position.set(0,-0.02,0)  
    braccio.add(GLTF.scene);
  })

  braccio.scale.set(5,5,5);
  braccio.position.set(0,0,-7);

  camera.position.set(0,0,0);
  camera.lookAt(0,0,-5);

  /**
   * Importare e posizionare le braccia
   */

  moveArm = (dati)=>{
    console.log(dati);
    //dati t1,t2,t3,t4 i 4 trimmers
  }

  let dt = 0;
  let animate = ()=>{
    requestAnimationFrame( animate );
    dt = clock.getDelta();
    braccio.rotateY(dt)
    renderer.render( scene, camera );
  }
  
  animate();
};

let menu = document.createElement('div');
menu.style.textAlign = "center";
menu.style.color = "#73C2FB"

let div_title = document.createElement('div');
let title = document.createElement('label');
title.textContent = "BRACCIO ROBOTICO";
title.style.fontFamily = "'courier new',monospace";
div_title.style.borderBottom = "solid 5px #73C2FB";
div_title.style.borderTop = "solid 5px #73C2FB";
div_title.style.marginTop = "100px"
div_title.appendChild(title);
menu.appendChild(div_title);

let btn_menu = document.createElement('button');
btn_menu.style.backgroundColor = "#73C2FB";
btn_menu.style.borderRadius = "100%"
btn_menu.style.borderColor = "#111E6C"
btn_menu.style.marginTop = "300px"
menu.appendChild(btn_menu);
document.body.appendChild(menu);
document.body.style.backgroundColor = "#1D2951"

clicked_f = ()=>{
  menu.style.display = "none";
  renderer.domElement.style.display = "block";
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.appendChild( renderer.domElement );
  renderer.domElement.style.display = "block";
}

btn_menu.onclick = ()=>{
  if(menu.style.opacity) return;
  let f = (t,t2)=>{ setTimeout(()=>{
    t2 = 10;
    if(t>0){
      menu.style.opacity=t/100;
      f(t-1,t2);
    }else clicked_f();
  },t2)};
  f(100,0);
}

/*
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = 'block';
document.body.appendChild(canvas);*/
document.body.style.margin = "5px";

function onResize(){
  let biggest = window.innerWidth>window.innerHeight?window.innerWidth:window.innerHeight;
  title.style.fontSize = biggest/15 + "px";
  btn_menu.style.width = biggest/10 + "px";
  btn_menu.style.height = biggest/10 + "px";
  if(renderer){
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    braccio.position.set(0,0,-5/camera.aspect)
  }
  //canvas.width = window.innerWidth;
  //canvas.height = window.innerHeight;
}

onResize();
window.onresize = onResize;

if (!!window.EventSource) {
  var source = new EventSource('/events');

  source.addEventListener('open', function (e) {
    console.log("Events Connected");
  }, false);
  source.addEventListener('error', function (e) {
    if (e.target.readyState != EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  }, false);

  source.addEventListener('message', function (e) {
    try {
      let obj = JSON.parse(e.data);
      if(moveArm) moveArm(obj);
    } catch (error) {     
      console.log("message", e.data); 
    }
  }, false);
}