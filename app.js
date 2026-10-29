
const names=["Revisar mi nivel","Fundamentos y formatos","Fórmulas básicas","Funciones lógicas","Funciones condicionales","Funciones de búsqueda","Gestión de datos","Formato condicional","Tablas y bases de datos","Tablas dinámicas","Gráficos y visualización","Dashboard y evaluación final"];
const desc=["Diagnóstico inicial","Formatos y referencias","SUMA, PROMEDIO, MAX y MIN","SI, Y, O y SI.ERROR","SUMAR.SI y CONTAR.SI","BUSCARV y BUSCARX","Filtros y validación","Reglas y semáforos","Limpieza y tablas","Análisis con tablas dinámicas","Gráficos y reportes","Entrega y prueba final"];
const defaults={hours:[0,4,4,4,4,4,4,4,4,4,4,8],done:Array(12).fill(0),real:Array(12).fill(0),correct:Array(12).fill(0),attempt:Array(12).fill(0),scores:Array(12).fill(0),deliveries:[false,false,false],components:[false,false,false],finalScore:0,weeklyGoal:4,start:"2026-10-26",end:"2027-01-26"};
let state;try{state={...defaults,...JSON.parse(localStorage.getItem("excelPlanWebV1")||"{}")}}catch{state={...defaults}};
let view="dashboard";
const $=s=>document.querySelector(s),fmt=(n,d=1)=>Number(n).toFixed(d),sum=a=>a.reduce((x,y)=>x+(Number(y)||0),0),pct=(a,b)=>b?100*a/b:0;
const planned=()=>sum(state.hours),actual=()=>sum(state.real);
const progress=i=>i===0?(state.done[0]?100:0):Math.min(100,pct(state.real[i],state.hours[i]));
const average=()=>sum(names.map((_,i)=>progress(i)))/12;
const complete=()=>names.filter((_,i)=>progress(i)>=100).length;
const expected=()=>{const st=new Date(state.start+"T00:00:00"),en=new Date(state.end+"T00:00:00"),today=new Date();return Math.max(0,Math.min(100,pct(today-st,en-st)))};
const weeksLeft=()=>Math.max(0,(new Date(state.end+"T23:59")-new Date())/604800000);
const hoursLeft=()=>Math.max(0,planned()-actual());
const avgScore=()=>{let a=state.scores.filter((x,i)=>x>0&&state.attempt[i]>0);return a.length?sum(a)/a.length:0};
const precision=()=>pct(sum(state.correct),sum(state.attempt));
const productivity=()=>actual()?sum(state.correct)/actual():0;
const project=()=>state.components.filter(Boolean).length;
const items=()=>[
["Avance académico",average(),100,"%","Promedio de avance de 12 actividades"],
["Cumplimiento de horas",pct(actual(),planned()),100,"%","Horas reales / horas previstas"],
["Actividades finalizadas",pct(complete(),12),100,"%","Actividades completadas / 12"],
["Cumplimiento semanal",pct(actual(),planned()*Math.max(.01,expected()/100)),100,"%","Horas registradas / horas esperadas hasta hoy"],
["Avance esperado",expected(),100,"%","Tiempo transcurrido del cronograma"],
["Brecha de avance",average()-expected(),0,"pp","Avance real menos esperado; positivo es adelanto"],
["Horas pendientes",hoursLeft(),0,"h","Horas que faltan para cumplir el plan"],
["Ritmo requerido",weeksLeft()?hoursLeft()/weeksLeft():hoursLeft(),state.weeklyGoal,"h/sem","Horas pendientes divididas por semanas restantes"],
["Precisión de ejercicios",precision(),90,"%","Correctos / intentados"],
["Dominio por tema",avgScore(),80,"puntos","Promedio de notas de temas evaluados"],
["Productividad",productivity(),0,"ej/h","Ejercicios correctos por hora"],
["Entregables completos",state.deliveries.filter(Boolean).length,3,"archivos","Entregables marcados"],
["Evaluación final",state.finalScore,80,"puntos","Calificación de la prueba final"],
["Cumplimiento del proyecto",project(),3,"partes","Fórmulas, tabla dinámica y gráfico"]
];
const card=(title,value,sub)=>'<div class="card"><div class="statlabel">'+title+'</div><div class="stat">'+value+'</div><div class="muted">'+sub+'</div></div>';
function draw(){
const headings={dashboard:"Mi avance",plan:"Plan de estudio",practicas:"Mis prácticas",metricas:"Métricas definidas",resultados:"Resultados",ajustes:"Ajustes"};
$("#heading").textContent=headings[view];
document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
let html="";
if(view==="dashboard"){html='<div class="stats">'+card("Avance académico",fmt(average())+"%","Meta 100%")+card("Horas registradas",fmt(actual())+" / "+fmt(planned()),"Horas previstas")+card("Actividades completadas",complete()+" / 12","Seguimiento de tareas")+card("Avance esperado",fmt(expected())+"%","Según calendario")+'</div><div class="grid2 section"><div class="card"><h2>Progreso de mi aprendizaje</h2><p class="muted">Avance real</p><div class="bar"><div style="width:'+Math.min(100,average())+'%"></div></div><p class="muted">Avance esperado: '+fmt(expected())+'% · Brecha: '+fmt(average()-expected())+' pp</p></div><div class="card"><h2>Qué hacer ahora</h2><p>Ingresa tus horas en <b>Mis prácticas</b>. Registra tus ejercicios en <b>Plan de estudio</b> y marca tus entregables en <b>Resultados</b>.</p></div></div>';}
if(view==="plan"){html='<div class="card"><h2>12 actividades conectadas</h2><p class="muted">Las horas reales provienen de Mis prácticas. En esta sección registra ejercicios y calificaciones.</p>'+names.map((n,i)=>'<div class="task"><div><h3>'+(i+1)+'. '+n+'</h3><p>'+desc[i]+'</p><div class="meter">Avance: '+fmt(progress(i))+'% · '+(progress(i)>=100?"Completado":"Pendiente")+'</div>'+(i===0?'<label><input type="checkbox" data-field="done" data-index="0" '+(state.done[0]?"checked":"")+'> Diagnóstico realizado</label>':'')+'</div><div><label>Ejercicios correctos</label><input type="number" min="0" data-field="correct" data-index="'+i+'" value="'+state.correct[i]+'"><label>Intentados</label><input type="number" min="0" data-field="attempt" data-index="'+i+'" value="'+state.attempt[i]+'"><label>Nota (0–100)</label><input type="number" min="0" max="100" data-field="scores" data-index="'+i+'" value="'+state.scores[i]+'"></div></div>').join("")+'</div>';}
if(view==="practicas"){html='<div class="card"><h2>Registro de horas</h2><p class="note">Aquí ingresas las horas estudiadas, una sola vez. Las demás secciones se actualizan automáticamente.</p>'+names.map((n,i)=>'<div class="rowitem flex between"><div><b>'+(i+1)+'. '+n+'</b><div class="muted">Previstas: '+fmt(state.hours[i])+' h</div></div><div><label>Horas reales</label><input aria-label="Horas reales de '+n+'" type="number" min="0" max="300" step="0.5" data-field="real" data-index="'+i+'" value="'+state.real[i]+'"></div></div>').join("")+'</div>';}
if(view==="metricas"){html='<div class="card"><h2>Los 14 KPI de mi plan</h2><p class="muted">Resultados automáticos a partir de los registros. Las metas son objetivos de comparación.</p><div class="scroll"><table class="metrics"><thead><tr><th>Indicador</th><th>Qué mide</th><th>Resultado</th><th>Meta</th><th>Unidad</th></tr></thead><tbody>'+items().map(a=>'<tr><td><b>'+a[0]+'</b></td><td>'+a[4]+'</td><td>'+fmt(a[1])+'</td><td>'+fmt(a[2])+'</td><td>'+a[3]+'</td></tr>').join("")+'</tbody></table></div></div>';}
if(view==="resultados"){html='<div class="card"><h2>Entregables y prueba final</h2><p class="muted">Marca lo que hayas terminado. Los KPI cambian de manera automática.</p><h3>Archivos prácticos (meta: 3)</h3>'+["Archivo de fórmulas","Archivo con tablas dinámicas","Archivo de gráficos"].map((s,i)=>'<div class="rowitem"><label><input type="checkbox" data-field="deliveries" data-index="'+i+'" '+(state.deliveries[i]?"checked":"")+'> '+s+'</label></div>').join("")+'<h3>Proyecto final (3 partes)</h3>'+["Fórmulas correctas","Tabla dinámica funcional","Gráfico funcional"].map((s,i)=>'<div class="rowitem"><label><input type="checkbox" data-field="components" data-index="'+i+'" '+(state.components[i]?"checked":"")+'> '+s+'</label></div>').join("")+'<div class="rowitem"><label>Calificación final (0–100)</label><input type="number" min="0" max="100" data-field="finalScore" value="'+state.finalScore+'"><p>Estado: <b>'+(state.finalScore>=80&&project()===3&&state.deliveries.every(Boolean)?"Objetivo cumplido":"En progreso")+'</b></p></div></div>';}
if(view==="ajustes"){html='<div class="card"><h2>Configuración</h2><p class="muted">Puedes cambiar las horas previstas y el plazo, y realizar una copia de seguridad.</p><label>Fecha de inicio</label><input type="date" data-field="start" value="'+state.start+'"><label>Fecha límite</label><input type="date" data-field="end" value="'+state.end+'"><label>Meta semanal en horas</label><input type="number" data-field="weeklyGoal" min="0" value="'+state.weeklyGoal+'"><h3>Horas previstas por actividad</h3>'+names.map((n,i)=>'<div class="rowitem flex between"><span>'+n+'</span><input type="number" min="0" step="0.5" data-field="hours" data-index="'+i+'" value="'+state.hours[i]+'"></div>').join("")+'<p>Total previsto: '+fmt(planned())+' horas</p><div class="tools"><button class="btn primary" id="export">Exportar respaldo</button><label class="btn" style="cursor:pointer">Importar respaldo<input id="import" type="file" accept=".json" style="display:none"></label></div></div>';}
$("#view").innerHTML=html;
document.querySelectorAll("[data-field]").forEach(el=>el.addEventListener("change",()=>{const field=el.dataset.field,i=el.dataset.index,val=el.type==="checkbox"?el.checked:el.type==="number"?Math.max(0,Number(el.value)||0):el.value;if(i!==undefined)state[field][Number(i)]=val;else state[field]=val;localStorage.setItem("excelPlanWebV1",JSON.stringify(state));draw()}));
const exp=$("#export");if(exp)exp.onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="respaldo-mi-progreso.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
const imp=$("#import");if(imp)imp.onchange=async()=>{try{const data=JSON.parse(await imp.files[0].text());state={...defaults,...data};localStorage.setItem("excelPlanWebV1",JSON.stringify(state));draw();alert("Respaldo importado")}catch{alert("Archivo no válido")}};
}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;draw()}));
draw();
