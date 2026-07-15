// Đồng Bộ — dữ liệu đồ thị liên kết giữa các Insight (kiểu Obsidian graph view)
// nodes: id, label ngắn, gộp theo nhánh (quant = định lượng, phil = triết học-biểu tượng, found = nền tảng)
const GRAPH_NODES = [
  {id:1,  label:"#1 Thức tỉnh", branch:"found"},
  {id:2,  label:"#2 Toàn cảnh", branch:"found"},
  {id:3,  label:"#3 Não rỗng", branch:"found"},
  {id:4,  label:"#4 Thông tin & CN", branch:"found"},
  {id:5,  label:"#5 Não lượng tử", branch:"found"},
  {id:6,  label:"#6 Cộng hưởng", branch:"found"},
  {id:7,  label:"#7 Đồng bộ RLT", branch:"quant"},
  {id:8,  label:"#8 Ranh giới", branch:"quant"},
  {id:9,  label:"#9 Công cụ pilot", branch:"quant"},
  {id:10, label:"#10 Cội nguồn", branch:"phil"},
  {id:11, label:"#11 Tự Ngã", branch:"phil"},
  {id:12, label:"#12 Cảm ứng cổ điển", branch:"found"},
  {id:13, label:"#13 Ngoại nhóm", branch:"found"},
  {id:14, label:"#14 Trung Thu 2006", branch:"phil"},
  {id:15, label:"#15 Gà con 1994", branch:"phil"},
  {id:16, label:"#16 Làm rỗng não bộ", branch:"found"},
  {id:17, label:"#17 Hai Loại Lượng Tử", branch:"quant"},
  {id:18, label:"#18 Giọng Nói Bên Tai", branch:"found"},
];

// edges: liên kết tường minh (mục "Liên kết" trong từng file) — type "explicit"
const GRAPH_EDGES_EXPLICIT = [
  [2,1],[6,5],[7,5],[7,6],[8,6],[8,7],[9,8],[10,8],[10,9],
  [11,5],[11,6],[11,10],[12,3],[12,6],[12,8],
  [14,7],[14,8],[14,10],[14,11],[15,10],[15,11],[15,14],[16,3],[16,10],
  [17,7],[17,8],[17,9],[17,10],[17,11],
  [18,6],[18,8],[18,10],[18,11],[18,16],[18,17],
];
// edges: kế tiếp tuần tự (weaker) — type "sequential"
const GRAPH_EDGES_SEQ = [];
for (let i = 1; i < GRAPH_NODES.length; i++) GRAPH_EDGES_SEQ.push([i, i+1]);

const BRANCH_COLOR = { found: "#36c", quant: "#14866d", phil: "#8b4fc7" };

function renderGraph(svgEl, opts) {
  opts = opts || {};
  const w = svgEl.clientWidth || 860, h = 420;
  svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);

  const nodes = GRAPH_NODES.map(n => ({...n,
    x: w/2 + (Math.random()-0.5)*w*0.7,
    y: h/2 + (Math.random()-0.5)*h*0.7,
    vx:0, vy:0 }));
  const byId = Object.fromEntries(nodes.map(n=>[n.id,n]));
  const edges = [
    ...GRAPH_EDGES_SEQ.map(([a,b])=>({a,b,type:"sequential"})),
    ...GRAPH_EDGES_EXPLICIT.map(([a,b])=>({a,b,type:"explicit"})),
  ];

  // simple force simulation (verlet-ish, no deps)
  function tick() {
    // repulsion
    for (let i=0;i<nodes.length;i++){
      for (let j=i+1;j<nodes.length;j++){
        const A=nodes[i], B=nodes[j];
        let dx=A.x-B.x, dy=A.y-B.y;
        let d2 = dx*dx+dy*dy || 0.01;
        let d = Math.sqrt(d2);
        const force = 900/d2;
        dx/=d; dy/=d;
        A.vx += dx*force; A.vy += dy*force;
        B.vx -= dx*force; B.vy -= dy*force;
      }
    }
    // attraction along edges
    edges.forEach(e=>{
      const A=byId[e.a], B=byId[e.b];
      const targetLen = e.type==="explicit" ? 90 : 70;
      let dx=B.x-A.x, dy=B.y-A.y;
      let d = Math.sqrt(dx*dx+dy*dy) || 0.01;
      const k = e.type==="explicit" ? 0.02 : 0.012;
      const force = (d-targetLen)*k;
      dx/=d; dy/=d;
      A.vx += dx*force; A.vy += dy*force;
      B.vx -= dx*force; B.vy -= dy*force;
    });
    // center gravity + damping + integrate
    nodes.forEach(n=>{
      n.vx += (w/2-n.x)*0.001;
      n.vy += (h/2-n.y)*0.001;
      n.vx*=0.82; n.vy*=0.82;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(24, Math.min(w-24, n.x));
      n.y = Math.max(20, Math.min(h-20, n.y));
    });
  }
  for (let i=0;i<220;i++) tick();

  const svgNS = "http://www.w3.org/2000/svg";
  function el(tag, attrs) {
    const e = document.createElementNS(svgNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  const edgeGroup = el("g", {});
  const nodeGroup = el("g", {});
  edges.forEach(e=>{
    const A=byId[e.a], B=byId[e.b];
    const line = el("line", {
      class: "graph-edge" + (e.type==="explicit" ? " explicit" : ""),
      x1:A.x, y1:A.y, x2:B.x, y2:B.y,
      "stroke-width": e.type==="explicit" ? 1.4 : 1
    });
    edgeGroup.appendChild(line);
  });

  let dragging = null;
  nodes.forEach(n=>{
    const g = el("g", {class:"graph-node", transform:`translate(${n.x},${n.y})`});
    const r = n.id === opts.currentId ? 9 : 6;
    const c = el("circle", {r, fill: BRANCH_COLOR[n.branch] || "#888"});
    if (n.id === opts.currentId) c.setAttribute("stroke", "#c8963e"), c.setAttribute("stroke-width", 2.5);
    const t = el("text", {x: r+5, y: 3});
    t.textContent = n.label;
    g.appendChild(c); g.appendChild(t);
    g.addEventListener("click", (ev)=>{
      if (g._dragged) { g._dragged=false; return; }
      if (opts.onNavigate) opts.onNavigate(n.id);
    });
    g.addEventListener("mousedown", (ev)=>{
      dragging = n; g._dragged=false;
      ev.preventDefault();
    });
    nodeGroup.appendChild(g);
    n._g = g; n._c = c;
  });

  svgEl.addEventListener("mousemove", (ev)=>{
    if (!dragging) return;
    dragging._g._dragged = true;
    const pt = svgEl.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const loc = pt.matrixTransform(svgEl.getScreenCTM().inverse());
    dragging.x = loc.x; dragging.y = loc.y;
    dragging.vx = 0; dragging.vy = 0;
    edgeGroup.querySelectorAll("line").forEach((line, idx) => {
      const e = edges[idx];
      const A = byId[e.a], B = byId[e.b];
      line.setAttribute("x1", A.x); line.setAttribute("y1", A.y);
      line.setAttribute("x2", B.x); line.setAttribute("y2", B.y);
    });
    dragging._g.setAttribute("transform", `translate(${dragging.x},${dragging.y})`);
  });
  window.addEventListener("mouseup", ()=>{ dragging = null; });

  svgEl.innerHTML = "";
  svgEl.appendChild(edgeGroup);
  svgEl.appendChild(nodeGroup);
}
