function updateTime() {
  var now = new Date();
  var dateTimeString = now.toLocaleString('en-US', { hour12: true });
  document.getElementById('currentDateTime').innerText = dateTimeString;
      }

      setInterval(updateTime, 1);