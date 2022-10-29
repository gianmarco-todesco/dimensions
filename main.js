window.addEventListener('DOMContentLoaded', initialize);

let dimButtons;
let d2Panel;
let d3Panel;
const hypercube = new Hypercube(5);

function initialize() {
    addStyles();
    let container = document.getElementById('animation-container');

    let buttonsPanel = createButtonsPanel();
    container.appendChild(buttonsPanel);

    d3Panel = new D3Panel(container, hypercube);
    d2Panel = new D2Panel(container, hypercube);

    window.container = container;
    window.buttonsPanel  = buttonsPanel;
    window.d3Panel = d3Panel;
    window.d2Panel = d2Panel;

    setInterval(tick, 20);
    d2Panel.repaint();
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
        btn.onclick = () => {
            hypercube.targetDim = idx;
            btn.classList.add('target');
        };
        if(idx == hypercube.currentDim) btn.classList.add('current');
        dimButtons.push(btn);
    }
    return panel;
}

function updateButtons() {
    dimButtons.forEach((btn,i) => {
        if(i==hypercube.currentDim) {
            btn.classList.remove('target');
            btn.classList.add("current");
        } else if(i==hypercube.targetDim) {
            btn.classList.remove('current');
            btn.classList.add("target");
        } else {
            btn.classList.remove('current', 'target');
        }
    })
}

function tick() {
    const speed = 0.05;
    if(hypercube.tick(speed)) {
        updateButtons();
        d2Panel.repaint();
        d3Panel.update();
    }
}




