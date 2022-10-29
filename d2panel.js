class D2Panel {
    constructor(container, hypercube) {
        this.container = container;
        this.hypercube = hypercube;
        this.maxDim = Math.min(5, hypercube.maxDim);
        let panel = this.panel = document.createElement('div');
        panel.classList.add('d2-panel');
        let canvas = this.canvas = document.createElement('canvas');
        panel.appendChild(canvas);
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        this.ctx = canvas.getContext('2d');   
        container.appendChild(panel);
        this.vertices = hypercube.vertices.map(v=>({x:0, y:0, idx:v.idx, hv:v}));
        this.base = Array(5).fill().map(()=>[0,0]);
    }
    
    repaint() {
        const { canvas, ctx } = this;
        const width = canvas.width = canvas.clientWidth;
        const height = canvas.height = canvas.clientHeight;
        ctx.clearRect(0,0,width,height);        
        this.computeBase();
        this.computePoints();
        this.drawEdges();
        this.drawPoints();
    }

    computeBase() {
        const base = this.base;
        const unit = 40.0;
        function setBase(i,p,t=1) { base[i][0] = p[0]*unit*t; base[i][1] = p[1]*unit*t; }
        function getDir(phi) { return [Math.cos(phi), Math.sin(phi)]; }
        let v45 = getDir(Math.PI/4);
        const floorD = this.hypercube.floorD;
        const param = this.hypercube.parameter;
        if(floorD == 0) {
            setBase(0,[1,0],param);
            for(let i=1;i<5;i++) setBase(i,[0,0]);
        } else if(floorD == 1) {
            setBase(0,[1,0] );
            setBase(1,[0,1], param);
            for(let i=2;i<5;i++) setBase(i,[0,0]);
        } else if(floorD == 2) {
            setBase(0,[1,0]);
            setBase(1,[0,1]);
            setBase(2,v45, param*0.5);
            for(let i=3;i<5;i++) setBase(i,[0,0]);
        } else if(floorD == 3) {
            setBase(0,[1,0]);
            setBase(1,[0,1]);
            setBase(2,v45, (1+param)*0.5);
            setBase(3,[-v45[0],v45[1]], param);
            for(let i=4;i<5;i++) setBase(i,[0,0]);
        } else if(floorD >= 4) {
            let t = floorD == 4 ? param : 1;
            const u = Math.PI/5;
            // let psi = t*2*Math.PI/5;
            setBase(0,getDir(0));
            setBase(1,getDir((1-t) * Math.PI/2 + t * 2 * u));
            setBase(2,getDir((1-t) * Math.PI/4 + t * 1 * u));
            setBase(3,getDir((1-t) * 3*Math.PI/4 + t*4*u));
            setBase(4,getDir(3*u), t);
        } else if(floorD == 5) {
            const u = Math.PI/5;
            setBase(0,[1,0]);
            setBase(1,getDir(2*u));
            setBase(2,getDir(1*u));
            setBase(3,getDir(4*u));
            setBase(4,getDir(3*u),0);

        }
    }

    computePoints() {
        const maxDim = this.maxDim;
        const { canvas, base }  = this;
        
        this.vertices.forEach(v => {
            v.x = canvas.clientWidth/2;
            v.y = canvas.clientHeight/2;
            for(let d=0; d<maxDim; d++) {
                let sgn = -1 + 2*((v.idx>>d)&1);
                v.x += sgn * base[d][0];
                v.y += sgn * base[d][1];
            }
        })
    }

    drawEdges() {
        const ctx = this.ctx;
        ctx.beginPath();
        this.hypercube.edges.filter(e=>e.isVisible).forEach(e=>{
            let pa = this.vertices[e.va.idx];
            let pb = this.vertices[e.vb.idx];
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
        })
        ctx.lineWidth = 1;
        ctx.strokeStyle = "gray";
        ctx.stroke();
    }
    drawPoints() {
        const ctx = this.ctx;
        ctx.beginPath();
        const r = 2;
        this.hypercube.vertices.filter(e=>e.isVisible).forEach(v=>{
            let p = this.vertices[v.idx];
            ctx.moveTo(p.x+r, p.y);
            ctx.arc(p.x,p.y,r,0,Math.PI*2);
        })
        ctx.fillStyle = "#F88";
        ctx.fill();
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    setCurrentDim(d) {
        this.currentDim = d;
        const floorD = Math.floor(d);
        const ceilD = Math.ceil(d);
        
        // i vertici con i>=upperLimit sono invisibili
        const lowerLimit = 1<<floorD;
        const upperLimit = 1<<ceilD;
        this.vertices.forEach(v => {
            v.isVisible = v.i<upperLimit;
            v.isNew = lowerLimit <= v.i && v.i<upperLimit; 
        });
        this.edges.forEach(e => {
            e.isVisible = e.va.i<upperLimit && e.vb.i<upperLimit;
            e.isNew = e.isVisible && (e.va.i>=lowerLimit || e.vb.i>=lowerLimit);
        });

        let t = d-floorD;
        let ts = [...Array(this.maxDim).keys()]
            .map(i => i<floorD ? 1 : i<ceilD ? t : 0);

        const localParameter = (t0,t1) => t<=t0?0:t>=t1?1:(t-t0)/(t1-t0);
        let adjustParameter, sizeParameter, colorParameter;
        if(floorD == 5) {
            adjustParameter = localParameter(0.0, 0.2);
            sizeParameter = localParameter(0.2, 0.6);
            colorParameter = localParameter(0.6,1.0);
        } else {
            adjustParameter = 0;
            sizeParameter = localParameter(0.0, 0.5);
            colorParameter = localParameter(0.5,1.0);
        }
        let tt = adjustParameter;
        const ee = [[1,0]];
        let phi = Math.PI/2*(1-tt) + 3*Math.PI/5*tt;
        ee.push([Math.cos(phi), Math.sin(phi)]);
        phi = (Math.PI/4)*(1-tt) + (Math.PI/5)*tt;
        ee.push([Math.cos(phi), Math.sin(phi)]);
        
        phi = (3*Math.PI/4)*(1-tt) + (4*Math.PI/5)*tt;
        ee.push([Math.cos(phi), Math.sin(phi)]);
        
        phi = 2*Math.PI/5;
        ee.push([Math.cos(phi), Math.sin(phi)]);
        
        let buttShortingFactor = 0.5;
        if(floorD == 3) buttShortingFactor = 0.5 * (1-sizeParameter) + 1.0 * sizeParameter;
        else if(floorD >= 4) buttShortingFactor = 1;
        
        if(floorD == 2 || floorD == 3) { 
            const s = buttShortingFactor;
            ee[2][0] *= s; ee[2][1] *= s; 
        } else if(floorD == 4) {
            const s = (1-sizeParameter) * buttShortingFactor + sizeParameter;
            ee[2][0] *= s; ee[2][1] *= s; 
        }
        let n = 1<<floorD;
        this.base = ee.map(([x,y],i)=>[50*x*ts[i],50*y*ts[i]]);
        this.repaint();
        console.log(buttShortingFactor, sizeParameter, ee);
    }

    

    drawEdge(edge) {
        const { ctx } = this;
        ctx.beginPath();
        ctx.moveTo(edge.va.x, edge.va.y);
        ctx.lineTo(edge.vb.x, edge.vb.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = edge.isNew ? "magenta" : "blue";
        ctx.stroke();
    }

    drawVertex(vertex) {
        const { ctx } = this;
        const { x, y, isNew } = vertex;
        const r = 4;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle = isNew ? "magenta" : "yellow";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = "1";
        ctx.stroke();
    }    
    repaint_old() {
        const { canvas, ctx, maxDim, base, vertices, edges } = this;
        const width = canvas.width = canvas.clientWidth;
        const height = canvas.height = canvas.clientHeight;

        ctx.clearRect(0,0,width,height);
        this.computePoints();
        edges.filter(e=>e.isVisible).forEach(e => this.drawEdge(e));
        vertices.filter(v=>v.isVisible).forEach(v => this.drawVertex(v));
    }
}

