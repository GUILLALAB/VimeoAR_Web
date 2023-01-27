let sidebar = document.querySelector(".sidebar");
  let closeBtn = document.querySelector("#btn");
  let searchBtn = document.querySelector(".bx-search");
  document.getElementById("navbutton").style.display="none";
    
    document.querySelector('.sidebar').style.backgroundColor = "#15141600";

    
  closeBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
  });

  searchBtn.addEventListener("click", ()=>{ // Sidebar open when you click on the search iocn
   // sidebar.classList.toggle("open");
 //   menuBtnChange(); //calling the function(optional)
 var values = document.getElementById("myInput").value;
 queryDynamoDB(5,"video",values);
  });

  // following are the code to change sidebar button(optional)
  function menuBtnChange() {
   if(sidebar.classList.contains("open")){
     closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the iocns class
     document.getElementById("navbutton").style.display="block";
     document.querySelector('.sidebar').style.backgroundColor = "#130d19ef";

   }else {
     closeBtn.classList.replace("bx-menu-alt-right","bx-menu");//replacing the iocns class
     document.getElementById("navbutton").style.display="none";
    
document.querySelector('.sidebar').style.backgroundColor = "#15141600";
   }
  }