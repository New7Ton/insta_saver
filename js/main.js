var SIZE_PREVIEW_IMAGE_IN_PX = 90;
var SIZE_CURRENT_IMAGE_IN_PX = 300;

var ShiftFormCompleted = false;
var ImagesShown = false;
var RefArray = new Array();
var TotalNumLoadedImages = 0;
var preview = null;
var carouselItems = null;
var ArrayUrlsSelectedImages = new Array();
var VkSuccessInit = false;
var AlbumName = "InstaSaver";
var AlbumId = null;
var UrlUploadServer = null;
var ImagesFormData = new FormData();
var ImageBlob = null;
var LoadWasOnce = false;
var Btn1ModalClick = false;
var Btn2ModalClick = false;

var UrlStr = document.location.href;
var UrlParams = UrlStr.replace('?','').split('&').reduce(
	function(p,e){
		var a = e.split('=');
		p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
		return p;
	},
	{}
);

window.onload = function ()
{
	document.getElementById("modal").onchange = function() {
		var modalContent = document.getElementById("ModalContent");
		var childNodes = modalContent.getElementsByClassName("modal-content-button");
	
		var totalNumButtons = childNodes.length;
		
		for ( var nButton = 0; nButton < totalNumButtons; nButton++ )
		{
			modalContent.removeChild( childNodes[0] );
		}
	};
	
	VK.init(function() { 
	//	VK.callMethod("setTitle", "InstaSaver");
	//	VK.callMethod("showInstallBox");
		VK.callMethod("showSettingsBox", 4);
		VkSuccessInit = true;
		
	  }, function() { 
	  
		VkSuccessInit = false;
		 // API initialization failed 
		 // Can reload page here 
	}, '5.80'); 
}

function SaveSelectedImagesInVk()
{
	AlbumId = null;
	UrlUploadServer = null;
	
	GetAppAlbumId();
	CheckAndCreateAlbum();
	GetServerForLoadPhoto();
	UploadSelectedImages();
}

function ResetDataModalWindow(  )
{
	Btn1ModalClick = false;
	Btn2ModalClick = false;
}

function CreateModalWindow( labelModal, textModal, btnName1, btnName2 )
{
	if ( document.getElementById("modal").checked == false )
	{
		document.getElementById("LabelModal").innerHTML = labelModal;
		document.getElementById("TextModal").innerHTML = textModal;
		
		var newlabel = "";
		var modalContent = document.getElementById("ModalContent");
		
		if ( btnName1 != undefined)
		{
			newlabel = document.createElement("Label");
			newlabel.setAttribute("class", "modal-content-button");
			newlabel.setAttribute("for", "modal");
			newlabel.innerHTML = btnName1;
			newlabel.addEventListener("click", function() { Btn1ModalClick = true; }, false);
			modalContent.appendChild(newlabel);
		}
		
		if ( btnName2 != undefined)
		{
			newlabel = document.createElement("Label");
			newlabel.setAttribute("class", "modal-content-button");
			newlabel.setAttribute("for", "modal");
			newlabel.innerHTML = btnName2;
			newlabel.addEventListener("click", function() { Btn2ModalClick = true; }, false);
			modalContent.appendChild(newlabel);
		}
		
		if ( (btnName1 != undefined) && (btnName2 != undefined) )
		{
			newlabel = document.createElement("Label");
			newlabel.setAttribute("class", "modal-close");
			newlabel.setAttribute("for", "modal");
			newlabel.innerHTML = "&#10005;";
			modalContent.appendChild(newlabel);
		}
		
		document.getElementById("modal").checked = true;
		
		if ( (btnName1 === "undefined") && (btnName2 === "undefined") )
		{
			setTimeout( function() { document.getElementById("modal").checked = false; }, 1000 ); 
		}
	}
}

function UploadSelectedImages ()
{
	if( UrlUploadServer != null )
	{	
		for (var nImageUrl = 0; nImageUrl < ArrayUrlsSelectedImages.length; nImageUrl++ )
		{	
			UploadPhoto(ArrayUrlsSelectedImages[nImageUrl]);
		}
		
		CreateModalWindow( "Инфо", "Выбранные фото были сохранены в альбоме \"InstaSaver\"" );
	}
	else
	{
		setTimeout(UploadSelectedImages, "1");
	}
}

function GetAppAlbumId()
{
	if ( VkSuccessInit )
	{	
		$.ajax({
		  url: 'https://api.vk.com/method/photos.getAlbums?',
		  data: {
			owner_id: UrlParams["viewer_id"],
			v: 5.80,
			access_token: UrlParams["access_token"]
		  },
		  type: 'GET',
		  dataType: 'jsonp',
		  success: function(data) 
		  {
			var totalNumAlbums = data.response.count;
			var albumsArray = data.response.items;
			
			for (var i = 0; i < totalNumAlbums; i++)
			{
				if ( AlbumName == albumsArray[i]["title"] )
				{
					AlbumId = albumsArray[i]["id"];
				}
			}
			
			if (AlbumId == null)
			{
				AlbumId = -1;
			}
		}})
	}
	else
	{
		setTimeout(GetAppAlbumId, "1");
	}
}

function ProcessAlbumCreateDescision() 
{
	if( (Btn1ModalClick != false) || (Btn2ModalClick != false) ) 
	{
		if ( Btn1ModalClick == true )
		{
			CreateModalWindow( "Внимание!", "Выбранные фото не были сохранены в альбом ВК" );
		}
		else if ( Btn2ModalClick == true )
		{
			//CreateAlbum();
		}
			
		ResetDataModalWindow( );
		return;
	}
	else
	{
		setTimeout(ProcessAlbumCreateDescision, 50);//wait 50 millisecnds then recheck
	}
}

function CheckAndCreateAlbum()
{
	if (AlbumId != null)
	{	
		if ( AlbumId == -1 )
		{
			CreateModalWindow( "Внимание!", "Для сохранения фото будет создан альбом \"InstaSaver\". Продолжить?", "Отмена", "Ок" );
			ProcessAlbumCreateDescision();
		}
	}
	else
	{
		setTimeout(CheckAndCreateAlbum, "1");
	}
}

function GetServerForLoadPhoto()
{
	if ( (AlbumId != null) && (AlbumId != -1) )
	{
		$.ajax({
		  url: 'https://api.vk.com/method/photos.getUploadServer?',
		  data: {
			album_id: AlbumId,
			v: 5.80,
			access_token: UrlParams["access_token"]
		  },
		  type: 'GET',
		  dataType: 'jsonp',
		  success: function(data) {
			UrlUploadServer = data.response.upload_url;
		}})
	}
	else
	{
		setTimeout(GetServerForLoadPhoto, "1");
	}
}

function UploadPhoto( photoUrl )
{		
	var encodeUri = encodeURIComponent(UrlUploadServer);
	var someObj = {url:encodeUri, photo:photoUrl};
	var xhr = new XMLHttpRequest();			
	xhr.open('POST', 'php/scratch.php');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');			
	xhr.send('param=' + JSON.stringify(someObj));
	xhr.onreadystatechange = function()
	{
	  if (this.readyState == 4) 
	  {
		if (this.status == 200)
		{
		  console.log(xhr.responseText);
		  
		  var jsonResp = JSON.parse(xhr.responseText);
		  
			$.ajax({
			url: 'https://api.vk.com/method/photos.save?',
			data: {
				server: jsonResp["server"],
				photos_list: jsonResp["photos_list"],
				album_id: jsonResp["aid"],
				hash: jsonResp["hash"],
				v: 5.80,
				access_token: UrlParams["access_token"]
			},
			type: 'GET',
			dataType: 'jsonp',
			success: function(data) 
			{
				var success = null;
			}})
		}
		else
		{
		  console.log('ajax error');
		}
	  }
	};
}
	
function CreateAlbum()
{			
	$.ajax({
	  url: 'https://api.vk.com/method/photos.createAlbum?',
	  data: {
		title: AlbumName,
		v: 5.80,
		access_token: UrlParams["access_token"]
	  },
	  type: 'GET',
	  dataType: 'jsonp',
	  success: function(data) 
	  {
		AlbumId = data.response.id;
	}})
}

function SaveImage (imgUrl)
{
	var xhr = new XMLHttpRequest();

	xhr.responseType = 'blob'; //Set the response type to blob so xhr.response returns a blob
	xhr.open('GET', imgUrl , true);

	xhr.onreadystatechange = function () 
	{
		if (xhr.readyState == xhr.DONE) 
		{
			var fileName = GetFileNameFromUrl(xhr.responseURL);
			saveAs(xhr.response, fileName);
		}
	};

	xhr.send(); //Request is sent

}

function GetImageBlob (imgUrl)
{
	var xhr = new XMLHttpRequest();

	xhr.responseType = 'arraybuffer'; //Set the response type to blob so xhr.response returns a blob
	xhr.open('GET', imgUrl , true);

	xhr.onreadystatechange = function () 
	{
		if (xhr.readyState == xhr.DONE) 
		{
			ImageBlob = new Blob([xhr.response], {type: "image/png"});
		}
	};

	xhr.send(); //Request is sent

}

function GetFileNameFromUrl(Url)
{		
	var urlStr = Url;
	var massSubStringsUrl = urlStr.split("/");
	var tmpFileName = massSubStringsUrl[massSubStringsUrl.length - 1];
	var massSubStringsUrl = tmpFileName.split("jpg");
	var fileName = massSubStringsUrl[0] + "jpg";
	
	return fileName;
}

function SaveSelectedImages()
{
	for (var i = 0; i < ArrayUrlsSelectedImages.length; i++)
	{
		SaveImage( ArrayUrlsSelectedImages[i] );
	}
}

function Reset()
{
	ImagesShown = false;
	TotalNumLoadedImages = 0;
	RefArray.length = 0;
	DeleteAllImagesFromDiv("loadBox");
	ArrayUrlsSelectedImages = new Array();
}

function TotalReset()
{
	ImagesShown = false;
	TotalNumLoadedImages = 0;
	RefArray.length = 0;
	DeleteAllImagesFromDiv("loadBox");
	ArrayUrlsSelectedImages = new Array();
	ResetShiftForm(this.form);
	
	var loadBox = document.getElementById("loadBox");
	var numChilds = loadBox.children.length;
	
	for ( var nChild = 0; nChild < numChilds; nChild++ )
	{
		loadBox.removeChild( loadBox.firstChild );
	}
}

function ProcessButtonClick(form)
{			
	if ( form.elements.url.value == "" )
	{
		CreateModalWindow( "Ошибка!", "Отсутствует ссылка на изображения instagram!", "Ок" );
		ResetDataModalWindow( );
		return;
	}
	
	if (LoadWasOnce == false)
	{
		ShiftForm(form);
		LoadWasOnce = true;
	}
	else
	{	
		$( ".elastislide-wrapper.elastislide-horizontal" ).remove();
		$( ".elastislide-carousel" ).remove();
		$( ".image-preview" ).remove();
	}
	
	gallaryEl = document.getElementsByClassName('gallery' );
	
	var ulCarousel = document.createElement('ul');
	ulCarousel.setAttribute('id','carousel');
	ulCarousel.setAttribute('class','elastislide-list');
	gallaryEl[0].appendChild(ulCarousel);
	
	var divPreview = document.createElement('div');
	divPreview.setAttribute('id','firstImage');
	divPreview.setAttribute('class','image-preview');
	gallaryEl[0].appendChild(divPreview);
	
	Reset();
	AddLoadImage();
	UpdateImageViewer();
	ProcessUrl(form);
	ShowImages();
}

function changeImage( el, pos ) 
{
	preview.attr( 'src', el.data( 'preview' ) );
	carouselItems.removeClass( 'current-img' );
	el.addClass( 'current-img' );
	carousel.setCurrent( pos );
}

function UpdateImageViewer()
{	
	if ( ImagesShown )
	{							
		// example how to integrate with a previewer
		var current = 0;
		preview = $( '#preview' );
		$carouselEl = $( '#carousel' );
		carouselItems = $carouselEl.children();
		carousel = $carouselEl.elastislide( 
			{
				current : current,
				minItems : 4,
				onClick : function( el, pos, evt ) 
				{
					if ( (evt.srcElement.parentElement.className == 'checkmark')|| (evt.srcElement.className == 'checkmark') )
					{
						var curImgUrl = evt.srcElement.parentElement.attributes.imgurl.nodeValue;
						var indexCurElement = ArrayUrlsSelectedImages.indexOf(curImgUrl);
						if ( indexCurElement == -1)
						{
							ArrayUrlsSelectedImages.push(curImgUrl);
							evt.srcElement.parentElement.children[0].setAttribute( "class", "checkmark_circle_non_opacity");

						}
						else
						{
							ArrayUrlsSelectedImages.splice(indexCurElement, 1);
							evt.srcElement.parentElement.children[0].setAttribute( "class", "checkmark_circle_opacity");
						}
					}
					else
					{
						changeImage( el, pos );
						evt.preventDefault();
					}
					
				},
				onReady : function() 
				{
					changeImage( carouselItems.eq( current ), current );
				}
			} );
	}
	else
	{
		setTimeout(UpdateImageViewer, "1");
	}
}

function ShowImages()
{
	if ( ShiftFormCompleted && (RefArray.length != 0) && (TotalNumLoadedImages == RefArray.length) )
	{	
		DeleteAllImagesFromDiv("loadBox");
		
		for (var i = 0; i < RefArray.length; i++)
		{
			document.getElementById("carousel").appendChild(RefArray[i]);
			
			if (i == 0)
			{
				var imgObj = new Image();
				imgObj.src = RefArray[i].firstChild.firstChild.src;
				imgObj.setAttribute("id", "preview");
				imgObj.style.width = SIZE_CURRENT_IMAGE_IN_PX + "px";
				document.getElementById("firstImage").appendChild(imgObj);
			}
		}

		ImagesShown = true;
	}
	else
	{
		setTimeout(ShowImages, "1");
	}
}

function AddLoadImage()
{
	if ( ShiftFormCompleted )
	{			
		var imgObj = new Image();
		imgObj.src = "2.gif";
		document.getElementById("loadBox").appendChild(imgObj);
	}
	else
	{
		setTimeout(AddLoadImage, "1");
	}
}

var TimeoutsShiftForm = [];	
function ShiftForm(form) 
{
	var inputElems = document.getElementById('inputBox');
	
	var curTopVal = getComputedStyle(inputElems).top;
	var curTopValInt = parseInt(curTopVal);
	
	if( curTopValInt > 10 )
	{
		curTopValInt -= 3;
		inputElems.style.top = (curTopValInt + "px");
		TimeoutsShiftForm.push( setTimeout(ShiftForm, "1") );
	}
	else if ( curTopValInt < 140 )
	{
		ClearTimeoutsShiftForm();
		ShiftFormCompleted = true;
	}
}

function ClearTimeoutsShiftForm() 
{
	for (var i = 0; i < TimeoutsShiftForm.length; i++) 
	{
		clearTimeout( TimeoutsShiftForm[i] );
	}
}

function ResetShiftForm(form) 
{
	ClearTimeoutsShiftForm();
	
	var inputElems = document.getElementById('inputBox');
	
	var curTopVal = getComputedStyle(inputElems).top;
	var curTopValInt = parseInt(curTopVal);
	
	if( curTopValInt < 230 )
	{
		curTopValInt += 3;
		inputElems.style.top = (curTopValInt + "px");
		setTimeout(ResetShiftForm, "1");
	}
}

function ProcessUrl(form) 
{
	var url = form.elements.url.value;
	GetSiteData(url);
}

function GetSiteData(url)
{
	var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;

	var xhr = new XHR();

	xhr.open("GET", url, true);

	xhr.onload = function() 
	{
	  ParseSiteInfo( this.responseText );
	}

	xhr.onerror = function() 
	{
		CreateModalWindow( "Ошибка!", "Указана некорректная ссылка!", "Ок" );
		ResetDataModalWindow( );
	}

	xhr.send();
}

function ParseSiteInfo( srcSiteInfo )
{
	var targetStartPos = "display_url\":\"";
	var targetFinishPos = ["\",\"display_resources", "\\"];
	
	var curPos = 0;
	var curStartPos = 0;
	var finishPos = 10000000;
	
	var cntTotalNumImgs = 0;
	
	while (true) 	
	{
		curStartPos = srcSiteInfo.indexOf(targetStartPos, curPos);
		curPos = curStartPos + 1; 
		
		if (curStartPos == -1) 
		{
			break;
		}
		
		cntTotalNumImgs++;
		if (cntTotalNumImgs == 2)
		{
			continue;
		}
		
		finishPos = 10000000;
		for ( var curNumTargetFinish = 0; curNumTargetFinish < targetFinishPos.length; curNumTargetFinish++ )
		{
			var curFinishPos = srcSiteInfo.indexOf(targetFinishPos[curNumTargetFinish], curStartPos);				
			if (curFinishPos == -1)
			{
				continue;
			}
		
			if ( curFinishPos < finishPos )
			{
				finishPos = curFinishPos;
			}
		}
		
		if ( finishPos == 1000 )
		{
			continue;
		}
		
		var finalStartPosString = curStartPos + targetStartPos.length;
		var finalFinishPosString = finishPos;
		
		var urlCurImgInSet = srcSiteInfo.substring( finalStartPosString, finalFinishPosString );
		
		AddImage( urlCurImgInSet );
	}
	
	if ( RefArray.length == 0 )
	{
		TotalReset();
		CreateModalWindow( "Ошибка!", "По данной ссылке на найдены изображения!", "Ок" );
		ResetDataModalWindow( );
	}
}

function AddImage( imgUrl )
{
	var imgObj = new Image();
	imgObj.onload = function(){ TotalNumLoadedImages++; }
	imgObj.src = imgUrl;
	imgObj.style.width = SIZE_PREVIEW_IMAGE_IN_PX + "px";
	
	var spanImageSelecter = document.createElement('span');
	spanImageSelecter.setAttribute('class', 'checkmark');
	spanImageSelecter.setAttribute('imgUrl', imgUrl);
	
	var divSelecterCircle = document.createElement('div');
	divSelecterCircle.setAttribute('class', 'checkmark_circle_opacity');
	spanImageSelecter.appendChild(divSelecterCircle);
	
	var divSelecterStem = document.createElement('div');
	divSelecterStem.setAttribute('class', 'checkmark_stem');
	spanImageSelecter.appendChild(divSelecterStem);
	
	var divSelecterKick = document.createElement('div');
	divSelecterKick.setAttribute('class', 'checkmark_kick');
	spanImageSelecter.appendChild(divSelecterKick);
	
	var divImage = document.createElement('div');
	divImage.setAttribute('class', 'ImageDiv');
	divImage.appendChild(imgObj);
	
	var divImageBlock = document.createElement('div');
	divImageBlock.setAttribute('class', 'ImageSelectViewerContainer');
	divImageBlock.appendChild(divImage);
	divImageBlock.appendChild(spanImageSelecter);
	
	var newlink = document.createElement('a');
	newlink.setAttribute('href', "#");
	newlink.appendChild(divImageBlock);
	
	var newLi = document.createElement('li');
	newLi.setAttribute('data-preview', imgUrl);
	newLi.appendChild(newlink);
	
	RefArray.push(newLi);
}

function DeleteAllImagesFromDiv(divName)
{
	var imgSet = document.getElementById(divName);
	
	while(imgSet.firstChild) 
	{
		imgSet.removeChild(imgSet.firstChild);
	}
}
	