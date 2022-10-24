class D2Panel {
    constructor(container) {
        let panel = this.panel = document.createElement('div');
        panel.classList.add('d2-panel');
        let canvas = this.canvas = document.createElement('canvas');
        panel.appendChild(canvas);
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        this.ctx = canvas.getContext('2d');   
        container.appendChild(panel);
        const maxDim = this.maxDim = 5;
        const n =  2**maxDim;
        const vertices = this.vertices = [ ...Array(n).keys() ].map( i => ({i}));
        this.edges = [];
        this.vertices.forEach(v => {
            let a = v.i;
            let p = 1;
            for(let d=0; d<maxDim; d++, p<<=1) {
                if(a&p) continue;
                this.edges.push({va:v, vb:vertices[a|p]});
            }
        });
        // this.base = [[60,0],[0,60],[45,15]];  
        this.setCurrentDim(2.5);      
    }
    
    setCurrentDim(d) {
        this.currentDim = d;
        const floorD = Math.floor(d);
        const ceilD = Math.ceil(d);
        
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
        
        let buttShortingFactor = 1;
        if(floorD == 3) { 
            const s = buttShortingFactor;
            ee[2][0] *= s; ee[2][1] *= s; 
        } else if(floorD == 4) {
            const s = (1-sizeParameter) * buttShortingFactor + sizeParameter;
            ee[2][0] *= s; ee[2][1] *= s; 
        }
        let n = 1<<floorD;
        console.log(ee);
        this.base = ee.map(([x,y],i)=>[50*x*ts[i],50*y*ts[i]]);
    }

    computePoints() {
        const { canvas, base, maxDim }  = this;
        const { width, height } = canvas;
        this.vertices.forEach(v => {
            v.x = width/2;
            v.y = height/2;
            for(let d=0; d<maxDim; d++) {
                let sgn = -1 + 2*((v.i>>d)&1);
                v.x += sgn * base[d][0];
                v.y += sgn * base[d][1];
            }
        })
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
    repaint() {
        const { canvas, ctx, maxDim, base, vertices, edges } = this;
        const width = canvas.width = canvas.clientWidth;
        const height = canvas.height = canvas.clientHeight;

        ctx.clearRect(0,0,width,height);
        this.computePoints();
        edges.filter(e=>e.isVisible).forEach(e => this.drawEdge(e));
        vertices.filter(v=>v.isVisible).forEach(v => this.drawVertex(v));
    }
}

