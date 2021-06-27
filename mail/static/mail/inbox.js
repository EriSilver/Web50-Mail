document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //document.querySelectorAll("nav").forEach(nav => {nav.addEventListener("click", () => {console.log(nav.dataset.id);});});

  // work on console but not in the file
  //document.querySelectorAll("nav").forEach(nav => {nav.onclick = () => {console.log(nav.dataset.id);}});
  //document.querySelectorAll("nav").forEach(nav => {nav.onclick = () => {getemail(parseInt(nav.dataset.id));}});

  document.querySelector("#compose-form").onsubmit = sendEmail;

  // By default, load the inbox
  //load_mailbox('inbox');
});

function getemail(theid, zz){
  alert();
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#anemail").style.display = "block";
  document.querySelector("#anemail").innerHTML = "";

  arcread(theid, true);
  
  fetch(`/emails/${theid}`)
  .then(response => response.json() )
  .then(result => {
    result["read"] = true;
    console.log(result);
    cremail(result);
    if (! zz){
      history.pushState({"emails": "email"}, "", `email${theid}`);
    }
  });
}

function sendEmail() {
  // check for errors and empty fields
  if (!document.querySelector("#compose-recipients").value){
    alert("At Least one recipient is required.");
    return false;
  }
  
  fetch("/emails", {
    method : "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    if (result["message"] === "Email sent successfully.")
    {  load_mailbox("inbox");}
    else { compose_email(); }
    alert(result["message"]);
  })
  // Don't leave the page
  return false;
}

function alert(msg) {
  let div = document.querySelector("#alert");
  if (msg) {
    div.style.display = "block";
    div.innerHTML = msg + "<br>" + div.innerHTML;
  }
  else {
    div.style.display = "none";
    div.innerHTML = "";
  }
}

function compose_email(x,zz, rec) {
  alert();

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#anemail").style.display = "none";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if (! zz){
    console.log("here");
    history.pushState({mailbox: "compose"}, "", "compose");
  }

  if (rec){
    rec = rec.split(",");
    console.log(rec);
    console.log(typeof(rec));
    document.querySelector("#compose-recipients").value = rec[0];
    document.querySelector("#compose-subject").value
    if (rec[1].slice(0,4) === "Re: " ){
      document.querySelector("#compose-subject").value = rec[1];
    }
    else{
      document.querySelector("#compose-subject").value = "Re: " + rec[1];
    }
    document.querySelector("#compose-body").value = "On " + rec[3] + "," + rec[4] + " " + rec[0] + " wrote: " + rec[2];

  }
}

function load_mailbox(mailbox, nohist) {
  alert();
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#anemail").style.display = "none";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // add {mailbox} to url
  if (! nohist){
    history.pushState({mailbox: mailbox}, "", mailbox);
  }
  show(mailbox);
  //document.querySelectorAll("nav").forEach(nav => {nav.onclick = () => {getemail(parseInt(nav.dataset.id));}});

  
}

window.onpopstate = event => {  
  if (event.state.mailbox === "compose"){
    console.log(event.state.mailbox);
    compose_email(true, true);
  }
  else if (event.state.mailbox == "inbox" || event.state.mailbox == "sent" || event.state.mailbox == "archive"){
    console.log(event.state.mailbox);
    load_mailbox(event.state.mailbox, true);
  }
  else if (event.state.emails == "email"){
    console.log(event.state);
    getemail(parseInt(document.URL.slice(document.URL.lastIndexOf("/") + 6)), true);
  }
}

function show(mailbox){
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);

    for (let xx in data){
      x = data[xx];
      //console.log(x);
      crdiv(x);
    }
  });
}

function arcread(id, read, arc){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: arc,
      read: read
    })
  });
}

function crdiv(x){
  const div = document.createElement("div");
  div.style.border = "2px solid black";
  div.style.padding = "7px";
  const nav = document.createElement("nav");
  nav.dataset.id = x["id"];
  nav.setAttribute("onclick", "getemail(parseInt(this.dataset.id))");
  //console.log(nav.dataset.id);
  if (x["read"]){
    div.style.backgroundColor = "#f2f2f2";
  }

  var span = document.createElement("span");
  span.innerHTML = x["sender"];
  span.style.fontWeight = "bold";
  span.style.width = "25%";
  nav.appendChild(span);

  span = document.createElement("span");
  span.innerHTML = x["subject"];
  span.style.width = "50%";
  nav.appendChild(span);

  span = document.createElement("span");
  span.innerHTML = x["timestamp"];
  span.style.color = "#aaaaaa";
  nav.appendChild(span);

  div.appendChild(nav);
  document.querySelector("#emails-view").appendChild(div);
}

function cremail(x){
  var div = document.createElement("div");
  var p = document.createElement("p");
  var span, b, text, br;
  var xx = [["From: ","sender"],["To: ", "recipients"],["Subject: ", "subject"],["Timestamp: ", "timestamp"]];
  for(let a in xx){
    span = document.createElement("span");
    
    b = document.createElement("b");
    b.innerHTML = xx[a][0];
    span.appendChild(b);

    if(a == 1){
      let n = x.recipients.length;
      recstr = "";
      for (let e in x.recipients){
        if (e == n - 1){
          recstr += x.recipients[e];
        }
        else{
          recstr = recstr + x.recipients[e] + ", ";
        }
      }
      xx[a][1] = recstr;
      text = document.createTextNode(recstr);
    }
    else {
      text = document.createTextNode(x[xx[a][1]]);
    }
    span.appendChild(text);
    p.appendChild(span);
    br = document.createElement("br");
    p.appendChild(br);
  }

  br = document.createElement("br");
  p.appendChild(br);

  if (document.querySelector("h2").innerHTML != x.sender){
    var button = document.createElement("button");
    button.innerHTML = "Reply";
    button.className = "btn btn-sm btn-outline-primary";
    let rec = [x.sender, x.subject, x.body, x.timestamp];
    button.setAttribute("onclick", `compose_email(${true}, ${false}, '${rec}')`);
    p.appendChild(button);

    button = document.createElement("button");
    button.id = "archive";
    button.className = "btn btn-sm btn-outline-primary";
    if(x["archived"]){
      button.innerHTML = "Unarchive";
    }
    else{
      button.innerHTML = "Archive";
    }

    button.setAttribute("onclick", "changebtn(this)");
    
    p.appendChild(button);

    button= document.createElement("button");
    button.id = "read";
    button.className = "btn btn-sm btn-outline-primary";
    if(x["read"]){
      button.innerHTML = "Mark As Unread";
    }
    else{
      button.innerHTML = "Mark As Read";
    }
    button.setAttribute("onclick", "changebtn(this)");
    p.appendChild(button);
  }

  p.appendChild(br);

  div.appendChild(p);
  div.style.borderBottom = "1px solid rgba(0,0,0,.1)";

  document.querySelector("#anemail").appendChild(div);

  var ddiv = document.createElement("div");
  console.log(x["body"]);
  if (x["body"]){
    ddiv.innerHTML = x["body"];
  }
  else {
    ddiv.innerHTML = "No Email Content.";
    ddiv.style.color = "#d0d0d0";
    ddiv.style.userSelect = "none";
  }
  ddiv.style.padding = "30px";
  document.querySelector("#anemail").appendChild(ddiv);

}

function changebtn(btn){
  let arr = {
    "read" : ["Mark As Read", "Mark As Unread"],
    "archive" : ["Archive", "Unarchive"]
  }
  console.log(btn);
  let l = arr[btn.id];
  let arc = true, read = true;
  if (btn.id === "read"){
    arc = undefined;
    msg = "saved as " + btn.innerHTML.slice(btn.innerHTML.lastIndexOf(" ") + 1);
  }
  else{
    read = undefined;
    msg = btn.innerHTML + "d";
  }
  alert(`Email has been ${msg}.`);
  if (btn.innerHTML === l[0]){
    btn.innerHTML = l[1]; 
    arcread(parseInt(document.URL.slice(document.URL.lastIndexOf("/") + 6)), read, arc);
  }
  else{
    btn.innerHTML = l[0];
    if (arc == undefined){
      read = false;
    }
    else {
      arc = false;
    }
    arcread(parseInt(document.URL.slice(document.URL.lastIndexOf("/") + 6)), read, arc);
  }

  
}