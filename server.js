/**
 * Created by lailai on 2017/10/9.
 * 使用socket.io，其前后端句法是一致的，即通过socket.emit()来激发一个事件，通过socket.on()来侦听和处理对应事件。
 * 这两个事件通过传递的参数进行通信
 */
var express=require('express'),
   app=express();
   server=require('http').createServer(app),
   users=[],//保存所有在线用户的昵称
   io=require('socket.io').listen(server);//引入socket.io模块并绑定到服务
app.use('/',express.static(__dirname+'/www')); //指定静态文件所在位置
server.listen(8000);//监听端口
console.log('server started success');

//socket部分
io.on('connection',function(socket){
    //接收并处理客服端发送的login事件
    socket.on('login',function(nickname){
        if(users.indexOf(nickname)>-1){
            socket.emit('nickExisted');
        }else{
            socket.userIndex=users.length;
            socket.nickname=nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            console.log(users.length);
            console.log(users);
            io.sockets.emit('system',nickname,users.length,'login');//向所有连接到服务器的客服端发送当前登录用户的昵称
        }
    });
    //断开连接的事件
    socket.on('disconnect',function(){
        users.splice(socket.userIndex,1);
        //通知除自己外的所有人
        socket.broadcast.emit('system',socket.nickname,users.length,'logout');
    });
    socket.on('postMsg',function(msg,color){
        socket.broadcast.emit('newMsg',socket.nickname,msg,color);
    });
    //接收用户发来的图片
    socket.on('img',function(imgData){
        socket.broadcast.emit('newImg',socket.nickname,imgData);
    });
});