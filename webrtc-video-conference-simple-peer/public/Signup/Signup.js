var myForm = document.forms.namedItem("myForm");
// var myForm = new FormData(document.getElementById('myForm'));
const myFormlist = document.getElementById('myForm');

const myVerify = document.getElementById('myVerify');
const LoginContainer = document.getElementById('login-inputs');
const VerifyContainer = document.getElementById('Verify');

showLoginConference();


myFormlist.addEventListener('submit', function (e) {
  e.preventDefault();
  let S_Password = document.getElementById('S_Password').value;
  let S_RePassword = document.getElementById('S_RePassword').value;
  swal("Loading Now","", "info", {timer: 2000,
    showConfirmButton: false});

  if(S_Password != S_RePassword)
  {
    swal("Password doesn't same!", "Password doesn't same ! Please fill your password again", "error", {timer: 3000,
    showConfirmButton: false});
  }
  else{
    var formdata = new FormData(document.getElementById('myForm'));
    fetch("https://140.118.121.100:5000/account/Sign_up",{
          method: 'POST',
          body: formdata
        })
        .then(response => {return response.json()}) 
        .then( (data) =>{render(data)})
        .catch(error => console.log('error', error));
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
        var Verifydata = new FormData(document.getElementById('myVerify'));
        Verifydata.append("S_Verifiy_Status","1")
        Verifydata.append("S_Account",Account)

        fetch("https://140.118.121.100:5000/account/Verify",{
              method: 'PUT',
              body: Verifydata
            })
            .then( (user) =>{
              var x = user;
              setTimeout(function(){
                window.location.replace('../Livehome/Livehome.html');
               },2000);
               swal("Success", "Verify successfully!", "success", {timer: 2000,
                showConfirmButton: false});
              
            })
      // fetch('https://140.118.121.100:5000/account/Verify ',{
      //   method: 'PUT',
      //   headers: {
      //   'Accept': 'application/json, text/plain',
      //   'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     S_Verifiy_Status : "1",
      //     S_Account : Account
      //   })
      //   }).then(res => {
      //     return res.json()
      //     }
      //     )
      //     .then( (user) =>{
      //       var x = user;
      //       setTimeout(function(){
      //         window.location.replace('../Livehome/Livehome.html');
      //        },3000);
      //        swal("Success", "Verify successfully!", "success", {timer: 2000,
      //         showConfirmButton: false});
            
      //     })
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






//declearing html elements

const imgDiv = document.querySelector('.profile-pic-div');
const img = document.querySelector('#photo');
const file = document.querySelector('#file');
const uploadBtn = document.querySelector('#uploadBtn');

//if user hover on img div 

imgDiv.addEventListener('mouseenter', function(){
    uploadBtn.style.display = "block";
});

//if we hover out from img div

imgDiv.addEventListener('mouseleave', function(){
    uploadBtn.style.display = "none";
});

//lets work for image showing functionality when we choose an image to upload

//when we choose a foto to upload

file.addEventListener('change', function(){
    //this refers to file
    const choosedFile = this.files[0];

    if (choosedFile) {

        const reader = new FileReader(); //FileReader is a predefined function of JS

        reader.addEventListener('load', function(){
            img.setAttribute('src', reader.result);
        });

        reader.readAsDataURL(choosedFile);

        //Allright is done

        //please like the video
        //comment if have any issue related to vide & also rate my work in comment section

        //And aslo please subscribe for more tutorial like this

        //thanks for watching
    }
});