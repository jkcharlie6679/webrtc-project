const inputs = document.querySelectorAll(".input");


function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}

function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}


inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});

/*************************************************** */


let user = "local";
let password = "123123"
// let param = test + user + password;
// console.log(param);

const myForm = document.getElementById('myForm');
myForm.addEventListener('submit', function (e) {
  e.preventDefault();
  
  let S_Account = document.getElementById('S_Account').value;
  let S_Password = document.getElementById('S_Password').value;
  let test = "https://140.118.121.100:5000/account/Login?S_Account="+S_Account+"&S_Password="+S_Password;
  // console.log(test)
  fetch(test,{
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain',
      'Content-Type': 'application/json'
    }
    // body: JSON.stringify({
    //   test
    // })
  }).then(response => {
    return response.json()
  }) 
  .then( (data) =>{
	render(data)

  })
});

function render(data){
  let market = data.S_Login_Status;

  if(market == '0')
  {
    swal("Success", "Login Successfully！", "success", {timer: 1000
      ,showConfirmButton: false});
    window.sessionStorage.setItem("Username", data.S_Username);
    window.sessionStorage.setItem("Account", data.S_Account);
    setTimeout(function(){
      window.location.replace('../index.html');
    },1000);
  }
  else if(market == '1'){
    console.log("Please Verify your email account");
    swal("Please Verify", "Please verify your account first!", "warning", {timer: 3000,
      showConfirmButton: false});
  }
  else if(market == '2'){
    console.log("Incorrect Password");
    swal("Fail", "Incorrect Password!", "error", {timer: 3000,
      showConfirmButton: false});
  }
  else if(market == '3'){
    console.log("Account does not exist");
    swal("Fail", "Account does not exist!", "error", {timer: 3000,
      showConfirmButton: false});
  }
}