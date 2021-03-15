const users = [];

const addUser = ({username, room, id}) => {
  //Clean inputs
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  //Validate 
  if(!username || !room) {
    return {
      error: 'Username and room are required'
    }
  }
  //Check if user exists already
  const userExists = users.find((user)=>user.username===username&&user.room==room);
  if(userExists) {
    return {
      error: 'Username is already in use'
    }
  }
  //Store user
  const user = {id, username, room};
  users.push(user);
  return {user}; //{user:user}
}

const getUser = (id) => {
  const userExists = users.find((user)=>user.id===id);
  return userExists;
}

const getUsersInRoom = (room) => {
  return users.filter((element)=>element.room ===room);
}

// const updateUser = (id, updateData) => {
//   const userExists = users.find((user)=>user.id===id);
//   if (!userExists) {
//     return {
//       error: 'User does not exist'
//     }
//   }
//   const updates = updateData.keys();
//   const allowedUpdates = ['username', 'room'];
//   const updatesAllowed = updates.every((element)=>allowedUpdates.contains(element))
//   updates.array.forEach(element => {
//     userExists[element] = updateData[element];
//   });
  
// }

const removeUser = (id) => {
  const index = users.findIndex((user)=>user.id===id);
  //Check user exists
  if(index===-1) {
    return {
      error: 'User does not exist'
    }
  }
  //returns user that was removed
  return users.splice(index,1)[0];
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}