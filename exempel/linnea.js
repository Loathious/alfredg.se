// Opening status and today's row, from the opening hours below. Local time.
(function () {
  var hours = { 0: null, 1: [7, 17], 2: [7, 17], 3: [7, 17], 4: [7, 17], 5: [7, 17], 6: [8, 15] };
  var names = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
  var now = new Date();
  var day = now.getDay();
  var time = now.getHours() + now.getMinutes() / 60;
  var today = hours[day];
  var open = false;
  var text;

  if (today && time >= today[0] && time < today[1]) {
    open = true;
    text = 'Öppet nu · stänger kl. ' + today[1];
  } else if (today && time < today[0]) {
    text = 'Stängt · öppnar kl. ' + today[0] + ' i dag';
  } else {
    for (var i = 1; i <= 7; i++) {
      var next = (day + i) % 7;
      if (hours[next]) {
        text = 'Stängt · öppnar ' + (i === 1 ? 'i morgon' : 'på ' + names[next]) + ' kl. ' + hours[next][0];
        break;
      }
    }
  }

  var status = document.querySelector('[data-status]');
  var label = document.querySelector('[data-status-text]');
  if (status && label) {
    label.textContent = text;
    status.classList.toggle('closed', !open);
  }

  var row = document.querySelector('[data-hours] tr[data-days="' + day + '"]');
  if (row) row.classList.add('today');
})();
