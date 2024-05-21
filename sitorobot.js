console.log(document);

window.addEventListener("DOMContentLoaded",()=>{

  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  document.appendChild(canvas);

  document.body.style.margin = 0;

  if (!!window.EventSource) {
    var source = new EventSource('/events');
    
    source.addEventListener('open', function(e) {
     console.log("Events Connected");
    }, false);
    source.addEventListener('error', function(e) {
     if (e.target.readyState != EventSource.OPEN) {
       console.log("Events Disconnected");
     }
    }, false);
    
    source.addEventListener('message', function(e) {
     console.log("message", e.data);
    }, false);
   }
})