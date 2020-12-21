const LoginContainer = document.getElementById('login-inputs');
const VerifyContainer = document.getElementById('Verify');
const ProfileContainer = document.getElementById('profilePhoto');

const myVerify = document.getElementById('myVerify');
const myFormList = document.getElementById('myForm');


let Aftername;

showLoginConference()
let S_Account = window.sessionStorage.getItem("Account");

let param = "https://140.118.121.100:5000/account/edit?S_Account="+S_Account
fetch(param,{
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain',
      'Content-Type': 'application/json'
    }
  }).then(response => {
    return response.json()
  }) 
  .then( (data) =>{
    render(data)
  })

function render(data){
    let First_Name = data.S_First_Name;
    let Last_Name = data.S_Last_Name;
    let Account = data.S_Account;
    let Username = data.S_Username;
    let Password = data.S_Password;
    let Birthday = data.D_Birthday;
    let Phone = data.S_Phone;
    let Picture = data.S_Picture

    document.getElementById('First_Name').innerHTML = First_Name;
    document.getElementById('Last_Name').innerHTML = Last_Name;
    document.getElementById('Account').innerHTML = Account;
    document.getElementById('Username').innerHTML = Username;
    document.getElementById('pro_username').innerHTML = Username;
    document.getElementById('Password').innerHTML = Password;
    document.getElementById('Birthday').innerHTML = Birthday;
    document.getElementById('Phone').innerHTML = Phone;
    document.getElementById('profilePhoto').innerHTML = '<img src="data:image/png;base64,'+ Picture +'" id="photo" alt="Red dot" /><div name= "S_Picture" id="file" class="S_Picture"></div>'
    // var ImageURL = "data:image/jpg,base64,"+ Picture
    // // var block = ImageURL.split(";")
    // var contentType = "image/jpg";
    // var realData =  Picture;
    // var blob = b64toBlob(realData);
    var blob = atob(Picture);
    window.sessionStorage.setItem("blob",blob);

}

myVerify.addEventListener('submit',function (e){
    e.preventDefault();
    showVerifyConference();
})

myFormList.addEventListener('submit', function (e) {
    e.preventDefault();


    let S_Username = document.getElementById('S_Username').value;
    let S_Password = document.getElementById('S_Password').value;
    let S_RePassword = document.getElementById('S_RePassword').value;
    let Saccount = window.sessionStorage.getItem("Account");

    Aftername=S_Username;
  
    if(S_Password!=S_RePassword){
      swal("Password doesn't same!", "Password doesn't same ! Please fill your password again", "error", {timer: 3000,
        showConfirmButton: false});
    }
    else{
      var formdata = new FormData(document.getElementById('myForm'));
      formdata.append("S_Account",Saccount)
      formdata.append("S_Picture",window.sessionStorage.getItem("blob"))
      fetch("https://140.118.121.100:5000/account/edit",{
            method: 'PUT',
            body: formdata
          })
          .then(response => {return response.json()}) 
          .then( (data) =>{fresh(data)})
          .catch(error => console.log('error', error));

    //   fetch('https://140.118.121.100:5000/account/edit ',{
    //     method: 'PUT',
    //     headers: {
    //       'Accept': 'application/json, text/plain',
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       S_First_Name:S_First_Name,
    //       S_Last_Name:S_Last_Name,
    //       S_Account:Saccount,
    //       S_Username:S_Username,
    //       S_Password:S_Password,
    //       D_Birthday:D_Birthday,
    //       S_Phone:S_Phone
    //     })
    //   }).then(response => {
    //     return response.json()
    //   }) 
    //   .then( (data) =>{
    //     fresh(data)
    //   })
    }
});

function fresh(data){
    let market = data.Edit_Status;
  
      if(market == '0')
      {
        swal("Success", "Update successfully!", "success", {timer: 2000
          ,showConfirmButton: false});
        window.sessionStorage.setItem("Username",Aftername);
        setTimeout(function(){
          window.location.replace("../proedit/proedit.html");
        },2000)
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
    LoginContainer.style = 'display: none'
    VerifyContainer.style = 'display: block'
}
function showVerifyConference() {
    LoginContainer.style = 'display: block'
    VerifyContainer.style = 'display: none'
    ProfileContainer.style = 'display: none'
    document.getElementById('S_Account').innerHTML = window.sessionStorage.getItem("Account");
    editx2();
}

function editx2(){
    let S_Account = window.sessionStorage.getItem("Account");
    let param = "https://140.118.121.100:5000/account/edit?S_Account="+S_Account
    fetch(param,{
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain',
          'Content-Type': 'application/json'
        }
      }).then(response => {
        return response.json()
      }) 
      .then( (data) =>{
        refresh(data)
      })
}



function refresh(data){
    let First_Name = data.S_First_Name;
    let Last_Name = data.S_Last_Name;
    let Username = data.S_Username;
    let Password = data.S_Password;
    let Birthday = data.D_Birthday;
    let Phone = data.S_Phone;
    let Picture = data.S_Picture;

    document.getElementById('E_First_Name').innerHTML = 'First_Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="S_First_Name" name="S_First_Name" placeholder="First Name" type="text" value="'+First_Name+'" required />';
    document.getElementById('E_Last_Name').innerHTML = 'Last_Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="S_Last_Name" name="S_Last_Name" placeholder="Last Name" type="text" value="'+Last_Name+'" required/>';
    document.getElementById('E_Username').innerHTML = 'Username&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="S_Username" name="S_Username" placeholder="username" type="text" value="'+Username+'" required />';
    // document.getElementById('E_Password').innerHTML = 'Password&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="S_Password" name="S_Password" placeholder="password" type="password" value="'+Password+'" required />';
    // document.getElementById('E_RePassword').innerHTML = 'Confirm Password<input id="S_RePassword" name="S_RePassword" placeholder="password Confirm" type="password" value="'+Password+'" required />';
    document.getElementById('E_Birthday').innerHTML = 'Birthday&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="D_Birthday" name="D_Birthday" placeholder="Birthday" type="date" value="'+Birthday+'" required />';
    document.getElementById('E_Phone').innerHTML = 'Phone Number&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="S_Phone" name="S_Phone" placeholder="0912345678" type="text" value="'+Phone+'" required />';
    document.getElementById('profilePhoto2').innerHTML = '<img src="data:image/png;base64,'+ Picture +'" id="photo2"><input type="file" name= "S_Picture" id="file2" class="S_Picture2" accept="image/jpeg"><label for="file2" id="uploadBtn2">Choose Photo</label>'


    const imgDiv = document.querySelector('.profile-pic-div2');
    const img = document.querySelector('#photo2');
    const file = document.querySelector('#file2');
    const uploadBtn = document.querySelector('#uploadBtn2');

    imgDiv.addEventListener('mouseenter', function(){
      uploadBtn.style.display = "block";
      });
  
      imgDiv.addEventListener('mouseleave', function(){
          uploadBtn.style.display = "none";
      });
  
      file.addEventListener('change', function(){
          const choosedFile = this.files[0];
  
          if (choosedFile) {
  
              const reader = new FileReader(); 
  
              reader.addEventListener('load', function(){
                  img.setAttribute('src', reader.result);
              });
  
              reader.readAsDataURL(choosedFile);
          }
      });

  }

