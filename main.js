let serverUrl = "https://d6vjfyheyj5e.usemoralis.com:2053/server";
let appId = "elbFBAEk3qCdzfTtR4uJiSvOCAjcfsyy1hQoKf47";
Moralis.start({ serverUrl, appId });

let currentTrade = {};
let currentSelectSide; 
let tokens = [];
let currentUser;
let initialToken;
let metamaskProvider;

async function init(){
    await Moralis.initPlugins();
    metamaskProvider = await detectEthereumProvider();
    console.log(metamaskProvider);
   // await Moralis.enable();
    await listAvailableTokens();
    getInitialToken();
    if(currentUser !=null){
        document.getElementById("swap_button").disabled = false
    }
 }

document.getElementById("from_amount").addEventListener("input", () => {
    let value = document.getElementById("from_amount").value;
    if(value.includes(",")) {
        value = value.replaceAll(",", ".");
        document.getElementById("from_amount").value = value;
    }
 });

 function getInitialToken() {
    let parent = document.getElementById("from_token_select");
    for ( const address in tokens ) {
        let token = tokens[address];
        if(token.symbol == "BNB") {
            initialToken = token;
            html = `
                <img class= "token_list_img" src="${token.logoURI}">
                <span class="token_list_text">${token.symbol}</span> 
                `;
            parent.innerHTML = "";
            parent.innerHTML = html;
            break;
        }
    }
    // let parent = document.getElementById("from_token_select");
    // parent.innerHTML = "";
    // div = `
    // <img class= "token_list_img" src="${initialToken.logoURI}">
    // <span class="token_image" id="from_token_text">${initialToken.symbol}</span>
    // `;
    // parent.innerHTML = div;
 }

async function listAvailableTokens(){
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({   
        chain: 'bsc',// The blockchain you want to use (eth/bsc/polygon)
    });
    tokens = result.tokens;
    let parent = document.getElementById("token_list"); 
    for ( const address in tokens ) {
        let token = tokens[address];
        let div = document.createElement("div");
        div.setAttribute("data-address", address);
        div.className = "token_row";
        let html = `
        <img class= "token_list_img" src="${token.logoURI}">
        <span class="token_list_text">${token.symbol}</span> 
        `
        div.innerHTML = html;
        div.onclick = (() => {selectToken(address)});
        parent.appendChild(div);
    }
}
 function selectToken(address){
    closeModal();
    //let address = event.target.getAttribute("data-address");
    //console.log(tokens);
    currentTrade[currentSelectSide] = tokens[address];
    console.log(currentTrade);
    renderInterface();
    getQuote();
 }

function renderInterface(){
    console.log(currentTrade);
    if(initialToken != null) {
        currentTrade.from = initialToken;
        initialToken = null;
    }
    let html;
    let parent;
    if (currentTrade.from != null) {
        html = `
        <img class= "token_list_img" src="${currentTrade.from.logoURI}">
        <span class="token_list_text">${currentTrade.from.symbol}</span> 
        `;
        parent = document.getElementById("from_token_select");
        parent.innerHTML = "";
        parent.innerHTML = html;
        // document.getElementById("from_token_img").src = currentTrade.from.logoURI;
        // document.getElementById("from_token_text").innerHTML= currentTrade.from.symbol;
    }
    if (currentTrade.to != null){
        html = `
        <img class= "token_list_img" src="${currentTrade.to.logoURI}">
        <span class="token_list_text">${currentTrade.to.symbol}</span> 
        `;
        parent = document.getElementById("to_token_select");
        parent.innerHTML = "";
        parent.innerHTML = html;
        // document.getElementById("to_token_img").src= currentTrade.to.logoURI;
        // document.getElementById("to_token_text").innerHTML= currentTrade.to.symbol;
    }
}
/** Add from here down */
// metamask login
 async function login() {
     try {
        //  currentUser = Moralis.authenticate();
         if(!currentUser){

            currentUser = await Moralis.Web3.authenticate({signingMessage:"Welcome to DEX!", chainId: 56});
            document.getElementById("btn-login").innerHTML =
                "Connected";
         }
         document.getElementById("swap_button").disabled = false
     } catch (error){
         console.log(error)
     }
//nezinu vai ir vajadzīgs
//    let user = Moralis.User.current();
//    if (!currentUser) {
//      try {
//          user = await Moralis.authenticate({ signingMessage: "Hello!" })
//          console.log(user)
//          console.log(user.get('bscAddress'))
//      } catch(error) {
//          console.log(error)
//      }
//    }
  }
//metamask login beigas
//metamask logout sakums
async function logOut() {
  await Moralis.User.logOut();
  console.log("logged out");
}
//metamask logout beigas lkm

function openModal(side){
    currentSelectSide = side;
    document.getElementById("token_modal").style.display = "block";
}
function closeModal(){
    document.getElementById("token_modal").style.display = "none";
}
// Modal search funkcija
function searchForToken() {
    var inputField = document.getElementById("token-search-input");
    inputField.addEventListener("keypress", function(event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          //document.getElementById("myBtn").click();
          let parent = document.getElementById("token_list");
          if(inputField.value != null && inputField.value != "") {
            let value = inputField.value.toLowerCase();
            let tempList = [];
            for (const address in tokens ) {
            let token = tokens[address];
            if(token.symbol.toLowerCase().includes(value)) {
                tempList.push({"address": address, "token": token});
            }
            }
            parent.innerHTML = "";
            for(let i in tempList) {
                let t = tempList[i];
                let div = document.createElement("div");
                div.setAttribute("data-address", t.address);
                div.className = "token_row";
                let html = `
                <img class= "token_list_img" src="${t.token.logoURI}">
                <span class="token_list_text">${t.token.symbol}</span> 
                `
                div.innerHTML = html;
                div.onclick = (() => {selectToken(t.address)});
                parent.appendChild(div);
            }
        } else {
            parent.innerHTML = "";
            for ( const address in tokens ) {
                let token = tokens[address];
                let div = document.createElement("div");
                div.setAttribute("data-address", address);
                div.className = "token_row";
                let html = `
                <img class= "token_list_img" src="${token.logoURI}">
                <span class="token_list_text">${token.symbol}</span> 
                `
                div.innerHTML = html;
                div.onclick = (() => {selectToken(address)});
                parent.appendChild(div);
            }
        }
    }
      });
    
}
//Modal search beigas
async function getQuote(){
    if(!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;

    let amount = Number(
        document.getElementById("from_amount").value * 10**currentTrade.from.decimals 
    );

    const quote = await Moralis.Plugins.oneInch.quote({
        chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address, // The token you want to swap
        toTokenAddress: currentTrade.to.address, // The token you want to receive
        amount: amount,
    });
    console.log(quote);
//    document.getElementById("gas_estimate").innerHTML =  quote.estimatedGas / (10**quote.toToken.decimals);
    document.getElementById("to_amount").value = quote.toTokenAmount / (10**quote.toToken.decimals);
}

async function trySwap() {
    let address = Moralis.user.current().get("bscAdress");
    let amount = Number(
        document.getElementById("from_amount").value * 10**currentTrade.from.decimals 
    );
    if (currentTrade.from.symbol === "BSC") {
        const allowance = await Moralis.Plugins.oneInch.hasAllowance({
            chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: currentTrade.from.address, // The token you want to swap
            fromAddress: address, // Your wallet address
            amount: amount,
        });
        console.log(allowance);
        if (allowance >= amount){
            await Moralis.Plugins.oneInch.approve({
            chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
            tokenAddress: currentTrade.from.address, // The token you want to swap
            fromAddress: address, // Your wallet address 
        });

        }
    }
    let receipt = await doSwap(address, amount);
    alert("Swap Complete");

}

async function doSwap(userAdress, amount) {
    return await  Moralis.Plugins.oneInch.swap({
      chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: currentTrade.from.address, // The token you want to swap
      toTokenAddress: currentTrade.to.address, // The token you want to receive
      amount: amount,
      fromAddress: userAdress, // Your wallet address
      slippage: 1,
    });
  }


init();

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == document.getElementById('token_modal')) {
        document.getElementById('token_modal').style.display = "none";
    }
}
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_token_select").onclick = (() => {
    openModal("from");
});
document.getElementById("to_token_select").onclick = (() => {
    openModal("to");
});
//document.getElementById("to_token_select").onclick = () => openModal("to");
// document.getElementById("login_button").onclick = login;
document.getElementById("from_amount").onblur = getQuote;
document.getElementById("swap_button").onclick = trySwap;

document.getElementById("token-search-input").onclick = searchForToken;




/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/