window.addEventListener('DOMContentLoaded', initialize);

let currentDim = 0;
let targetDim = 0;
let dimButtons;
let d2Panel;

function initialize() {
    addStyles();
    let container = document.getElementById('animation-container');

    let buttonsPanel = createButtonsPanel();
    container.appendChild(buttonsPanel);
    let d3Panel = createD3Panel();
    container.appendChild(d3Panel);    

    d2Panel = new D2Panel(container);

    window.container = container;
    window.buttonsPanel  = buttonsPanel;
    window.d3Panel = d3Panel;
    window.d2Panel = d2Panel;

    setInterval(tick, 20);
}

function addStyles() {
    
    let style = document.createElement('style');
    style.innerHTML = `
        #animation-container {
            display:flex;
            flex-direction:row;
            border:solid 3px blue;
        }

        .buttons-panel {
            border:solid 3px cyan;
            display:flex;
            flex-direction:column;
            gap:30px;
            padding:10px;    
        }
        .buttons-panel button {
            border-radius:50%;
            width:30px;
            height:30px;
            border:solid 1px gray;
            background-color: #BBB;
        }
        .buttons-panel button:active {
            background-color:red;
        }
        .buttons-panel button:hover {
            background-color: #DDD;
        }
        .buttons-panel button.current {
            background-color:yellow;
        }
        .buttons-panel button.target {
            border:solid 3px yellow;
        }

        .d3-panel {
            flex:1;
            border:solid 1px gray;
        }
        .d2-panel {
            flex:1;
            border:solid 1px magenta;

        }

    `;
    document.head.appendChild(style);
}

function createButtonsPanel() {
    let panel = document.createElement('div');
    panel.classList.add('buttons-panel');
    dimButtons = [];
    for(let i=0; i<=5; i++) {
        let btn = document.createElement('button');
        btn.innerText = ""+i;
        panel.appendChild(btn);
        let idx = i;
        btn.onclick = () => setTargetDim(idx);
        if(idx == currentDim) btn.classList.add('current');
        dimButtons.push(btn);
    }
    return panel;
}

function setTargetDim(d) {
    if(d == targetDim) return;
    dimButtons[targetDim].classList.remove('target');
    targetDim = d;
    if(targetDim != currentDim)
        dimButtons[targetDim].classList.add('target');
}

function setCurrentDim(d) {
    let i1 = Math.ceil(currentDim);
    let i2 = Math.ceil(d);
    if(i1 != i2) {
        dimButtons[i1].classList.remove('current');
        dimButtons[i2].classList.add('current');
    }
    if(d == targetDim) 
       dimButtons[targetDim].classList.remove('target');
    currentDim = d;
}

function tick() {
    const speed = 0.05;
    if(targetDim > currentDim) {
        setCurrentDim(Math.min(currentDim + speed, targetDim));
    } else if(targetDim < currentDim) {
        setCurrentDim(Math.max(currentDim - speed, targetDim));
    }
    d2Panel.setCurrentDim(currentDim);
    d2Panel.repaint();
}


function createD3Panel() {
    let panel = document.createElement('div');
    panel.classList.add('d3-panel');
    return panel;
}

/*
let canvas, engine, scene, camera;

window.addEventListener('DOMContentLoaded', ()=>{
    canvas = document.getElementById('viewer');
    canvas.addEventListener('wheel', evt => evt.preventDefault());
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene
    camera = new BABYLON.ArcRotateCamera('cam', 
            Math.PI/2,0.7,
            15, 
            new BABYLON.Vector3(0,0,0), 
            scene);
    camera.attachControl(canvas,true);
    camera.wheelPrecision = 50;
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 13*2;            

    populateScene();
        
    engine.runRenderLoop(()=>scene.render());
    window.addEventListener("resize", () => engine.resize());
});

function populateScene() {


    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -1, 0), scene);
	light.position = new BABYLON.Vector3(0, 10, 0);

	//var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, scene);
	//lightSphere.position = light.position;
	//lightSphere.material = new BABYLON.StandardMaterial("light", scene);
	//lightSphere.material.emissiveColor = new BABYLON.Color3(1, 1, 0);

	// Ground
	var ground = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10}, scene);
    window.ground = ground;
	var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
	groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    
	ground.position.y = -2.05;
	ground.material = groundMaterial;

	// objects
    let cube = BABYLON.MeshBuilder.CreateBox('a', {size:1}, scene);
    let cube2 = BABYLON.MeshBuilder.CreateBox('a', {size:1}, scene);
    cube2.position.set(2,2,2)
    
	// Shadows
	var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
	shadowGenerator.getShadowMap().renderList.push(cube);
	shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 128;

	ground.receiveShadows = true;

}

*/


