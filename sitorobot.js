console.log(document);

let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = 'block';
document.body.appendChild(canvas);
document.body.style.margin = 0;

if (!!window.EventSource) {
  var source = new EventSource('/events');

  source.addEventListener('open', function (e) {
    console.log("Events Connected");
  }, false);
  source.addEventListener('error', function (e) {
    if (e.target.readyState != EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  }, false);

  source.addEventListener('message', function (e) {
    try {
      let obj = JSON.parse(e.data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(window.innerWidth/2,window.innerHeight/2,100,300*Number(obj.t1)/4095) 
    } catch (error) {     
      console.log("message", e.data); 
    }
  }, false);
}