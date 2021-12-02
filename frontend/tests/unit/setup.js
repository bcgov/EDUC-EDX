createAppDiv();
function createAppDiv() {
  var app = document.createElement('div');
  app.setAttribute('data-app', true);
  document.body.appendChild(app);
}
