"use strict";


function alignMesh(mesh, p1, p2) {
    let delta = p2.subtract(p1);
    mesh.position.set(0,0,0);
    mesh.lookAt(delta);
    mesh.rotate(BABYLON.Axis.X, Math.PI/2);
    mesh.scaling.set(1,delta.length()*0.5,1);
    BABYLON.Vector3.LerpToRef(p1,p2,0.5,mesh.position);   
}

class D3Panel {
    constructor(container, hypercube) {
        this.hypercube = hypercube;
        let panel = this.panel = document.createElement('div');
        panel.classList.add('d3-panel');
        let canvas = this.canvas = document.createElement('canvas');
        panel.appendChild(canvas);
        container.appendChild(panel);
        
        canvas.style.width = "100%";
        canvas.style.height = "100%";        
        canvas.addEventListener('wheel', evt => evt.preventDefault());
        let engine = this.engine = new BABYLON.Engine(canvas, true);
        let scene = this.scene = new BABYLON.Scene(engine);
        let camera = this.camera = new BABYLON.ArcRotateCamera('cam', 
            Math.PI/2,0.7,
            15, 
            new BABYLON.Vector3(0,0,0), 
            scene);
        camera.attachControl(canvas,true);
        camera.wheelPrecision = 50;
        camera.lowerRadiusLimit = 3;
        camera.upperRadiusLimit = 13*2;            

        this.populateScene();
        this.update();

        this.engine.resize();
        engine.runRenderLoop(()=>{ 
            if(canvas.width != canvas.clientWidth || 
                canvas.height != canvas.clientHeight) engine.resize();
            scene.render()
        });

        
    }

    resize() {
        this.engine.resize();
    }

    populateScene() {

        const scene = this.scene;

        scene.clearColor.set(1,1,1)

        var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -1, 0), scene);
        light.position = new BABYLON.Vector3(0, 10, 0);
    
        var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0,0,0), scene);
        light2.parent = this.camera;
        //var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, scene);
        //lightSphere.position = light.position;
        //lightSphere.material = new BABYLON.StandardMaterial("light", scene);
        //lightSphere.material.emissiveColor = new BABYLON.Color3(1, 1, 0);
    
        // Ground
        var ground = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10}, scene);
        window.ground = ground;
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        
        ground.position.y = -2.05;
        ground.material = groundMaterial;
    
        let ball = BABYLON.MeshBuilder.CreateSphere('a', {diameter:0.25}, scene);
        ball.material = new BABYLON.StandardMaterial('mat-a', scene);
        ball.material.specularColor.set(0.1,0.1,0.1);
        ball.material.diffuseColor.set(0.8,0.3,0.2);
        let balls = this.balls = [ball];
        let vertexCount = this.hypercube.vertices.length;
        for(let i=1; i<vertexCount; i++) balls.push(ball.createInstance('b'+i));
        balls.forEach(b=>b.isVisible = false);

        let cyl = new BABYLON.MeshBuilder.CreateCylinder('a', {diameter:0.1}, scene);
        cyl.material = new BABYLON.StandardMaterial('mat-a', scene);
        cyl.material.specularColor.set(0.1,0.1,0.1);
        cyl.material.diffuseColor.set(0.8,0.5,0.2);
        let edges = this.edges = [cyl];
        let edgeCount = this.hypercube.edges.length;
        for(let i=1; i<edgeCount; i++) edges.push(cyl.createInstance('e'+i));
        edges.forEach(e=>e.isVisible = false);


        // objects
        // Shadows
        var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        let renderList = shadowGenerator.getShadowMap().renderList;
        balls.forEach(ball=>renderList.push(ball));
        edges.forEach(edge=>renderList.push(edge));
        
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 128;
    
        ground.receiveShadows = true;
    }

    update() {
        let base = [
            new BABYLON.Vector3(1,0,0),
            new BABYLON.Vector3(0,1,0),
            new BABYLON.Vector3(0,0,1),
            new BABYLON.Vector3(0.2,0.3,0.4),
                        
        ];
        const balls = this.balls;
        balls.forEach((ball,i) => {
            let vertex = this.hypercube.vertices[i];
            ball.isVisible = vertex.isVisible;
            let p = ball.position;
            p.set(0,0,0);
            if(vertex.isVisible) {
                for(let j=0; j<3; j++) p.addInPlace(base[j].scale(vertex.ts[j]));
                let t = 1 + 0.3*vertex.ts[3];
                p.scaleInPlace(t);
                p.addInPlace(base[3].scale(vertex.ts[4]));
            }
        });
        this.edges.forEach((e,i) => {
            let edge = this.hypercube.edges[i];
            e.isVisible = edge.isVisible;
            if(e.isVisible) {
                let pa = balls[edge.va.idx].position;
                let pb = balls[edge.vb.idx].position;
                alignMesh(e, pa,pb);
            }
        });
        
    }
}

