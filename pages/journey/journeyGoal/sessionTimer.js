/* Wall-clock session tracking. No storage, automatic milestone completion or network calls. */
class HobbySessionClock {
 constructor(minutes,now=()=>Date.now()){this.now=now;this.reset(minutes);}
 reset(minutes){if(!Number.isInteger(minutes)||minutes<5||minutes>480)throw Error('Choose 5–480 whole minutes.');this.plannedMinutes=minutes;this.remaining=minutes*60;this.elapsed=0;this.phase='ready';this.at=0;}
 tick(){if(this.phase==='running'){const current=this.now(),delta=Math.max(0,(current-this.at)/1000);this.at=current;const used=Math.min(delta,this.remaining);this.elapsed+=used;this.remaining=Math.max(0,this.remaining-used);if(this.remaining===0)this.phase='expired';}return this.phase;}
 start(){if(this.phase!=='ready'&&this.phase!=='paused')return;this.phase='running';this.at=this.now();}
 pause(){this.tick();if(this.phase==='running')this.phase='paused';}
 extend(minutes){this.tick();if(!Number.isInteger(minutes)||minutes<5||minutes>180||this.plannedMinutes+minutes>480)throw Error('Add 5–180 whole minutes, up to 480 minutes in one session.');if(!['running','paused','expired'].includes(this.phase))return;this.remaining+=minutes*60;this.plannedMinutes+=minutes;if(this.phase==='expired'){this.phase='running';this.at=this.now();}}
 end(){this.tick();if(['ready','ended'].includes(this.phase))return null;this.phase='ended';return {plannedMinutes:this.plannedMinutes,elapsedSeconds:Math.round(this.elapsed)};}
}
function mountGoalSession(host,goal,sync){
 const minutes=Number.isInteger(goal.plannedMinutes)&&goal.plannedMinutes>=5&&goal.plannedMinutes<=480?goal.plannedMinutes:30;
 const clock=new HobbySessionClock(minutes);
 goal.sessions=Array.isArray(goal.sessions)?goal.sessions.slice(-20):[];
 host.innerHTML=`<div class="jdSessionHeader"><div><p class="jdEyebrow">A LITTLE TIME FOR YOURSELF</p><h2>Your practice session</h2><p>Work at your pace. Tick milestones only when you finish them.</p></div><div class="jdSessionClock" role="timer" aria-label="Session time remaining"><strong id="sessionClock">00:00</strong><small id="sessionPhase">Ready when you are</small></div></div><div id="sessionDurationChoice"></div><div class="jdSessionActions"><button type="button" class="journeyMainBtn" id="sessionStart">Start session</button><button type="button" class="hhBtn hhBtnOutline" id="sessionPause" hidden>Pause</button><button type="button" class="hhBtn hhBtnOutline" id="sessionEnd" hidden>End session &amp; keep progress</button></div><p id="sessionFeedback" class="jdSessionFeedback" role="status" aria-live="polite">Your goal can take more than one session.</p><div id="sessionExtra" class="jdSessionExtra" hidden><label for="sessionExtraMinutes">Need more time? Add minutes</label><div><input id="sessionExtraMinutes" type="number" min="5" max="180" step="1" inputmode="numeric" value="5"><button type="button" class="hhBtn hhBtnOutline" id="sessionExtend">Add time</button></div><small>5–180 minutes extra; up to 8 hours per session.</small><p id="sessionTimeError" role="alert" hidden></p></div><div class="jdSessionSummary" id="sessionHistory"></div>`;
 const get=id=>host.querySelector('#'+id),picker=mountSessionDuration(get('sessionDurationChoice'),'practiceDuration',minutes);
 let previous=clock.phase,interval=null;
 function history(){const rows=goal.sessions;get('sessionHistory').textContent=rows.length?`${rows.length} recent session${rows.length===1?'':'s'} · ${Math.round(rows.reduce((sum,row)=>sum+(Number(row.elapsedSeconds)||0),0)/60)} min practised`:'No sessions logged yet.';}
 function draw(){
  clock.tick();const seconds=Math.ceil(clock.remaining);get('sessionClock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  const phase=clock.phase,started=!['ready','ended'].includes(phase);
  get('sessionPhase').textContent={ready:'Ready when you are',running:'A little focus, a little progress',paused:'Paused — take your time',expired:'Time for a check-in',ended:'Session logged'}[phase];
  get('sessionDurationChoice').hidden=started;get('sessionStart').hidden=['running','expired'].includes(phase);get('sessionStart').textContent=phase==='paused'?'Resume session':phase==='ended'?'Start next session':'Start session';
  get('sessionPause').hidden=phase!=='running';get('sessionEnd').hidden=!started;get('sessionExtra').hidden=!started;
  if(phase==='expired'&&previous!=='expired')get('sessionFeedback').textContent='Your planned time is up. What did you finish? Tick completed milestones below, then add time or end this session. Unfinished steps stay ready for next time.';
  previous=phase;
 }
 get('sessionStart').addEventListener('click',()=>{
  if(clock.phase==='ready'||clock.phase==='ended'){const duration=picker.read();if(duration===null)return;clock.reset(duration);goal.plannedMinutes=duration;sync();}
  clock.start();get('sessionFeedback').textContent='Your session is running. You can pause, add time, or end whenever you need.';draw();
 });
 get('sessionPause').addEventListener('click',()=>{clock.pause();get('sessionFeedback').textContent='Paused. This break does not count toward your practice time.';draw();});
 get('sessionExtend').addEventListener('click',()=>{try{clock.extend(Number(get('sessionExtraMinutes').value));goal.plannedMinutes=clock.plannedMinutes;get('sessionTimeError').hidden=true;get('sessionFeedback').textContent='More room to explore. Your completed milestones stay completed.';sync();draw();}catch(error){get('sessionTimeError').textContent=error.message;get('sessionTimeError').hidden=false;}});
 get('sessionEnd').addEventListener('click',()=>{const record=clock.end();if(!record)return;const done=goal.milestones.filter(m=>m.done).length;goal.sessions.push({...record,completedMilestones:done,totalMilestones:goal.milestones.length});goal.sessions=goal.sessions.slice(-20);sync();history();get('sessionFeedback').textContent=done===goal.milestones.length?'Every milestone is complete. Take a moment to celebrate what you made!':`${done} of ${goal.milestones.length} milestones complete. Your remaining steps are ready for your next session. You can edit your plan below if a step needs to be smaller.`;draw();});
 history();draw();interval=setInterval(draw,250);window.addEventListener('pagehide',()=>clearInterval(interval),{once:true});
}
