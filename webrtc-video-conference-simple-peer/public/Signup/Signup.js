const myForm = document.getElementById('myForm');
const myVerify = document.getElementById('myVerify');
const LoginContainer = document.getElementById('login-inputs');
const VerifyContainer = document.getElementById('Verify');

showLoginConference();
myForm.addEventListener('submit', function (e) {
  e.preventDefault();

  let S_First_Name = document.getElementById('S_First_Name').value;
  let S_Last_Name = document.getElementById('S_Last_Name').value;
  let S_Account = document.getElementById('S_Account').value;
  let S_Username = document.getElementById('S_Username').value;
  let S_Password = document.getElementById('S_Password').value;
  let S_RePassword = document.getElementById('S_RePassword').value;
  let D_Birthday = document.getElementById('D_Birthday').value;
  let S_Phone = document.getElementById('S_Phone').value;

  if(S_Password!=S_RePassword){
    swal("Password doesn't same!", "Password doesn't same ! Please fill your password again", "error", {timer: 3000,
      showConfirmButton: false});
  }
  else{
  fetch('https://140.118.121.100:5000/account/Sign_up',{
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      S_First_Name:S_First_Name,
      S_Last_Name:S_Last_Name,
      S_Account:S_Account,
      S_Username:S_Username,
      S_Password:S_Password,
      D_Birthday:D_Birthday,
      S_Phone:S_Phone
    })
  }).then(response => {
    return response.json()
  }) 
  .then( (data) =>{
    render(data)
  })
}
});

function render(data){
  let market = data.S_Signup_Status;
  let VScode = data.S_Verify_Code;
  let Account = data.S_Account;

    if(market == '0')
    {
      swal("Success", "Sign up successfully! Please verify your email.", "success", {timer: 2000
        ,showConfirmButton: false});
      showVerifyConference()

      myVerify.addEventListener('submit',function Verify(e){
        e.preventDefault();
      let S_Verifiy = document.getElementById('S_Verifiy').value;
      
      if(VScode == S_Verifiy)
      {  
      fetch('https://140.118.121.100:5000/account/Verify ',{
        method: 'PUT',
        headers: {
        'Accept': 'application/json, text/plain',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          S_Verifiy_Status : "1",
          S_Account : Account
        })
        }).then(res => {
          return res.json()
          }
          )
          .then( (user) =>{
            var x = user;
            setTimeout(function(){
              window.location.replace('../Livehome/Livehome.html');
             },3000);
             swal("Success", "Verify successfully!", "success", {timer: 2000,
              showConfirmButton: false});
            
          })
      }
      else{
        swal("Failed", "Verify Code is wrong", "error", {timer: 2000,
          showConfirmButton: false});
      }})
    }
    else if(market == '1'){
      console.log("Account and Username existed");
      swal("Warning", "Username has been usedEmail and username have been used", "error", {timer: 2000,
        showConfirmButton: false});
    }
    else if(market == '2'){
      console.log("Account existed");
      swal("Warning", "Email has been used", "error", {timer: 2000,
        showConfirmButton: false});
    }
    else if(market == '3'){
      console.log("Username existed ");
      swal("Warning", "Username has been used", "error", {timer: 2000,
        showConfirmButton: false});
    }

}
function showLoginConference() {
  LoginContainer.style = 'display: block'
  VerifyContainer.style = 'display: none'
}
function showVerifyConference() {
  LoginContainer.style = 'display: none'
  VerifyContainer.style = 'display: block'
}



