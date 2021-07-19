const coinsTXT = '{"AAVE":"AAVE","ADA":"Cardano","AE":"Aeternity","ALGO":"Algorand","AMPL":"Ampleforth","ARK":"Ark","ATOM":"COSMOS","BAT":"Basic Attention Token","BAL":"Balancer","BCD":"Bitcoin Diamond","BCH":"Bitcoin Cash","BNB":"Binance Coin","BNTY":"Bounty0x","BSV":"Bitcoin SV","BTC":"Bitcoin","BTG":"Bitgem","BTT":"BitTorrent","BURST":"Burst","Comp":"Compound","CRO":"Crypto.com Coin","DAI":"DAI","DASH":"Dash","DCR":"Decred","DGB":"DigiByte","DOGE":"Dogecoin","EOS":"Eos","ETC":"Ethereum Classic","ETH":"Ethereum","ENJ":"Enjin","EQL":"Equal","FTM":"Fantom","FUSE":"Fuse","GAS":"Gas","GRS":"Groestlcoin","ONE":"Harmony","HT":"Huobi Token","ICX":"Icon","IOTA":"Iota","KIN":"Kin","KMD":"Komodo","LEND":"Lend","LINK":"Chainlink","LSK":"Lisk","LTC":"Litecoin","MTA":"META","NANO":"Nano","NEBL":"Neblio","NEO":"Neo","ONG":"Ontology Gas","ONT":"Ontology","QTUM":"Qtum","RVN":"Ravencoin","REP":"Augur","RSK":"Rootstock","SIERRA":"Sierracoin","SMART":"SmartCash","STRAX":"Stratis","SWTH":"Switcheo","TLOS":"Telos","TPAY":"TokenPay","TRX":"TRON","TWT":"Trust Wallet Token","UBQ":"Ubiq","USDC":"USD Coin","USDT":"Tether USD","VET":"VeChain","VSTS":"V.Systems","VTHO":"VeThor Token","WAN":"Wanchain","WAVES":"Waves","XDC":"XDC Network","XEM":"NEM","XLM":"Stellar","XMR":"Monero","XPM":"Primecoin","XRP":"Ripple","XTZ":"Tezos","XVG":"Verge","XZC":"Zcoin","YFI":"Yearn.Finance","ZEC":"Zcash","ZIL":"Zilliqa","ZRX":"0x"}';

const coins = JSON.parse(coinsTXT);

var addressesDiv = document.createElement('div');
var nftsDiv = document.createElement('div');
var ethAddress = "";
var showOwnerSectionInfo = false;
var modal;
var span;
var nftResult;
var enableNFTModal = true;


//retreive domain name from query
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

//return box with address
function getAddress(ticker, address) {
    var tickerUppercase = ticker.toUpperCase();
    
    if(imageExists('images/' + ticker + '.png')) {
        var returnValue = '<div class="tickerInfo"><img class="logo" src="./images/' + ticker + '.png"><p>' + coins[tickerUppercase] +'</p></div><table class="addressTable"><tr><td><input id="' + ticker + '" type="text" class="address" value="' + address + '" disabled></td><td class="copyCell"><div class="tooltip"><img onClick="copyAddress(\'' + ticker + '\');" class="copy"><span id="' + ticker + 'ToolTip" class="tooltiptext">Copied</span></div></td></tr></table>';
    } else {
        var returnValue = '<div class="tickerInfo"><img class="logo missing"><p>' + coins[tickerUppercase] +'</p></div><table class="addressTable"><tr><td><input id="' + ticker + '" type="text" class="address" value="' + address + '" disabled></td><td class="copyCell><div class="tooltip"><img onClick="copyAddress(\'' + ticker + '\');" class="copy"><span id="' + ticker + 'ToolTip" class="tooltiptext">Copied</span></div></td></tr></table>';
    }
    
    return returnValue;
}

//return box with nft
function getNFT(asset, index) {
    var creatorName;
    var creatorExists = true;
    var image;
    
    try {
        if(asset.creator.user.username == "" || asset.creator.user.username == null) {
            creatorName = (asset.creator.address).substring(0, 12) + "...";
        } else {
            if((asset.creator.user.username).length > 15) {
                creatorName = (asset.creator.user.username).substring(0, 12) + "...";
            } else {
                creatorName = asset.creator.user.username;
            }
        }
    } catch (err) {
        try {
            creatorName = (asset.creator.address).substring(0, 12) + "...";
        } catch (err) {
            creatorExists = false;
        }
    }
    
    try {
        if(asset.image_original_url != null && asset.image_original_url != "") {
            image = asset.image_original_url;
        } else {
            image = asset.image_preview_url;
        }
    } catch (err) {
        image = asset.image_url;
    }
    
    var nftBox = "";
    if(creatorExists) {
        nftBox = "<div class='nftSection'><img class='nft' src='" + image + "'></div><div class='nftInfo'><div class='nftDescription'><a><h3>" + asset.name +"</h3></a><p>" + asset.description + "</p></div><div class='creatorInfo'><p>Created By</p><a class='creatorLink'><img class='creatorImg' src='" + asset.creator.profile_img_url + "'>" + creatorName + "</a></div></div>";
    } else {
        nftBox = "<div class='nftSection'><img class='nft' src='" + asset.image_thumbnail_url + "'></div><div class='nftInfo'><div class='nftDescription'><a><h3>" + asset.name +"</h3></a><p>" + asset.description + "</p></div><div class='creatorInfo'><p>Created By</p><a class='creatorLink'>unknown</a></div></div>";
    }
    const nft = document.createElement('div');
    nft.className = 'nftBox';
    nft.innerHTML = nftBox;
    nft.onclick = function() {showModal(index);}
    return nft;
}

//load results
function loadResults() {
    if(getParameterByName("domain") == null || getParameterByName("domain") == "") {
        window.location.replace("./index.html");
    }
    var domain = getParameterByName("domain").toLowerCase();
    if(domain.endsWith(".crypto") || domain.endsWith(".eth") || domain.endsWith(".zil")) {
        resolve();
    } else {
        alert("Unsupported domain.");
        window.location.replace("./index.html");
    }
}

//copy text
function copyAddress(id) {
    var address = document.getElementById(id).select();
    document.execCommand('copy');
    
    var tooltip = document.getElementById(id + "ToolTip");
    tooltip.style.visibility = "visible";
    
    sleep(2000).then(() => { tooltip.style.visibility = "hidden"; });
}

function resolve() {
    const apiURL = "https://unstoppabledomains.com/api/v1/";
    var domain = getParameterByName("domain").toLowerCase();
    
    var requestURL = apiURL + domain;
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            console.log(result);
            processResult(result);
        }
    };
    request.open("GET", requestURL, true);
    request.send();
}

function cleanDOM(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function processResult(result) {
    if(result.meta.owner == null) {
        alert("Unregistered Domain.");
        window.location.replace("./index.html");
    }
    
    var numAdresses = Object.keys(result.addresses).length;
    
    const mainContainer = document.getElementById('records');
    cleanDOM(mainContainer);
    const ownerSection = document.createElement('div');
    ownerSection.className = "ownerSection";
    const domainDiv = document.createElement('div');
    domainDiv.className = 'domainDiv';
    const domain = document.createElement('input');
    const links = document.createElement('div');
    const ipfsLink = document.createElement('a');
    const openseaLink = document.createElement('a');
    const emailLink = document.createElement('a');
    const redirect = document.createElement('a');
    const ownerSectionToggle = document.createElement('img');
    ownerSectionToggle.onclick = function () {toggleOwnerSectionInfo();};
    ownerSectionToggle.className = 'ownerSectionToggle';
    ownerSectionToggle.id = 'ownerSectionToggle';
    domain.className = "domain";
    domain.disabled = true;
    domain.value = result.meta.domain;
    ipfsLink.innerHTML = "<a href='https://ipfs.io/ipfs/" + result.ipfs.html + "' target='_blank'><img class='ipfs'></a>";
    openseaLink.innerHTML = "<a href='https://opensea.io/" + result.meta.owner + "' target='_blank'><img class='opensea'></a>";
    emailLink.innerHTML = "<a href='mailto:" + result.whois.email + "'><img class='email'></a>";
    
    try {
    if((result.ipfs.redirect_domain).startsWith("https")) {
        redirect.innerHTML = "<a href='" + result.ipfs.redirect_domain + "' target='_blank'><img class='redirect'></a>";
    } else if((result.ipfs.redirect_domain).startsWith("http")) {
        redirect.innerHTML = "<a href='https" + (result.ipfs.redirect_domain).substr(4) + "' target='_blank'><img class='redirect'></a>";
    } else {
        redirect.innerHTML = "<a href='https://" + result.ipfs.redirect_domain + "' target='_blank'><img class='redirect'></a>";
    }
    } catch (err) {
        console.log(err);
        redirect.innerHTML = "<a href='" + result.ipfs.redirect_domain + "' target='_blank'><img class='redirect'></a>";
    }
    
    
    const ownerRecord = document.createElement('p');
    const ownerSectionInfo = document.createElement('div');
    
    ownerSectionInfo.id = 'ownerSectionInfo';
    ownerRecord.innerHTML = `Domain Owner:<br>` + result.meta.owner;
    const separator = document.createElement('hr');
    const menu = document.createElement('div');
    menu.className = 'menu';
    const wallets = document.createElement('button');
    wallets.className = 'menuItem active';
    wallets.id = 'walletsButton';
    wallets.innerHTML = "Wallets";
    const nfts = document.createElement('button');
    nfts.className = 'menuItem';
    nfts.id = 'nftsButton';
    nfts.innerHTML = "NFTs"
    nfts.onclick = function() {showNFTs()};
    menu.appendChild(wallets);
    menu.appendChild(nfts);
    const content = document.createElement('div');
    content.id = "content"
    ownerSectionInfo.appendChild(ownerRecord);
    ownerSection.appendChild(ownerSectionInfo);
    ownerSection.appendChild(links);
    domainDiv.appendChild(domain);
    domainDiv.appendChild(ownerSectionToggle);
    mainContainer.appendChild(domainDiv);
    mainContainer.appendChild(ownerSection);
    mainContainer.appendChild(separator);
    
    if(numAdresses > 0) {
        addressesDiv.className = "gallery";
    
        var keys = Object.keys(result.addresses);
        for(var i =  0; i < numAdresses; i++) {
            if(result.addresses[keys[i]] != "") {
                var recordDiv = document.createElement('div');
                recordDiv.className = "addressBox";
                recordDiv.innerHTML = getAddress(keys[i].toLowerCase(), result.addresses[keys[i]]);
                addressesDiv.appendChild(recordDiv);
            }
        }
    } else {
        const error = document.createElement('p');
        error.innerHTML = "No addresses found.";
        addressesDiv.appendChild(error);
    }
    
    if(result.ipfs.html != null && result.ipfs.html != "") {
        links.appendChild(ipfsLink);
    }
    if(result.ipfs.redirect_domain != null) {
        links.appendChild(redirect);
    }
    if(result.whois.email != null && result.whois.email != "") {
        links.appendChild(emailLink);
    }
    if(result.meta.type == "ENS" || result.meta.type == "CNS") {
        links.appendChild(openseaLink);
        ethAddress = result.meta.owner;
        mainContainer.appendChild(menu);
        lookupNFT();
    }
    
    content.appendChild(addressesDiv);
    mainContainer.appendChild(content);
    modal = document.getElementById("modal");
    span = document.getElementsByClassName("close")[0];
    
    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function validate() {
    var input = document.getElementById('domain');
    var str = input.value;
    str = str.replace(/\s+/g, '-').toLowerCase();
    input.value = str;
}

function imageExists(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false);
    xhr.send();

    if (xhr.status == "404") {
        return false;
    } else {
        return true;
    }
}

function showNFTs() {
    const wallets = document.getElementById('walletsButton');
    const content = document.getElementById('content');
    const nfts = document.getElementById('nftsButton');
    cleanDOM(content);
    
    wallets.onclick = function() {showWallets()};
    nfts.onclick = "";
    wallets.className = 'menuItem';
    nfts.className = 'menuItem active';

    content.appendChild(nftsDiv);
}

function showWallets() {
    const wallets = document.getElementById('walletsButton');
    const content = document.getElementById('content');
    const nfts = document.getElementById('nftsButton');
    cleanDOM(content);
    
    nfts.onclick = function() {showNFTs()};
    wallets.onclick = "";
    wallets.className = 'menuItem active';
    nfts.className = 'menuItem';
    
    content.appendChild(addressesDiv);
}

function lookupNFT() {
    var address = getParameterByName('address');
    var url = 'https://api.opensea.io/api/v1/assets?owner=' + ethAddress + '&order_direction=desc&offset=0&limit=20';
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
            console.log(result.assets);
            processNFTs(result.assets);
        }
    };
    request.open("GET", url, true);
    request.send();
}

function processNFTs(result) {
    var numAssets = Object.keys(result).length;
    var address = getParameterByName('address');
    var domain = getParameterByName('domain');
    nftsDiv.className = "gallery";
    nftResult = result;
    
    for(var i = 0; i < numAssets; i++) {
        nftsDiv.appendChild(getNFT(result[i], i));
    }
}

function loadPage() {
    const footer = document.createElement('footer');
    footer.innerHTML = "<p>Made By <a href='./resolve.html?domain=cashpoor.crypto'>Cashpoor.crypto</a> | <a href='./about.html'>About</a></p>";
    document.body.appendChild(footer);
}

function toggleOwnerSectionInfo() {
    showOwnerSectionInfo = !showOwnerSectionInfo;
    var button = document.getElementById('ownerSectionToggle');
    var ownerSectionInfo = document.getElementById('ownerSectionInfo');
    
    if(showOwnerSectionInfo) {
        button.style.transform = "scaleY(-1)";
        ownerSectionInfo.style.display = "block";
    } else {
        button.style.transform = "scaleY(1)";
        ownerSectionInfo.style.display = "none";
    }
}

function showModal(index) {
    var content = document.getElementById("modal-body");
    cleanDOM(content);
    console.log(nftResult[index]);
    
    var creatorName;
    var creatorExists = true;
    
    try {
        if(nftResult[index].creator.user.username == "" || nftResult[index].creator.user.username == null) {
            creatorName = (nftResult[index].creator.address).substring(0, 12) + "...";
        } else {
            if((nftResult[index].creator.user.username).length > 15) {
                creatorName = (nftResult[index].creator.user.username).substring(0, 12) + "...";
            } else {
                creatorName = nftResult[index].creator.user.username;
            }
        }
    } catch (err) {
        try {
            creatorName = (nftResult[index].creator.address).substring(0, 12) + "...";
        } catch (err) {
            creatorExists = false;
        }
    }
    
    const modalNFTDiv = document.createElement('div');
    const nft = document.createElement("img");
    nft.src = nftResult[index].image_url;
    
    const nftInfo = document.createElement("div");
    nftInfo.className = "modal-info";
    const nftName = document.createElement("h2");
    nftName.innerHTML = nftResult[index].name;
    const nftCreator = document.createElement("p");
    if (creatorExists) {
        nftCreator.innerHTML = "Created By <a class='creatorLink' href='https://opensea.io/" + nftResult[index].creator.address + "' target='_blank'><img class='creatorImg' src='" + nftResult[index].creator.profile_img_url + "'>" + creatorName + "</a>";
    } else {
        nftCreator.innerHTML = "Created By <a class='creatorLink'>unknown</a>";
    }
    const nftDescription = document.createElement("p");
    const modalNFTLink = document.createElement("a");
    modalNFTLink.href = nftResult[index].permalink;
    modalNFTLink.target = "_blank";
    modalNFTLink.innerHTML = "<img class='opensea-logo-full'>";
    nftDescription.className = "modal-description";
    nftDescription.innerHTML = nftResult[index].description;
    nftInfo.appendChild(nftName);
    nftInfo.appendChild(nftCreator);
    nftInfo.appendChild(nftDescription);
    nftInfo.appendChild(modalNFTLink);
    modalNFTDiv.appendChild(nft);
    
    content.appendChild(nft);
    content.appendChild(nftInfo);
    
    if(enableNFTModal) {
        modal.style.display = "block";
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}