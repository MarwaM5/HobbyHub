(function(){
  if(!isLoggedIn()){window.location.href=buildUrl("login");return;}
  mountSharedUi({userApp:true,active:"profile",title:"My Profile",subtitle:"Your space, your story."});
  const user=typeof currentUser!=="undefined"?currentUser:{name:"Marwa"};
  const initialName=user.name||"Marwa", initialEmail="marwa@example.com";
  const name=document.getElementById("profileName"),email=document.getElementById("profileEmail");
  const fullName=document.getElementById("profileFullName"),emailDetail=document.getElementById("profileEmailDetail");
  const avatar=document.getElementById("profileAvatar"),avatarInitial=document.getElementById("profileAvatarInitial");
  const avatarImage=document.getElementById("profileAvatarImage");
  const form=document.getElementById("profileEditForm"),editButton=document.getElementById("btnEditProfile");
  const nameInput=document.getElementById("editProfileName"),emailInput=document.getElementById("editProfileEmail");
  const photoInput=document.getElementById("editProfilePhoto");
  let savedPhotoData="", pendingPhotoData="";
  function renderAvatar(n,photoData){
    avatarInitial.textContent=(n.trim()[0]||"M").toUpperCase();
    if(photoData){
      avatarImage.src=photoData;avatarImage.hidden=false;avatarInitial.hidden=true;
    }else{
      avatarImage.removeAttribute("src");avatarImage.hidden=true;avatarInitial.hidden=false;
    }
  }
  function updateProfile(n,e,photoData=savedPhotoData){
    name.textContent=n;email.textContent=e;fullName.textContent=n;emailDetail.textContent=e;
    renderAvatar(n,photoData);
  }
  updateProfile(initialName,initialEmail);
  editButton.addEventListener("click",()=>{
    nameInput.value=name.textContent;emailInput.value=email.textContent;
    pendingPhotoData=savedPhotoData;photoInput.value="";
    form.hidden=!form.hidden;editButton.hidden=!form.hidden;
    if(!form.hidden)nameInput.focus();
  });
  photoInput.addEventListener("change",()=>{
    const file=photoInput.files&&photoInput.files[0];
    if(!file){pendingPhotoData=savedPhotoData;renderAvatar(name.textContent,pendingPhotoData);return;}
    if(!file.type.startsWith("image/")){photoInput.value="";showProfileToast("Please choose an image file.");return;}
    const reader=new FileReader();
    reader.onload=()=>{pendingPhotoData=String(reader.result||"");renderAvatar(name.textContent,pendingPhotoData);};
    reader.onerror=()=>showProfileToast("This image could not be previewed. Try another file.");
    reader.readAsDataURL(file);
  });
  document.getElementById("btnCancelEdit").addEventListener("click",()=>{
    pendingPhotoData=savedPhotoData;renderAvatar(name.textContent,savedPhotoData);
    form.reset();form.hidden=true;editButton.hidden=false;
  });
  form.addEventListener("submit",e=>{
    e.preventDefault();if(!form.reportValidity())return;
    savedPhotoData=pendingPhotoData;
    updateProfile(nameInput.value.trim(),emailInput.value.trim(),savedPhotoData);
    form.hidden=true;editButton.hidden=false;form.reset();
    showProfileToast("Profile updated for this demo session.");
  });
  const enrollmentCards=[...document.querySelectorAll(".pfEnrollmentCard")];
  document.getElementById("profileEnrollmentCount").textContent=enrollmentCards.length;
  document.getElementById("enrollmentCountBadge").textContent=enrollmentCards.length;
  if(!enrollmentCards.length)document.getElementById("profileEnrollmentEmpty").hidden=false;
  function showProfileToast(message){
    let toast=document.getElementById("profileToast");
    if(!toast){toast=document.createElement("div");toast.id="profileToast";toast.className="pfToast";toast.setAttribute("role","status");document.body.appendChild(toast);}
    toast.textContent=message;toast.classList.add("isShown");window.setTimeout(()=>toast.classList.remove("isShown"),2600);
  }
  initReveal();
})();
