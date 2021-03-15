const socket =io();


//Elements
const $messageForm = document.querySelector('#message-form');
const $messageInput = $messageForm.querySelector('#message');
const $messageButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('server-message', (response)=> {
  console.log(response);
  const html = Mustache.render(messageTemplate, {
    message: response.text,
    createdAt: moment(response.createdAt).format('h:mm a'),
  })  
  $messages.insertAdjacentHTML('beforeend', html);
})

socket.on('location-message', (response)=> {
  console.log(response);
  const html = Mustache.render(locationTemplate, {
    location: response.text,
    createdAt: moment(response.createdAt).format('h:mm a'),
  })
  $messages.insertAdjacentHTML('beforeend', html);
})

$messageForm.addEventListener('submit', (event)=> {
  event.preventDefault();
  $messageButton.setAttribute('disabled', 'disabled');
  const message = $messageInput.value;
  socket.emit('send-message', message, (error)=> {
    $messageButton.removeAttribute('disabled');
    $messageInput.value = '';
    $messageInput.focus();
    console.log(error);
  });
})

$locationButton.addEventListener('click', ()=> {
  $locationButton.setAttribute('disabled', 'disabled');
  if(!navigator.geolocation) {
    $locationButton.removeAttribute('disabled');
    return alert('Geolocation is not supported by your browser')
  }
  navigator.geolocation.getCurrentPosition((position)=> {
    const locationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }
    socket.emit('send-location', locationData, (response)=> {
      console.log(response);
      $locationButton.removeAttribute('disabled');
    });
  })
});

socket.emit('join', {
  username,
  room
})