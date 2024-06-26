let importmap = document.createElement('script'); //imports per Three.js, il motore grafico per visualizzare il braccio 
importmap.type = "importmap";
importmap.innerHTML = '{"imports": {"three": "https://cdn.jsdelivr.net/npm/three/build/three.module.js","three/addons/": "https://cdn.jsdelivr.net/npm/three/examples/jsm/"}}';
document.body.appendChild(importmap);

let threejs = document.createElement('script') //modulo per integrare threejs all'interno della pagina e associarlo ad una variabile dell'oggetto window
threejs.type = "module";
threejs.innerHTML = "import * as THREE from 'three';";
threejs.innerHTML += "import * as GLTFLoader from 'three/addons/loaders/GLTFLoader.js';";
threejs.innerHTML += "window.initTHREE(THREE,GLTFLoader.GLTFLoader);";
document.body.appendChild(threejs);

let renderer = null;
let camera = null;

window.initTHREE = (THREE,GLTFLoader)=>{ //funzione associata richiamata dal modulo una volta caricata la libreria threejs
  const loader = new GLTFLoader();
  let clock = new THREE.Clock();
  
  renderer = new THREE.WebGLRenderer(); //inizializzazione renderer grafico
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  const braccio = new THREE.Group();  //gruppi per ruotare i pezzi di braccio
  const braccio1 = new THREE.Group();
  const braccio2 = new THREE.Group();
  const braccio3 = new THREE.Group();
  scene.add(braccio);
  braccio.add(braccio1);
  braccio1.add(braccio2);
  braccio2.add(braccio3);

  loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Braccio%20fisso.glb",(GLTF)=>{
    braccio.add(GLTF.scene); //modello braccio fisso
  })
  loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Tavola%20rotante.glb",(GLTF)=>{ //modello base tavola
    GLTF.scene.position.set(0,-0.02,0);
    braccio.add(GLTF.scene);
  })
  loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Braccio1.glb",(GLTF)=>{ //modello braccio1
    GLTF.scene.rotateX(Math.PI*.5);
    braccio1.position.set(0.04,.11,0.01);
    braccio1.add(GLTF.scene);
    loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Ring%20esterno.glb",(GLTF)=>{ //caricamento conseguente dopo braccio1 di braccio 2 (connettore esterno)
      GLTF.scene.rotateX(Math.PI*.5);
      braccio2.position.set(-0.17,0,0);
      braccio2.add(GLTF.scene);
      loader.load("https://raw.githubusercontent.com/beatrice-sorio/SitoRobot/main/models/Braccio3.glb",(GLTF)=>{ //caricamento conseguente dopo braccio2 di braccio 3 
        GLTF.scene.rotateX(Math.PI*.5); //rotazione modello
        GLTF.scene.rotateZ(Math.PI);  
        braccio3.position.set(-0.1,0,0); //posizionamento modello
        braccio3.add(GLTF.scene);
      })
    })
  })

  braccio.scale.set(5,5,5);
  braccio.position.set(0,0,-7);

  camera.position.set(0,0,0);
  camera.lookAt(0,0,-7);

  let dati;
  //quando riceve dati dal server reimposta le rotazioni dei bracci
  (new EventSource('/events')).addEventListener('message', (evento)=>{
    dati = JSON.parse(evento.data);
    console.log(dati);
    braccio1.rotation.set(braccio1.rotation.x,braccio1.rotation.y,-Math.PI*Number(dati.t1)/21000);
    braccio2.rotation.set(braccio2.rotation.x,braccio2.rotation.y,-Math.PI*Number(dati.t2)/21000);
    braccio3.rotation.set(braccio3.rotation.x,braccio3.rotation.y,-Math.PI*Number(dati.t3)/21000);
    braccio.rotation.set(braccio.rotation.x,-Math.PI*Number(dati.t4)/21000,braccio.rotation.z);
  });

  let dt = 0; //delta tempo
  let animate = ()=>{ //ciclo di render
    requestAnimationFrame( animate );
    dt = clock.getDelta(); //tempo passato dal frame precedente
    renderer.render( scene, camera );
  }

  window.addEventListener("wheel",(ev)=>{ //scroll del mouse associato al distanziamento dal braccio
    braccio.position.z -= ev.deltaY/100;
    camera.lookAt(0,0,braccio.position.z);
  });
  
  animate();
};

function canvasAnim(){ //animazione per aumentare l'opacitá del canvas su cui viene disegnato il frame renderizzato
  renderer.domElement.style.opacity-=-0.01; //doppia negazione perché altrimenti fa concatenazione di stringhe
  if(renderer.domElement.style.opacity<1) return setTimeout(canvasAnim,10); //finché non ha raggiunto 1 di opacitá continua ad aumentarla con un tempo di 10 ms
  renderer.domElement.style.opacity = 1;  //una volta arrivato a 1 per sicurezza lo reimposta
}

function onClickAnim(){
  menu.style.opacity-=0.01; // stessa cosa precedente ma al contrario
  if(menu.style.opacity>0) return setTimeout(onClickAnim,10); 
  menu.style.display = "none";
  renderer.domElement.style.display = "block";
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  renderer.domElement.style.opacity = 0;
  document.body.appendChild( renderer.domElement );
  canvasAnim(); //una volta finito inizia l'animazione per far vedere il canvas
}

function onResize(){ //quando viene cambiata la dimensione della finestra
  let biggest = window.innerWidth>window.innerHeight?window.innerWidth:window.innerHeight;
  title.style.fontSize = biggest/15 + "px";
  btn_menu.style.width = biggest/10 + "px";
  btn_menu.style.height = biggest/10 + "px";
  if(renderer){
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
}

//creazione programmatica della pagina html
let menu = document.createElement('div'); 
menu.style.textAlign = "center";
menu.style.color = "#000000"
menu.style.opacity = 1;

let div_title = document.createElement('div');
let title = document.createElement('label');
title.innerHTML = "BRACCIO<br>ROBOTICO";
div_title.style.textAlign = "left";
title.style.fontFamily = "'courier new',monospace";
div_title.style.marginTop = "90px"
div_title.appendChild(title);
menu.appendChild(div_title);

let btn_menu = document.createElement('button');
btn_menu.style.backgroundColor = "#000000";
btn_menu.style.borderRadius = "100%"
btn_menu.style.borderColor = "#000000"
btn_menu.style.marginTop = "200px"
menu.appendChild(btn_menu);

document.body.appendChild(menu);
document.body.style.backgroundColor = "#ffffffff"
document.body.style.margin = "5px";

//associazione eventi alle relative funzioni
btn_menu.addEventListener("click",onClickAnim);
window.addEventListener("resize",onResize);
window.dispatchEvent(new Event('resize'));
