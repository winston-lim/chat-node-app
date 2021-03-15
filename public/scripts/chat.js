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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
  const $newestMessage = $messages.lastElementChild;
  //Get the new message element offset height
  const newestMessageHeight = $newestMessage.offsetHeight;
  //Account for margin-bottom
  const newestMessageBottomMargin = parseInt(getComputedStyle($newestMessage).marginBottom);
  const newestMessageFullHeight = newestMessageHeight + newestMessageBottomMargin;
  //Get visible height
  const visibleHeight = $messages.offsetHeight;
  //Get containerHeight
  const containerHeight = $messages.scrollHeight;
  //Get scroll height from top
  const scrollOffSet = $messages.scrollTop + visibleHeight;  //visibleHeight==size of grey scrollBar. Adding both tells you distance from top of screen
  //Check if distance from bottom is 0 before message is send, if not, scroll to bottom
  //This is in the event user is looking at old records, then he should not automatically scroll to the bottom
  if(containerHeight - newestMessageFullHeight <=scrollOffSet) {
    $messages.scrollTop = $messages.scrollHeight;
  }
}

socket.on('server-message', (response)=> {
  console.log(response);
  const html = Mustache.render(messageTemplate, {
    message: response.text,
    createdAt: moment(response.createdAt).format('h:mm a'),
    username: response.username,
  })  
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
})

socket.on('location-message', (response)=> {
  console.log(response);
  const html = Mustache.render(locationTemplate, {
    location: response.text,
    createdAt: moment(response.createdAt).format('h:mm a'),
    username: response.username,
  })
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
})

socket.on('room-data', ({room, users})=> {
  const html = Mustache.render(sidebarTemplate, {room,users});
  document.querySelector('#sidebar').innerHTML = html;
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

socket.emit('join', {username,room}, (error)=> {
  if (error) {
    alert(error);
    location.href='/';
  }
})