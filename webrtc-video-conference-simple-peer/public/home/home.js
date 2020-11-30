if(window.sessionStorage.getItem("Username") != null){
    let username = window.sessionStorage.getItem("Username");
    let output = ``;
    output +=`
        <li><a href="./home.html">Home</a></li>
        <li id="userpro"><a href="../Signup/Signup.html">Sign Up</a></li>
        <li><a href="../Livehome/Livehome.html" id="logout">Logout</li>
    ` 
    document.getElementById('afterlogin').innerHTML = output;
    document.getElementById('userpro').innerHTML = '<a href="../proedit/proedit.html"><img class="profile" src="../images/account.png">'+username+'</a>';
}

const logout = document.getElementById('logout');
logout.addEventListener('click',function (){
    window.sessionStorage.clear();
    window.location.replace("../../Login-Seller/Login-Seller.html");
})