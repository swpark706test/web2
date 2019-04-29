function joinChatRoom(obj){
  // var test = document.getElementById('chantInfo_div').children[2];
  // var chat_no = document.getElementById('chantInfo_div').children['chat_no'];
  var chatroom_no = obj.children['chatroom_no'];
  var chatroom_title = obj.children['title1'];
  // var title = obj.getElementById('title');

  location.href="chatting?chatroom_no=" + chatroom_no.value + "&chatroom_title=" + chatroom_title.value;
}

// function enterChannels(){
//   // var member_no = document.getElementById('member_no').value;
//   var href = 'http://localhost:3000/channels';
//   window.open(this.href, 'W3W Chatting','width=440px,height=500px,scrollbars=1,status=no');
// }

function openChannel(){
  location.href="findMembers";
}
